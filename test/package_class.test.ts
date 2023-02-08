import { Package } from "../src/package_class";

describe("test initializing Package", () => {
  test("initialize left empty", () => {
    let test = new Package();
    expect(test.bus_factor).toBe(0);
  });
});
