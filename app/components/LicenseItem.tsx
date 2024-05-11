import { type PropType, defineComponent } from "vue"
import { NCard, NButton, NTag } from "naive-ui"
import type { License } from "~/helper/licenses"
import OepnUrl from "./OpenUrl.tsx"

function getHomepage(license: License): string | undefined {
  if (license.repository) {
    if (license.repository.startsWith("git+")) {
      return license.repository.replace("git+", "")
    }
    if (URL.canParse(license.repository)) {
      return license.repository
    }
  }
  if (!license.name) return undefined
  switch (license.type) {
    case "npm":
      return `https://www.npmjs.com/package/${license.name}`
    case "crate":
      return `https://crates.io/crates/${license.name}`
    default:
      return undefined
  }
}
function licenseText(license: License) {
  return (
    <NCard embedded class="max-h-15rem of-auto ws-pre-wrap">
      {license.licenseText}
    </NCard>
  )
}
function headerTitle(license: License) {
  const title = license.name + (license.version ? ` (${license.version})` : "")
  return () => <span>{title}</span>
}

export default defineComponent({
  props: { license: Object as PropType<License> },
  setup(props) {
    let showLicenseText = $ref(false)

    function headerExtra() {
      const homepage = getHomepage(props.license!)
      return (
        <div class="flex gap-2">
          <NTag size="small">{props.license!.license}</NTag>

          {props.license!.licenseText && (
            <NButton
              size="tiny"
              onClick={() => (showLicenseText = !showLicenseText)}
            >
              {showLicenseText ? "hide license" : "show license"}
            </NButton>
          )}

          {homepage && (
            <OepnUrl url={homepage!}>
              <NButton size="tiny"> homepage </NButton>
            </OepnUrl>
          )}
        </div>
      )
    }
    return () => (
      <NCard size="small">
        {{
          default: () => showLicenseText && licenseText(props.license!),
          "header-extra": headerExtra,
          header: headerTitle(props.license!)
        }}
      </NCard>
    )
  }
})
