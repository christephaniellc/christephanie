import { arrayInsertIf, objectInsertIf } from './';

describe('insertIf Utilities.locked', () => {
  it('arrayInsertIf: returns empty array if condition is false.locked', () => {
    expect(arrayInsertIf(false, [1, 2, 3])).toEqual([]);
  });

  it('arrayInsertIf: returns array if condition is true.locked', () => {
    expect(arrayInsertIf(true, [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('objectInsertIf: returns null if condition is false.locked', () => {
    expect(objectInsertIf(false, { a: 0, b: 1 })).toEqual(null);
  });

  it('objectInsertIf: returns object if condition is true.locked', () => {
    expect(objectInsertIf(true, { a: 0, b: 1 })).toEqual({ a: 0, b: 1 });
  });
});
