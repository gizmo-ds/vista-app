import { defineComponent } from "vue"
import { NTag, NText, NVirtualList, NEllipsis } from "naive-ui"
import { formatISO9075 } from "date-fns"
import PageLayout from "~/layout/PageLayout.tsx"
import { type LogEntry, utilGetLogEntries } from "~/helper/index.ts"

type NTagType = "default" | "info" | "error" | "success" | "primary" | "warning"

function levelTag(level: string) {
  let tagType: NTagType = "default"
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
  const levelStr = level
  return (
    <NTag
      type={tagType}
      bordered={false}
      size="small"
      class="w-full flex justify-center"
    >
      {levelStr}
    </NTag>
  )
}

function logItem(item: LogEntry) {
  return (
    <div class="flex gap-2 min-h-7 w-full">
      <NText class="flex w-4rem">{levelTag(item.level)}</NText>
      <NText class="flex">{formatISO9075(new Date(item.time))}</NText>
      <NEllipsis class="flex w-[calc(100%-1rem-4rem-10rem)]">
        <NText>{item.message}</NText>
      </NEllipsis>
    </div>
  )
}

export default defineComponent({
  setup() {
    let logs = $ref<LogEntry[]>([])
    utilGetLogEntries().then((list: LogEntry[]) => (logs = list))

    return () => (
      <PageLayout title="Logs">
        <NVirtualList
          itemSize={28}
          itemResizable
          items={logs}
          class="h-[calc(100vh-5rem)]"
        >
          {({ item }: { item: LogEntry }) => logItem(item)}
        </NVirtualList>
      </PageLayout>
    )
  }
})
