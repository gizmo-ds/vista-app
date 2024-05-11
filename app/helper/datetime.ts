import { formatDistanceToNow } from "date-fns"

export function distance2now(t: Date) {
  return formatDistanceToNow(t, { addSuffix: true })
}
