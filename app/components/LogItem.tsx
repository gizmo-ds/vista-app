import { type PropType, defineComponent } from "vue"
import { NText, NTag } from "naive-ui"
import { formatISO9075 } from "date-fns"
import { type LogEntry } from "~/helper/index.ts"

function levelTag(level: string) {
  let tagType:
    | "default"
    | "info"
    | "error"
    | "success"
    | "primary"
    | "warning" = "default"
  switch (level) {
    case "Info":
      tagType = "success"
      break
    case "Warn":
      tagType = "warning"
      break
    case "Error":
      tagType = "error"
      break
  }
  return (
    <NTag
      type={tagType}
      bordered={false}
      size="small"
      class="w-3rem flex flex-row justify-center"
    >
      {level}
    </NTag>
  )
}

export default defineComponent({
  props: {
    item: Object as PropType<LogEntry>
  },
  setup(props) {
    return () => (
      <div class="min-h-7">
        <div class="flex gap-2">
          {levelTag(props.item!.level)}
          <NText>{formatISO9075(new Date(props.item!.time))}</NText>
          <NText>{props.item!.message}</NText>
        </div>
      </div>
    )
  }
})
