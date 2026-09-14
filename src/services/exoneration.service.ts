import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function applyExoneration(clientId: string, lineId: string, currentTotal: number) {
  // Find applicable exoneration rules for this client
  const rules = await prisma.exemptionRule.findMany({
    where: {
      clientId,
      startDate: { lte: new Date() },
      OR: [
        { endDate: { gte: new Date() } },
        { endDate: null },
      ],
    },
  });

  if (rules.length === 0) return currentTotal;

  // Simplification: Use the most favorable rule (highest reduction)
  // In reality, rules would be linked to specific SH codes or types of goods.
  let maxReduction = 0;
  rules.forEach(rule => {
    // Assuming ruleCode contains a percentage or fixed amount reduction
    // Mock: if ruleCode starts with 'PERC-', it's a percentage reduction
    if (rule.ruleCode.startsWith('PERC-')) {
      const perc = parseFloat(rule.ruleCode.replace('PERC-', ''));
      const reduction = currentTotal * (perc / 100);
      if (reduction > maxReduction) maxReduction = reduction;
    }
  });

  return Math.max(0, currentTotal - maxReduction);
}
