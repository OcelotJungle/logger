import type { InspectOptions } from "util";

export type LogOptions = Omit<InspectOptions, "depth"> & {
    /**
     * Specifies the number of times to recurse while formatting object.
     * This is useful for inspecting large objects.
     * To recurse up to the maximum call stack size pass `Infinity` or `null`.
     * @default null
     */
    depth?: number | null | undefined;
};
