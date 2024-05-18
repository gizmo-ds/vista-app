import { defineComponent } from "vue"
import {
  NH2,
  NRadioGroup,
  NRadioButton,
  NSelect,
  NButton,
  NTooltip
} from "naive-ui"
import { useLocalStorage } from "@vueuse/core"
import PageLayout from "~/layout/PageLayout.tsx"
import { themeStorageKey } from "~/helper/index.ts"
import OpenUrl from "@/app/components/OpenUrl"
import { RouterLink } from "vue-router"
import { LicenseThirdParty } from "@vicons/carbon"

const contributorsUrl =
  "https://github.com/gizmo-ds/vista-app/graphs/contributors"

const SettingComponent = defineComponent({
  props: { id: String, title: String },
  setup(props, { slots }) {
    return () => (
      <div id={props.id}>
        <NH2 class="mb-1">{props.title}</NH2>
        {slots.default && <div>{slots.default!()}</div>}
      </div>
    )
  }
})

const AppearanceItem = defineComponent({
  setup() {
    let lang = $ref("en") // not implemented
    const langs = [
      { label: "English", value: "en" },
      { label: "简体中文", value: "zh-hans" },
      { label: "正體中文", value: "zh-hant" }
    ]
    let theme = $(useLocalStorage(themeStorageKey, "auto"))

    return () => (
      <SettingComponent id="appearance" title="Appearance">
        <div class="flex flex-col gap-2">
          <div id="appearance-theme" class="flex gap-2 items-center">
            <span class="min-w-6rem">Theme</span>
            <NRadioGroup
              size="small"
              value={theme}
              onUpdate:value={v => (theme = v)}
            >
              <NTooltip showArrow={false}>
                {{
                  trigger: () => (
                    <NRadioButton value="auto">System</NRadioButton>
                  ),
                  default: () => "Same as System"
                }}
              </NTooltip>
              <NRadioButton value="light">Light</NRadioButton>
              <NRadioButton value="dark">Dark</NRadioButton>
            </NRadioGroup>
          </div>
          <div id="appearance-lang" class="flex gap-2 items-center">
            <span class="min-w-6rem">Language</span>
            <NSelect
              class="w-12rem"
              size="small"
              options={langs}
              value={lang}
              onUpdate:value={v => (lang = v)}
            />
          </div>
        </div>
      </SettingComponent>
    )
  }
})

const AboutItem = defineComponent({
  setup() {
    return () => (
      <SettingComponent id="about" title={"About"}>
        {/* Copyright */}
        <div>
          <span>Copyright © 2024 </span>
          <OpenUrl url="https://github.com/gizmo-ds">
            <NButton text type="primary">
              Gizmo
            </NButton>
          </OpenUrl>
          {" and "}
          <OpenUrl url={contributorsUrl}>
            <NButton text type="primary">
              contributors
            </NButton>
          </OpenUrl>
          {" and "}
          <OpenUrl url="https://github.com/anatawa12">
            <NButton text type="primary">
              anatawa12
            </NButton>
          </OpenUrl>
        </div>
        <div>
          This software is developed under the MIT License, which permits reuse,
          modification, and distribution for both personal and commercial
          purposes.
        </div>
        <div>
          For detailed licensing information of the third-party packages used in
          this software, please refer to the licensing page.
        </div>
        <RouterLink to={{ name: "settings-licenses" }}>
          <NButton text type="primary" renderIcon={() => <LicenseThirdParty />}>
            View Licenses
          </NButton>
        </RouterLink>
      </SettingComponent>
    )
  }
})

export default defineComponent({
  setup() {
    return () => (
      <PageLayout title="Settings">
        <div class="flex flex-col gap-4">
          <AppearanceItem />
          <AboutItem />
        </div>
      </PageLayout>
    )
  }
})
