import { defineComponent } from "vue"
import { NVirtualList } from "naive-ui"
import PageLayout from "~/layout/PageLayout.tsx"
import LogItem from "~/components/LogItem.tsx"
import { type LogEntry, utilGetLogEntries } from "~/helper/index.ts"

export default defineComponent({
  setup() {
    let logs = $ref<LogEntry[]>([])
    utilGetLogEntries().then((list: LogEntry[]) => (logs = list.reverse()))

    return () => (
      <PageLayout title="Logs">
        <NVirtualList
          itemSize={28}
          itemResizable
          items={logs}
          class="h-[calc(100vh-5rem)]"
        >
          {({ item }: { item: LogEntry }) => <LogItem item={item} />}
        </NVirtualList>
      </PageLayout>
    )
  }
})
