export const PROFESSOR_RATE = 0.7;
export const PLATFORM_RATE = 0.3;

export interface CommissionResult {
  professorCommission: number;
  platformCommission: number;
}

export function calculateCommission(amount: number): CommissionResult {
  const professorCommission = Math.round(amount * PROFESSOR_RATE * 100) / 100;
  const platformCommission = Math.round(amount * PLATFORM_RATE * 100) / 100;
  return { professorCommission, platformCommission };
}
