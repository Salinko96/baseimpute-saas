import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TECRow {
  position: string;
  nts: string;
  description: string;
  unit: string;
  dutyRate: number;
  statRate: number;
  otherRate: number;
}

export async function parseTECFile(filePath: string, versionName: string) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = 'tarif2017';
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet ${sheetName} not found in the TEC file.`);
  }

  // Convert sheet to JSON array of arrays (raw data)
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const importedRows: TECRow[] = [];

  // Column mapping varies, so we search for keywords in the header lines
  // Typical columns: N° de position, N.T.S., Désignation, U.S., D.D., R.S., P.C.I.
  let colMap: Record<string, number> = {};

  for (const row of data) {
    if (!row || row.length === 0) continue;

    // Detect header row
    const rowStr = row.join(' ');
    if (rowStr.includes('N.T.S.') && rowStr.includes('Droit de Douane')) {
      colMap = {
        position: row.findIndex(cell => String(cell).includes('position')),
        nts: row.findIndex(cell => String(cell).includes('N.T.S.')),
        description: row.findIndex(cell => String(cell).includes('Désignation')),
        unit: row.findIndex(cell => String(cell).includes('U.S.')),
        dutyRate: row.findIndex(cell => String(cell).includes('D.D.')),
        statRate: row.findIndex(cell => String(cell).includes('R.S.')),
        otherRate: row.findIndex(cell => String(cell).includes('P.C.I.')),
      };
      continue;
    }

    // Skip lines that are purely noise or separators
    if (rowStr.includes('_________') || rowStr.trim() === '') continue;

    // A valid product line usually has a NTS code (e.g., 0101.21.00.00)
    const ntsCell = row[colMap.nts];
    if (!ntsCell || !/\\d{4}\\.\\d{2}\\.\\d{2}\\.\\d{2}/.test(String(ntsCell))) {
      continue;
    }

    try {
      importedRows.push({
        position: String(row[colMap.position] || ''),
        nts: String(ntsCell).trim(),
        description: String(row[colMap.description] || '').trim(),
        unit: String(row[colMap.unit] || '').trim(),
        dutyRate: parsePercentage(row[colMap.dutyRate]),
        statRate: parsePercentage(row[colMap.statRate]),
        otherRate: parsePercentage(row[colMap.otherRate]),
      });
    } catch (e) {
      console.warn(`Skipping row due to error: ${e}, row: ${rowStr}`);
    }
  }

  // 1. Create TEC Version
  const tecVersion = await prisma.tECVersion.create({
    data: {
      versionName,
      sourceFile: filePath,
      isActive: true,
    },
  });

  // 2. Import rates in batches to avoid database overload
  const batchSize = 500;
  for (let i = 0; i < importedRows.length; i += batchSize) {
    const batch = importedRows.slice(i, i + batchSize).map(row => ({
      tecVersionId: tecVersion.id,
      position: row.position,
      nts: row.nts,
      description: row.description,
      unit: row.unit,
      dutyRate: row.dutyRate,
      statRate: row.statRate,
      otherRate: row.otherRate,
    }));

    await prisma.tECRate.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  return {
    versionId: tecVersion.id,
    count: importedRows.length,
  };
}

function parsePercentage(value: any): number {
  if (value === undefined || value === null || value === '') return 0;
  const str = String(value).replace('%', '').replace(',', '.').trim();
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}
