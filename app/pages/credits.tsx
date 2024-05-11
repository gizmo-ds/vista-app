import { defineComponent } from "vue"
import { type License as ILicense, getLicenses } from "~/helper/index.ts"
import PageLayout from "~/layout/PageLayout.tsx"
import LicenseItem from "@/app/components/LicenseItem"

export default defineComponent({
  setup() {
    let licenses = $ref<ILicense[]>([])
    getLicenses().then(list => (licenses = list))

    return () => (
      <PageLayout title="Credits" hasBack={true}>
        <p class="mt-0">
          This project is made possible by the following open-source projects:
        </p>
        {/* perf sucks, but nobody cares 😔 */}
        <div class="flex flex-col gap-2">
          {[...licenses].map((l, i) => (
            <LicenseItem key={i} license={l} />
          ))}
        </div>
      </PageLayout>
    )
  }
})
