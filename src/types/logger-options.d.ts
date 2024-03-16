import type {
    DateFormatter,
    LevelSettings,
    LogLevel,
} from ".";

type DateFormatterNameOrFunction =
    | "trivial"
    | "iso-z"
    | "iso-local"
    | "fs-friendly"
    | DateFormatter;

export type LoggerOptions = {
    dateFormatter?: DateFormatterNameOrFunction | undefined;
    levels?: LogLevel | Partial<LevelSettings> | undefined;
};
