export function binarySearch(
  array: any[],
  element: any,
  compare_fn: (a: any, b: any) => number,
) {
  let m = 0;
  let n = array.length - 1;
  while (m <= n) {
    let k = (n + m) >> 1;
    let cmp = compare_fn(element, array[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}
