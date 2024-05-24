import { defineComponent } from "vue"
import { NLayoutHeader, NLayout } from "naive-ui"
import PageHeader from "~/components/PageHeader.tsx"

export default defineComponent({
  props: {
    title: String,
    subtitle: String,
    hasBack: Boolean,
    noPadding: Boolean
  },
  setup(props, { slots }) {
    return () => (
      <>
        <NLayoutHeader bordered position="absolute" class="h-3rem">
          <PageHeader
            title={props.title}
            subtitle={props.subtitle}
            hasBack={props.hasBack}
          >
            {{
              header: slots.header,
              extra: slots.headerExtra
            }}
          </PageHeader>
        </NLayoutHeader>
        {slots.default && (
          <NLayout position="absolute" class="top-3rem!">
            {props.noPadding ? (
              slots.default!()
            ) : (
              <div class="p-1rem">{slots.default!()}</div>
            )}
          </NLayout>
        )}
      </>
    )
  }
})
