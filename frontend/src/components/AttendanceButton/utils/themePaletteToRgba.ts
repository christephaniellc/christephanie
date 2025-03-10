export const themePaletteToRgba = (colorHexString: string, opacity: number = 0.1) => {
  const hexToRgba = colorHexString.replace('#', '');
  const r = parseInt(hexToRgba.substring(0, 2), 16);
  const g = parseInt(hexToRgba.substring(2, 4), 16);
  const b = parseInt(hexToRgba.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};