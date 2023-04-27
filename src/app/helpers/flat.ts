export function flat<T>(array: Array<Array<T>>): Array<T> {
  return array.reduce((flatten, items) => [...flatten, ...items], []);
}
