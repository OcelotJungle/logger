import util from "util";
import path from "path";
import fs from "fs";
import { Logger } from "../src";
import { FileStream } from "../src/streams";
import * as DF from "../src/date-formatters";

function mockConsole1() {
    const logs: string[] = [];

    return {
        logs,
        console: {
            ...console,
            log(data: string) {
                logs.push(data);
            },
        },
    };
}

function mockConsoleN() {
    const logs: string[][] = [];

    return {
        logs,
        console: {
            ...console,
            log(...data: string[]) {
                logs.push(data);
            },
        },
    };
}

describe("Logger", () => {
    test("levelles with string", () => {
        // @ts-expect-error Private field
        const levels = new Logger({ options: { levels: "warn" } }).levels;

        expect(levels).toEqual({ dev: false, info: false, warn: true, error: true });
    });

    describe("Date Formatters", () => {
        test("accepts function", () => {
            // @ts-expect-error Private field
            expect(new Logger({ options: { dateFormatter: () => "no date..." } }).getNowText())
                .toBe("no date...");
        });

        test("selects iso-local", () => {
            // @ts-expect-error Private field
            expect(new Logger({ options: { dateFormatter: "iso-local" } }).getNowText).toBe(DF.isoLocal);
        });

        test("selects fs-friendly", () => {
            // @ts-expect-error Private field
            expect(new Logger({ options: { dateFormatter: "fs-friendly" } }).getNowText).toBe(DF.fsFriendly);
        });

        test("selects trivial", () => {
            // @ts-expect-error Private field
            expect(new Logger({ options: { dateFormatter: "__" } }).getNowText).toBe(DF.trivial);
        });
    });

    test("inspects", () => {
        const { logs, console } = mockConsoleN();

        new Logger()
            .withConsole({ console })
            .dev({ foo: 42 });

        const log = logs[0]?.[0];

        expect(typeof log).toBe("string");
        expect((log as string).includes("{ foo: 42 }")).toBe(true);
    });

    test("outputs", () => {
        const { logs, console } = mockConsole1();

        new Logger()
            .withConsole({ console })
            .dev("__! 1 dev")
            .info("__! 2 info")
            .warn("__! 3 warn")
            .error("__! 4 error");

        expect(logs.map(log => log.split("__! ")[1] ?? log))
            .toEqual(["1 dev", "2 info", "3 warn", "4 error"]);
    });

    test("no outputs on disabled level", () => {
        const { logs, console } = mockConsole1();

        new Logger({ options: { levels: { dev: false } } })
            .withConsole({ console })
            .dev("foo")
            .info("bar")
            .warn("baz")
            .error("buz");

        expect(logs).toHaveLength(3);
        expect(logs.includes("foo")).toBe(false);
    });

    test("unites", () => {
        const { logs, console } = mockConsole1();

        const { end } = new Logger({ unite: true })
            .withConsole({ console })
            .dev("foo")
            .info("bar")
            .bound();

        expect(logs).toHaveLength(0);

        end();

        expect(logs).toHaveLength(2);
    });

    test("subs", () => {
        expect(new Logger().withConsole().sub()).toBeInstanceOf(Logger);
    });

    test("bounds", () => {
        const { logs, console } = mockConsole1();

        new Logger()
            .withConsole({ console })
            .bound()
            .dev("foo");

        expect(logs).toHaveLength(1);
    });

    describe("File output", () => {
        test("outputs", async () => {
            const folder = "__test__logs__o";
            const dir = path.join(process.cwd(), folder);

            const l = new Logger().withFiles({ folder });

            l.dev("foo");

            // @ts-expect-error Private field
            for (const stream of l.streams) {
                if (!(stream instanceof FileStream)) continue;

                // @ts-expect-error Private field
                await util.promisify(stream.stream.close.bind(stream.stream))();
            }

            // @ts-expect-error Private field
            const currentDir = path.join(dir, Logger.START_TIME);

            const contents = fs.readFileSync(path.join(currentDir, ".log"), "utf-8");
            const contentsDev = fs.readFileSync(path.join(currentDir, ".dev.log"), "utf-8");

            expect(contents.split("\n")[0]?.endsWith("foo")).toBe(true);
            expect(contentsDev.split("\n")[0]?.endsWith("foo")).toBe(true);

            fs.rmSync(dir, { recursive: true, force: true });
        });

        test("levelles with string", async () => {
            const folder = "__test__logs__lws";
            const dir = path.join(process.cwd(), folder);

            const l = new Logger().withFiles({ folder, levels: "warn" });

            // @ts-expect-error Private field
            for (const stream of l.streams) {
                if (!(stream instanceof FileStream)) continue;

                // @ts-expect-error Private field
                await util.promisify(stream.stream.close.bind(stream.stream))();
            }

            // @ts-expect-error Private field
            const logs = fs.readdirSync(path.join(dir, Logger.START_TIME));

            expect(logs).toHaveLength(2);
            expect(logs.includes(".warn.log")).toBe(true);
            expect(logs.includes(".error.log")).toBe(true);

            fs.rmSync(dir, { recursive: true, force: true });
        });

        test("default folder", async () => {
            const dir = path.join(process.cwd(), "logs");

            fs.rmSync(dir, { recursive: true, force: true });

            expect(() => fs.accessSync(dir)).toThrow();

            const l = new Logger().withFiles();

            // @ts-expect-error Private field
            for (const stream of l.streams) {
                if (!(stream instanceof FileStream)) continue;

                // @ts-expect-error Private field
                await util.promisify(stream.stream.close.bind(stream.stream))();
            }

            expect(() => fs.accessSync(dir)).not.toThrow();

            fs.rmSync(dir, { recursive: true, force: true });
        });
    });
});
