export abstract class Stream {
    protected buffer: string[] = [];

    write(data: string) {
        this.buffer.push(data);
    }

    abstract flush(): void;
    abstract copy(): Stream;
}
