export function hashCode(str) {
  // eslint-disable-next-line no-bitwise
  return Array.from(str).reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);
}

export function intToRGB(i) {
  // eslint-disable-next-line no-bitwise
  const c = (i & 0x00FFFFFF).toString(16).toUpperCase();

  return '00000'.substring(0, 6 - c.length) + c;
}

export function colorFor(str) {
  return `#${intToRGB(hashCode(str))}`;
}

export function styleFor(str) {
  return { color: colorFor(str) };
}
