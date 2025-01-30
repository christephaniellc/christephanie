import { arrayInsertIf, objectInsertIf } from './';


describe('arrayInsertIf: returns empty array if condition is false', () => {
  expect(arrayInsertIf(false, [1, 2, 3])).toEqual([]);
});

describe('arrayInsertIf: returns array if condition is true', () => {
  expect(arrayInsertIf(true, [1, 2, 3])).toEqual([1, 2, 3]);
});

describe('objectInsertIf: returns null if condition is false', () => {
  expect(objectInsertIf(false, { a: 0, b: 1 })).toEqual(null);
});

describe('objectInsertIf: returns object if condition is true', () => {
  expect(objectInsertIf(true, { a: 0, b: 1 })).toEqual({ a: 0, b: 1 });
});
