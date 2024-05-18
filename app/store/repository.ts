import { defineStore } from "pinia"
import { computed, ref } from "vue"
import {
  type TauriRepositoriesInfo,
  environmentRepositoriesInfo,
  environmentSetShowPrereleasePackages
} from "~/helper/index.ts"

interface repository {
  id: string
  displayName: string
  url: string
  enabled: boolean
}

export const useRepositoryStore = defineStore("repositoryStore", () => {
  const info = ref<TauriRepositoriesInfo>()
  const enabledRepos = computed(() =>
    info.value?.user_repositories
      .filter(repo => !info.value?.hidden_user_repositories.includes(repo.id))
      .map(repo => repo.id)
  )
  const repositories = computed(() =>
    info.value?.user_repositories.map(
      repo =>
        ({
          id: repo.id,
          displayName: repo.display_name,
          url: repo.url,
          enabled: enabledRepos.value?.includes(repo.id)
        } as repository)
    )
  )
  const loading = ref(false)
  async function loadRepos() {
    loading.value = true
    return environmentRepositoriesInfo()
      .finally(() => (loading.value = false))
      .then(v => {
        info.value = v
        showPrereleasePackages.value = v.show_prerelease_packages
      })
  }
  const showPrereleasePackages = computed({
    get: () => info.value?.show_prerelease_packages,
    set: value => {
      if (value === undefined) return
      environmentSetShowPrereleasePackages(value).then(
        () => (info.value!.show_prerelease_packages = value)
      )
    }
  })

  return {
    info,
    loading,
    enabledRepos,
    repositories,
    loadRepos,
    showPrereleasePackages
  }
})
