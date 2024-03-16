import * as DF from "../src/date-formatters";

class MockDate extends Date {
    constructor(iso: string, private readonly timezoneOffset: number) {
        super(iso);
    }

    override getTimezoneOffset() {
        return this.timezoneOffset;
    }
}

describe("Date Formatters", () => {
    test("Trivial", () => {
        expect(DF.trivial).not.toThrow();
        expect(typeof DF.trivial()).toBe("string");
    });

    test("ISO Z", () => {
        expect(DF.isoZ).not.toThrow();
        expect(typeof DF.isoZ()).toBe("string");
        expect(DF.isoZ()).toHaveLength(24);
    });

    test("ISO Local", () => {
        expect(DF.isoLocal).not.toThrow();

        expect(typeof DF.isoLocal(new MockDate("2020-10-10T12:00:00.000Z", -60))).toBe("string");
        expect(typeof DF.isoLocal(new MockDate("2020-10-10T12:00:00.000Z", 60))).toBe("string");

        expect(DF.isoLocal()).toHaveLength(29);
    });

    test("FS Friendly", () => {
        expect(DF.fsFriendly).not.toThrow();
        expect(typeof DF.fsFriendly()).toBe("string");
        expect(DF.fsFriendly()).toHaveLength(18);
    });
});
