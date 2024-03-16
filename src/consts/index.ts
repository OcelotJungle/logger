export const LEVELS = ["dev", "info", "warn", "error"] as const;
export const FILE_LEVELS = ["common", ...LEVELS] as const;
