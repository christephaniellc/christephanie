export function getEnumValueByIndex<T>(enumObj: T, index: number): T[keyof T] {
  const values = Object.values(enumObj) as T[keyof T][];
  return values[index];
}