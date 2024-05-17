import { type UseDarkOptions, useDark as _useDark } from "@vueuse/core"

export const themeStorageKey = "app-theme"

export function useDark(options?: UseDarkOptions) {
  options = options || {}
  options.storageKey = themeStorageKey
  return _useDark(options)
}
