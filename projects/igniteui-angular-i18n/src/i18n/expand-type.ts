/**
 * @internal
 * Expands object types (one level) and makes properties required
 * https://stackoverflow.com/a/57683652
 */
type ExpandRequire<T> = T extends infer O ? { [K in keyof O]-?: O[K] } : never;
