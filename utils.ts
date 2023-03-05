export function binarySearch(
  array: any[],
  element: any,
  compare_fn: (a: any, b: any) => number,
): number {
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

export function binarySearchRound(
  array: any[],
  element: any,
  compare_fn: (a: any, b: any) => number,
): number {
  let targetIndex = binarySearch(array, element, compare_fn);

  if (targetIndex < 0) {
    targetIndex = -(targetIndex + 1);

    let lowIndex = targetIndex - 1;
    let highIndex = targetIndex;

    let low = targetIndex === 0 ? null : array[targetIndex - 1];
    let high = targetIndex === array.length ? null : array[targetIndex];

    if (low == null) {
      low = array[targetIndex];
      lowIndex += 1;
    }
    if (high == null) {
      high = low;
      highIndex = lowIndex;
    }

    targetIndex =
      Math.abs(high - element) < Math.abs(low - element) ? highIndex : lowIndex;
  }

  return targetIndex;
}
