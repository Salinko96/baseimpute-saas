import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function matchSHCode(clientId: string, inputSH: string) {
  // 1. Try to find an exact match in the Client's own SH Base
  const clientBase = await prisma.clientSHBase.findUnique({
    where: {
      clientId_shCode: {
        clientId,
        shCode: inputSH,
      },
    },
  });

  if (clientBase) {
    return {
      matched: true,
      source: 'CLIENT_BASE',
      shCode: clientBase.shCode,
      description: clientBase.description,
    };
  }

  // 2. Fallback: Try to match against the active TEC version
  const activeTEC = await prisma.tECVersion.findFirst({
    where: { isActive: true },
  });

  if (!activeTEC) {
    throw new Error('No active TEC version found. Please activate one in the management UI.');
  }

  const tecRate = await prisma.tECRate.findUnique({
    where: {
      tecVersionId_nts: {
        tecVersionId: activeTEC.id,
        nts: inputSH,
      },
    },
  });

  if (tecRate) {
    return {
      matched: true,
      source: 'TEC',
      shCode: tecRate.nts,
      description: tecRate.description,
      rates: {
        duty: tecRate.dutyRate,
        stat: tecRate.statRate,
        other: tecRate.otherRate,
      },
    };
  }

  return {
    matched: false,
    source: 'NONE',
    shCode: inputSH,
    description: 'Not found in Client Base or TEC',
  };
}
