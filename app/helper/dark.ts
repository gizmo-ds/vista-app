import { type UseDarkOptions, useDark as _useDark } from "@vueuse/core"

export function useDark(options?: UseDarkOptions) {
  options = options || {}
  options.storageKey = "app-theme"
  return _useDark(options)
}
