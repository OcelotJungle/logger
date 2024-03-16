import type { DateFormatter } from "./date-formatter";

export const isoZ: DateFormatter = (date = new Date()) => date.toISOString();
