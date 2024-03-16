import type { DateFormatter } from "./date-formatter";

const pad = (n: number, length = 2) => n.toString().padStart(length, "0");

const getZ = (timezoneOffsetMinutes: number) => {
    const sign = timezoneOffsetMinutes < 0 ? "+" : "-";

    const offset = Math.abs(timezoneOffsetMinutes);
    const hours = Math.floor(offset / 60);
    const minutes = offset % 60;

    return `${sign}${pad(hours)}:${pad(minutes)}`;
};

export const isoLocal: DateFormatter = (date = new Date()) => {
    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());

    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const SSS = pad(date.getMilliseconds(), 3);

    const Z = getZ(date.getTimezoneOffset());

    return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}.${SSS}${Z}`;
};
