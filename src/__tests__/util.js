const { isPlainObject, zip } = require("../util");

describe("isPlainObject", () => {
  it("returns true for plain objects", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ blub: "blub" })).toBe(true);
    expect(isPlainObject({ blub: ["blub"] })).toBe(true);
    expect(isPlainObject({ blub: { blab: "blib" }, lel: "lol" })).toBe(true);
  });
  it("returns false for non-object types", () => {
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(5)).toBe(false);
    expect(isPlainObject("uiae")).toBe(false);
    expect(isPlainObject(NaN)).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(false)).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(() => {})).toBe(false);
  });
  it("returns false for non-plain objects", () => {
    expect(isPlainObject([])).toBe(false);

    expect(isPlainObject(new (class {})())).toBe(false);
  });
});

describe("zip", () => {
  it("returns a generator", () => {
    expect(typeof zip()[Symbol.iterator]).toBe("function");
  });

  it("returns a generator with the length of the longest parameter", () => {
    const listA = [];
    const listB = [0, 1, 2, 3];
    const result = Array.from(zip(listA, listB));

    expect(result.length).toBe(4);
  });

  it("returns a list of zipped element with their indexes", () => {
    const listA = ["a", "b"];
    const listB = [1, 2, 3];
    const result = Array.from(zip(listA, listB));

    expect(result).toEqual([
      ["a", 1, 0],
      ["b", 2, 1],
      [undefined, 3, 2],
    ]);
  });
});
