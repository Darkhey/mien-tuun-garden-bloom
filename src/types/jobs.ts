export interface CronJobFunctionPayload {
  target_table?: string;
  [key: string]: unknown;
}
