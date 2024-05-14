import { defineComponent } from "vue"
import { NAlert } from "naive-ui"
import { type License as ILicense, getLicenses } from "~/helper/index.ts"
import PageLayout from "~/layout/PageLayout.tsx"
import LicenseItem from "~/components/LicenseItem"

export default defineComponent({
  setup() {
    let licenses = $ref<ILicense[]>([])
    getLicenses().then(list => (licenses = list))

    return () => (
      <PageLayout title="Credits" hasBack={true}>
        <div class="mt-0 mb-2">
          <p>
            This project is made possible by the following open-source projects.
            Each is listed with its respective license information.
          </p>
          <NAlert type="warning">
            While we provide complete license texts where available, some
            projects may lack full license documentation. For these, a link to
            the project's homepage is provided for further licensing details.
          </NAlert>
        </div>
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
