import type { FileLogLevel } from ".";

export type WithFilesOptions = {
    /**
     * @default "logs"
     */
    folder?: string | undefined;

    /**
     * @default ""
     */
    name?: string | undefined;

    /**
     * @default "log"
     */
    extension?: string | undefined;

    /**
     * @default all enabled
     */
    levels?: Partial<Record<FileLogLevel, boolean>> | FileLogLevel | undefined;
};
