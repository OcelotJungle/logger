import { Stream } from "./stream";

export class ConsoleStream extends Stream {
    private readonly console: Console;

    constructor(console: Console);
    constructor(stream: ConsoleStream);
    constructor(arg: Console | ConsoleStream) {
        super();

        this.console = arg instanceof ConsoleStream ? arg.console : arg;
    }

    flush() {
        for (const data of this.buffer) {
            this.console.log(data);
        }

        this.buffer = [];
    }

    copy() {
        return new ConsoleStream(this);
    }
}
