import { defineStore } from "pinia"
import { ref } from "vue"
import { type TauriPackage, environmentPackages } from "~/helper/index.ts"

export const usePackageStore = defineStore("packageStore", () => {
  const packages = ref<TauriPackage[]>([])
  const loading = ref(false)
  async function loadPackages() {
    loading.value = true
    return environmentPackages()
      .finally(() => (loading.value = false))
      .then(info => (packages.value = info))
  }

  return { packages, loading, loadPackages }
})
