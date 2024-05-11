import { promisify } from "node:util"
import { writeFile, mkdir, readFile } from "node:fs/promises"
import { exec as execCallback } from "node:child_process"
import { createHash } from "node:crypto"

await mkdir("build", { recursive: true })

const exec = promisify(execCallback)

async function shouldRebuild() {
  async function readHashes() {
    try {
      return JSON.parse(await readFile("build/licenses.hashes.json", "utf8"))
    } catch (e) {
      console.error(e)
      return {}
    }
  }

  try {
    const oldHashes = await readHashes()
    const oldCargoLockHash = oldHashes.cargoLockHash

    const cargoLock = await readFile("./Cargo.lock", "utf8")
    const cargoLockHash = createHash("sha256").update(cargoLock).digest("hex")

    console.log("Old cargo lock hash:", oldCargoLockHash)
    console.log("New cargo lock hash:", cargoLockHash)

    await mkdir("build", { recursive: true })
    await writeFile(
      "build/licenses.hashes.json",
      JSON.stringify({ cargoLockHash })
    )

    return cargoLockHash !== oldCargoLockHash
  } catch (e) {
    console.error(e)
    return true
  }
}

if (!(await shouldRebuild())) {
  console.log("Cache matched, skipping")
  process.exit(0)
}

interface CargoAbout {
  licenses: CargoAboutLicense[]
}
interface CargoAboutLicense {
  name: string
  id: string
  text: string
  used_by: CargoAboutUsedBy[]
}
interface CargoAboutUsedBy {
  crate: CargoAboutCrate
}
interface CargoAboutCrate {
  name: string
  version: string
  repository: string
}
async function callCargoAbout(): Promise<CargoAbout> {
  const { stdout } = await exec("cargo about generate --format=json", {
    maxBuffer: Number.MAX_SAFE_INTEGER,
    encoding: "utf8"
  })
  return JSON.parse(stdout)
}

const cargoAbout = await callCargoAbout()

interface PackageInfo {
  name: string
  version: string
  url: string
}
const licenses = new Map<string, Map<string, PackageInfo[]>>()

// add rust libraries
for (let license of cargoAbout.licenses) {
  const licenseText = license.text
  const licenseByText = licenses.get(license.id) ?? new Map()
  licenses.set(license.id, licenseByText)
  const packagesOfTheLicense = licenseByText.get(licenseText) ?? []
  licenseByText.set(licenseText, packagesOfTheLicense)
  for (let usedBy of license.used_by) {
    packagesOfTheLicense.push({
      name: usedBy.crate.name,
      version: usedBy.crate.version,
      url:
        usedBy.crate.repository ??
        `https://crates.io/crates/${usedBy.crate.name}`
    })
  }
}

// The logo
{
  const licenseId = "CC-BY-4.0"
  const licenseByText = licenses.get(licenseId) ?? new Map()
  licenses.set(licenseId, licenseByText)

  const licenseText = await readFile("icon-LICENSE", "utf-8")
  const packagesOfTheLicense = licenseByText.get(licenseText) ?? []
  licenseByText.set(licenseText, packagesOfTheLicense)
  packagesOfTheLicense.push({
    name: "ALCOM Icon",
    version: "1.0.0",
    url: "https://github.com/vrc-get/vrc-get"
  })
}

interface License {
  type: "npm" | "crate"
  name?: string
  version?: string
  repository?: string | null
  license: string
  licenseText: string | null
  used_by?: PackageInfo[]
}
// finally, put to array
const result: License[] = []

for (let [license, licenseByText] of licenses) {
  for (let [text, packages] of licenseByText) {
    result.push({
      type: "crate",
      license,
      licenseText: text,
      used_by: packages
    })
  }
}

await writeFile("build/crate-licenses.json", JSON.stringify(result))
