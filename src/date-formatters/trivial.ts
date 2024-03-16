import type { DateFormatter } from "./date-formatter";

export const trivial: DateFormatter = (date = new Date()) => date.toString();
