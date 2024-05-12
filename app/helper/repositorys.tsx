import {
  type TauriRemoteRepositoryInfo,
  environmentDownloadRepository,
  environmentAddRepository
} from "@/lib/bindings"
import { SubtractAlt } from "@vicons/carbon"
import {
  NButton,
  NCard,
  NEllipsis,
  NInput,
  NInputGroup,
  useDialog,
  useLoadingBar,
  useNotification
} from "naive-ui"

export function addRemoteRepoDialog(onSuccess: () => void) {
  interface HeaderInfo {
    name: string
    value: string
  }

  const dialog = useDialog()
  const loadingBar = useLoadingBar()
  const notification = useNotification()

  function confirmDialog(
    url: string,
    header: Record<string, string>,
    info: TauriRemoteRepositoryInfo,
    onSuccess: () => void
  ) {
    const items = {
      display_name: "Name",
      id: "ID",
      url: "URL"
    }
    const dialogRef = dialog.success({
      title: "Confirm add repository",
      showIcon: false,
      content: () => (
        <div class="flex flex-col gap-2">
          {[...Object.entries(items)].map(([key, label]) => (
            <div class="flex flex-row gap-1">
              <div class="flex w-4rem">{label}</div>
              <div class="flex w-[calc(100%-4rem)]">
                <NEllipsis>{(info as Record<string, any>)[key]}</NEllipsis>
              </div>
            </div>
          ))}
          <NCard title="Packages" size="small" class="flex">
            <div class="max-h-16rem overflow-auto">
              {[...info.packages].map(pkg => (
                <li>{pkg.display_name}</li>
              ))}
            </div>
          </NCard>
        </div>
      ),
      positiveText: "Confirm Add",
      negativeText: "Cancel",
      onPositiveClick: () => {
        loadingBar.start()
        environmentAddRepository(url, header)
          .then(() => {
            loadingBar.finish()
            dialogRef.destroy()
            onSuccess()
          })
          .catch(e => {
            loadingBar.error()
            console.error(e)
            notification.error({
              title: "Failed to add repository",
              content: "An error occurred while adding the repository."
            })
          })
        return false
      }
    })
  }

  return () => {
    let url = $ref("")
    let headers = $ref<HeaderInfo[]>([])
    const reset = () => ((url = ""), (headers = []))
    let urlInput = $ref<HTMLInputElement | undefined>()
    let urlInputStatus = $ref<"error" | undefined>()

    const dialogRef = dialog.info({
      title: "Add repository",
      showIcon: false,
      onAfterLeave: reset,
      content: () => (
        <div class="flex flex-col gap-2">
          <NInput
            ref={$$(urlInput)}
            class="flex"
            value={url}
            status={urlInputStatus}
            placeholder="Enter the repository URL"
            clearable
            onInput={v => {
              urlInputStatus = URL.canParse(v) || v === "" ? undefined : "error"
              url = v
            }}
          />
          {headers.length > 0 && (
            <div class="flex flex-col gap-1">
              {headers.map((header, i) => (
                <NInputGroup class="flex">
                  <NInput
                    placeholder="Name"
                    size="small"
                    value={header.name}
                    onInput={v => (headers[i].name = v)}
                  />
                  <NInput
                    placeholder="Value"
                    size="small"
                    value={header.value}
                    onInput={v => (headers[i].value = v)}
                  />
                  <NButton
                    type="error"
                    size="small"
                    tertiary
                    onClick={() =>
                      (headers = headers.filter((_, j) => i !== j))
                    }
                  >
                    {{ icon: () => <SubtractAlt /> }}
                  </NButton>
                </NInputGroup>
              ))}
            </div>
          )}
        </div>
      ),
      action() {
        let loading = $ref(false)
        return (
          <div class="flex justify-between w-full">
            <NButton
              class="flex"
              disabled={loading}
              size="small"
              onClick={() => {
                headers = [...headers, { name: "", value: "" }]
              }}
            >
              Add Header
            </NButton>
            <div class="flex gap-1">
              <NButton
                disabled={loading}
                size="small"
                onClick={() => dialogRef.destroy()}
              >
                Cancel
              </NButton>
              <NButton
                type="primary"
                size="small"
                disabled={urlInputStatus !== undefined || url === "" || loading}
                loading={loading}
                onClick={() => {
                  loading = true
                  const headerObj = Object.fromEntries(
                    headers.map(header => [header.name, header.value])
                  )
                  confirmAddRepo(url, headerObj).finally(
                    () => (loading = false)
                  )
                }}
              >
                Add Repository
              </NButton>
            </div>
          </div>
        )
      },
      onAfterEnter: () => urlInput?.focus()
    })

    async function confirmAddRepo(url: string, header: Record<string, string>) {
      loadingBar.start()
      const info = await environmentDownloadRepository(url, header)
      loadingBar.finish()

      let errorMessage = "Failed to add repository."
      switch (info.type) {
        case "Success":
          return confirmDialog(url, header, info.value, () => {
            dialogRef.destroy()
            onSuccess()
          })
        case "BadUrl":
          errorMessage = "The URL is invalid."
          break
        case "DownloadError":
          errorMessage = "Failed to download the repository.\n" + info.message
          break
        case "Duplicated":
          errorMessage = "The repository is already added."
          break
        default:
          console.error(info)
          break
      }
      dialog.error({
        title: "Failed to add repository",
        content: errorMessage
      })
    }
  }
}
