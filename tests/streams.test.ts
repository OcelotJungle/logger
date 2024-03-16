import util from "util";
import path from "path";
import fs from "fs";
import {
    Stream,
    ConsoleStream,
    FileStream,
} from "../src/streams";

describe("Streams", () => {
    describe("Stream", () => {
        const s = new class extends Stream {
            getBuffer() { return this.buffer }

            flush() {
                const buffer = this.buffer;
                this.buffer = [];
                return buffer;
            }

            copy() { return this }
        }();

        test("writes to internal buffer", () => {
            expect(s.getBuffer()).toHaveLength(0);

            s.write("foo");
            expect(s.getBuffer()).toHaveLength(1);

            s.write("bar");
            expect(s.getBuffer()).toHaveLength(2);
        });

        test("flushes internal buffer", () => {
            const buffer = s.flush();

            expect(buffer).toHaveLength(2);
            expect(s.getBuffer()).toHaveLength(0);
        });
    });

    describe("Console Stream", () => {
        let counter = 0;
        const datas: unknown[][] = [];

        const s = new ConsoleStream({
            ...console,
            log(...data: unknown[]) {
                counter++;
                datas.push(data);
            },
        });

        test("flushes", () => {
            s.write("foo");
            s.write("bar");
            s.write("baz");

            s.flush();

            expect(counter).toBe(3);
            expect(datas).toHaveLength(3);
        });

        test("copies", () => {
            const s2 = s.copy();

            // @ts-expect-error Private field
            const buffer1 = s.buffer;
            // @ts-expect-error Private field [2]
            const buffer2 = s2.buffer;

            const length11 = buffer1.length;
            const length21 = buffer2.length;

            s.write("foo");

            const length12 = buffer1.length;
            const length22 = buffer2.length;

            expect(length11 + 1).toBe(length12);
            expect(length21).toBe(length22);
        });
    });

    describe("File Stream", () => {
        const testFilePath = path.join(process.cwd(), "__test__.log");

        test("creates file", async () => {
            const filePath = `${testFilePath}__cf`;

            const s = new FileStream("test", filePath);

            // @ts-expect-error Private field
            await util.promisify(s.stream.close.bind(s.stream))();

            expect(() => fs.accessSync(filePath)).not.toThrow();

            fs.rmSync(filePath, { force: true });
        });

        test("writes", async () => {
            const filePath = `${testFilePath}__w`;

            const s = new FileStream("test", filePath);

            s.write("foo");
            s.write("bar");

            s.flush();

            // @ts-expect-error Private field
            await util.promisify(s.stream.close.bind(s.stream))();

            const contents = fs.readFileSync(filePath, "utf-8");

            expect(contents).toBe("foo\nbar\n");

            fs.rmSync(filePath, { force: true });
        });

        test("copies", async () => {
            const filePath = `${testFilePath}__c`;

            const s = new FileStream("test", filePath);
            const s2 = s.copy();

            s.write("foo");
            s.flush();
            s.write("bar");

            s2.write("baz");
            s2.flush();

            // @ts-expect-error Private field
            await util.promisify(s.stream.close.bind(s.stream))();
            // @ts-expect-error Private field [2]
            await util.promisify(s2.stream.close.bind(s2.stream))();

            const contents = fs.readFileSync(filePath, "utf-8");

            expect(contents).toBe("foo\nbaz\n");

            fs.rmSync(filePath, { force: true });
        });
    });
});
