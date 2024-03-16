import type { DateFormatter } from "./date-formatter";

export const fsFriendly: DateFormatter = (date = new Date()) => {
    return date
        .toISOString()
        .replace(/[-:Z.]/g, "")
        .replace("T", "-");
};
