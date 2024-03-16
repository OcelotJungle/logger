import type { LogOptions } from "..";

export type BaseConstructorArguments = {
    name?: string | undefined;

    /**
     * When `true`, stores logs into internal buffer,
     * and releases them at the same time on `end()`.
     */
    unite?: boolean | undefined;

    defaultLogOptions?: Partial<LogOptions> | undefined;
};
