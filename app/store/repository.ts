import { defineStore } from "pinia"
import { computed, ref } from "vue"
import {
  type TauriRepositoriesInfo,
  environmentRepositoriesInfo
} from "~/helper/index.ts"

interface repository {
  id: string
  displayName: string
  url: string
  enabled: boolean
}

export const useRepositoryStore = defineStore("repositoryStore", () => {
  const repositoriesInfo = ref<TauriRepositoriesInfo>()
  const enabledRepos = computed(() =>
    repositoriesInfo.value?.user_repositories
      .filter(
        repo =>
          !repositoriesInfo.value?.hidden_user_repositories.includes(repo.id)
      )
      .map(repo => repo.id)
  )
  const repositories = computed(() =>
    repositoriesInfo.value?.user_repositories.map(
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
      .then(info => {
        repositoriesInfo.value = info
        console.log(info)
      })
  }

  return { repositoriesInfo, loading, enabledRepos, repositories, loadRepos }
})
