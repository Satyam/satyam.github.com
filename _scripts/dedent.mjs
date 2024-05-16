// short for `dedent` to de-indent template strings
export default function d(s, ...args) {
  if (Array.isArray(s))
    return d(s.map((s1, i) => s1 + (args[i] ?? '')).join(''), ...args);
  let nTrim = 0;
  return s
    .replace(/^[ \t]*\n/, '')
    .split('\n')
    .map((l, i) => {
      const s1 = l.trimStart();
      if (i) {
        return l.length - s1.length <= nTrim ? s1 : l.slice(nTrim);
      }
      nTrim = l.length - s1.length;
      return s1;
    })
    .join('\n');
}
