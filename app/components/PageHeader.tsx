import { defineComponent } from "vue"
import { NIcon, NEl, NEllipsis, NTooltip } from "naive-ui"
import { ArrowLeft } from "@vicons/carbon"
import { useRouter } from "vue-router"

export default defineComponent({
  props: {
    title: String,
    subtitle: String,
    hasBack: Boolean
  },
  setup(props, { slots }) {
    const router = useRouter()
    function backIcon() {
      if (!props.hasBack) return null
      return (
        <NTooltip
          trigger="hover"
          placement="left-end"
          class="flex"
          keepAliveOnHover={false}
        >
          {{
            default: () => <span>Back</span>,
            trigger: () => (
              <div class="pr-3">
                <span onClick={() => router.back()} class="flex cursor-pointer">
                  <NIcon size="1.6rem">
                    <ArrowLeft />
                  </NIcon>
                </span>
              </div>
            )
          }}
        </NTooltip>
      )
    }
    return () => (
      <div class="flex justify-between px-4 h-3rem">
        <div class="flex flex-items-center grow-1">
          {backIcon()}

          {slots.header ? (
            slots.header!()
          ) : (
            <>
              <NEl
                class="flex text-size-xl fw-bold"
                style={{ color: "var(--text-color-1)" }}
              >
                {props.title}
              </NEl>

              <NEl
                class="pl-1.5 font-size-12px pt-1"
                style={{ color: "var(--text-color-3)" }}
              >
                <NEllipsis>{props.subtitle}</NEllipsis>
              </NEl>
            </>
          )}
        </div>

        {slots.center && (
          <div class="flex flex-items-center">{slots.center!()}</div>
        )}

        {slots.extra && (
          <div class="flex flex-items-center">{slots.extra!()}</div>
        )}
      </div>
    )
  }
})
