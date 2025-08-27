export enum HealthStatus {
  Critical = 'critical',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Full = 'full',
}

export const calculateHealthStatus = (healthPercentage: number): HealthStatus => {
  if (healthPercentage === 100) return HealthStatus.Full;
  if (healthPercentage > 75) return HealthStatus.High;
  if (healthPercentage > 50) return HealthStatus.Medium;
  if (healthPercentage > 25) return HealthStatus.Low;
  return HealthStatus.Critical;
};