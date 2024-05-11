import { defineStore } from "pinia"
import { ref } from "vue"
import { environmentUnityVersions } from "~/helper/index.ts"

export interface UnityVersion {
  version: string
  path: string
  loadedFromHub: boolean
}

export const useUnityStore = defineStore("unityStore", () => {
  let unityVersions = ref<UnityVersion[]>([])

  environmentUnityVersions().then(r => {
    unityVersions.value = r.unity_paths.map(p => ({
      path: p[0],
      version: p[1],
      loadedFromHub: p[2]
    }))
  })

  return { unityVersions }
})
