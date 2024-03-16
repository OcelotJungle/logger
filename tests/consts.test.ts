import { FILE_LEVELS, LEVELS } from "../src/consts";

describe("Consts", () => {
    test("Log Levels (4)", () => expect(LEVELS).toHaveLength(4));
    test("File Log Levels (5)", () => expect(FILE_LEVELS).toHaveLength(5));
});
