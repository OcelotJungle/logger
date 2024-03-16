import fs, { WriteStream } from "fs";
import { Stream } from "./stream";

export class FileStream extends Stream {
    private readonly stream: WriteStream;

    level: string;

    constructor(level: string, path: string);
    constructor(stream: FileStream);
    constructor(...args: [string, string] | [FileStream]) {
        super();

        if (args.length === 2) {
            this.level = args[0];
            this.stream = fs.createWriteStream(args[1], { flags: "w", autoClose: true });

        }
        else {
            this.stream = args[0].stream;
            this.level = args[0].level;
        }
    }

    flush() {
        for (const data of this.buffer) {
            this.stream.write(`${data}\n`);
        }

        this.buffer = [];
    }

    copy() {
        return new FileStream(this);
    }
}
