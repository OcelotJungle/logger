import type { Stream } from "./streams";
import type {
    DateFormatter,
    LevelSettings,
    LogOptions,
    LogLevel,
    BaseConstructorArguments,
    LoggerConstructorArguments,
    OptionsConstructorArguments,
    ConstructorArguments,
    WithConsoleOptions,
    WithFilesOptions,
} from "./types";

import fs from "fs";
import path from "path";
import util from "util";
import { ConsoleStream, FileStream } from "./streams";
import * as DateFormatters from "./date-formatters";
import { FILE_LEVELS, LEVELS } from "./consts";

export class Logger {
    private static readonly START_TIME = DateFormatters.fsFriendly();
    private static lastIndex = 0;

    private readonly names: string[] = [];
    private readonly levels: LevelSettings;
    private readonly streams: Stream[] = [];

    private readonly getNowText: DateFormatter;

    private readonly unite: boolean;
    private readonly defaultLogOptions: Partial<LogOptions>;

    constructor(name?: string);
    /** Usually for internal (`sub`) use, but can be used manually. */
    constructor(args: BaseConstructorArguments & LoggerConstructorArguments);
    constructor(args: BaseConstructorArguments & OptionsConstructorArguments);
    constructor(arg?: string | ConstructorArguments) {
        const args = (arg && typeof arg === "object") ? arg : { name: arg } as ConstructorArguments;

        this.unite = args.unite ?? false;

        if ("logger" in args) {
            const { names, levels: level, getNowText, streams, defaultLogOptions } = args.logger;

            this.names.push(...names);

            this.levels = level;
            this.getNowText = getNowText;

            this.defaultLogOptions = defaultLogOptions;

            for (const stream of streams) {
                this.streams.push(stream.copy());
            }
        }
        else {
            const { levels, dateFormatter = "iso-z" } = args.options ?? {};

            this.levels = {} as LevelSettings;

            if (typeof levels === "string") {
                let enabled = true;

                for (let i = LEVELS.length - 1; i >= 0; i--) {
                    this.levels[LEVELS[i]!] = enabled;
                    if (LEVELS[i] === levels) enabled = false;
                }
            }
            else {
                for (const level of LEVELS) {
                    this.levels[level] = levels?.[level] ?? true;
                }
            }

            if (typeof dateFormatter === "function") this.getNowText = dateFormatter;
            else switch (dateFormatter) {
                case "iso-local":
                    this.getNowText = DateFormatters.isoLocal;
                    break;

                case "iso-z":
                    this.getNowText = DateFormatters.isoZ;
                    break;

                case "fs-friendly":
                    this.getNowText = DateFormatters.fsFriendly;
                    break;

                default:
                    this.getNowText = DateFormatters.trivial;
                    break;
            }

            this.defaultLogOptions = {};
        }

        this.names.push(args.name ?? `#${Logger.lastIndex++}`);

        this.defaultLogOptions = {
            ...this.defaultLogOptions,
            ...args.defaultLogOptions,
        };
    }

    /**
     * Adds console output.
     */
    withConsole({ console = global.console }: WithConsoleOptions = {}) {
        this.streams.push(new ConsoleStream(console));

        return this;
    }

    /**
     * Adds file output.
     */
    withFiles({
        folder = "logs",
        name = "",
        extension = "log",
        levels = {},
    }: WithFilesOptions = {}) {
        const root = path.isAbsolute(folder) ? folder : path.join(process.cwd(), folder);
        const logPath = path.join(root, Logger.START_TIME);

        fs.mkdirSync(logPath, { recursive: true });

        const enabledLevels: string[] = [];

        if (typeof levels === "string") {
            for (const level of [...FILE_LEVELS].reverse()) {
                enabledLevels.push(level);

                if (level === levels) break;
            }
        }
        else {
            for (const level of FILE_LEVELS) {
                if (levels[level] ?? true) enabledLevels.push(level);
            }
        }

        for (const level of enabledLevels) {
            const suffix = level !== "common" ? `.${level}` : "";
            const fileName = `${name}${suffix}.${extension}`;

            this.streams.push(
                new FileStream(
                    level,
                    path.join(logPath, fileName),
                ),
            );
        }

        return this;
    }

    private write() {
        for (const stream of this.streams) {
            stream.flush();
        }
    }

    private output(level: LogLevel, data: unknown, options?: LogOptions) {
        if (!this.levels[level]) return;

        const text = this.textify(data, options);
        const levelLabel = level[0]!.toUpperCase();
        const now = this.getNowText();
        const stack = this.names.join("; ");

        const message = `[${now}] |${levelLabel}| (${stack}) ::: ${text}`;

        for (const stream of this.streams) {
            if (
                stream instanceof ConsoleStream
                || (
                    stream instanceof FileStream
                    && ["common", level].includes(stream.level)
                )
            ) {
                stream.write(message);
            }
        }

        if (!this.unite) this.write();
    }

    private textify(data: unknown, options?: LogOptions) {
        const _options = { ...this.defaultLogOptions, ...options };

        switch (typeof data) {
            case "string":
            case "number":
            case "boolean":
                return data.toString();
            default:
                return util.inspect(data, _options);
        }
    }

    dev(data: unknown, options?: LogOptions) {
        this.output("dev", data, options);

        return this;
    }

    info(data: unknown, options?: LogOptions) {
        this.output("info", data, options);

        return this;
    }

    warn(data: unknown, options?: LogOptions) {
        this.output("warn", data, options);

        return this;
    }

    error(data: unknown, options?: LogOptions) {
        this.output("error", data, options);

        return this;
    }

    /**
     * Releases all stored logs (see `ConstructorArguments.unite`).
     */
    end() {
        this.write();

        return this;
    }

    /**
     * Creates sublogger with all options from current logger,
     * but name stack will be extended with one new name.
     */
    sub(
        name?: string,
        unite?: boolean,
        defaultLogOptions = this.defaultLogOptions,
    ) {
        return new Logger({
            name,
            logger: this,
            unite,
            defaultLogOptions,
        });
    }

    /**
     * Returns logger itself and bound variants of all useful functions
     */
    bound(this: Logger) {
        return {
            logger: this,
            dev: this.dev.bind(this),
            info: this.info.bind(this),
            warn: this.warn.bind(this),
            error: this.error.bind(this),
            end: this.end.bind(this),
            sub: this.sub.bind(this),
        };
    }
}
