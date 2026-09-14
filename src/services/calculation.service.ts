import { PrismaClient } from '@prisma/client';
import { matchSHCode } from './matching.service';

const prisma = new PrismaClient();

export interface CalculationResult {
  dutyAmount: number;
  statAmount: number;
  otherAmount: number;
  totalTax: number;
  matchedSH: string;
  source: string;
}

export async function calculateLineTaxes(clientId: string, lineId: string) {
  const line = await prisma.folderLine.findUnique({
    where: { id: lineId },
  });

  if (!line) throw new Error('Line not found');

  // 1. Match the SH code to get rates
  const match = await matchSHCode(clientId, line.shCode);

  if (!match.matched) {
    throw new Error(`SH Code ${line.shCode} not found in TEC or Client Base`);
  }

  const rates = match.rates || { duty: 0, stat: 0, other: 0 };
  const cif = line.cifValue;

  // 2. Base calculation: CIF * Rate
  const dutyAmount = cif * (rates.duty / 100);
  const statAmount = cif * (rates.stat / 100);
  const otherAmount = cif * (rates.other / 100);
  const totalTax = dutyAmount + statAmount + otherAmount;

  // 3. Handle Exonerations (Simplification: check if line.isExempt)
  let finalTotal = totalTax;
  if (line.isExempt) {
    finalTotal = 0; // Full exoneration for now
  }

  // Update the line in DB
  const oldLine = await prisma.folderLine.findUnique({ where: { id: lineId } });

  await prisma.folderLine.update({
    where: { id: lineId },
    data: {
      dutyAmount,
      statAmount,
      otherTaxes: otherAmount,
      totalAmount: finalTotal,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: 'system', // In production, use session user id
      action: 'CALCULATE_TAXES',
      entityId: lineId,
      entityType: 'FolderLine',
      oldValue: oldLine,
      newValue: { dutyAmount, statAmount, otherTaxes: otherAmount, totalAmount: finalTotal },
    },
  });

  return {
    dutyAmount,
    statAmount,
    otherAmount,
    totalTax: finalTotal,
    matchedSH: match.shCode,
    source: match.source,
  };

}
