const { zip } = require("../util");

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

    expect(result).toEqual([["a", 1, 0], ["b", 2, 1], [undefined, 3, 2]]);
  });
});
