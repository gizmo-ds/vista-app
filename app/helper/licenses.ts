import { gunzip } from "fflate";
import crateLicenses from "@/build/crate-licenses.json?url";

interface packageInfo {
  name: string;
  version: string;
  url: string;
}

export interface License {
  type: "npm" | "crate";
  name: string;
  version?: string;
  repository?: string | null;
  source: string;
  license: string;
  licenseText: string | null;
  used_by?: packageInfo[];
}

let degzip = promisify(gunzip);

async function getNPMLicenses(): Promise<License[]> {
  const licenses = await fetch("/assets/npm-licenses.json.gz")
    .then(r => r.arrayBuffer())
    .then(data => degzip(new Uint8Array(data)))
    .then(data => new TextDecoder().decode(data));
  return JSON.parse(licenses);
}

async function getCrateLicenses(): Promise<License[]> {
  const multiple: License[] = import.meta.env.DEV
    ? await fetch(crateLicenses)
        .then(r => r.text())
        .then(data => JSON.parse(data))
    : await fetch(crateLicenses + ".gz")
        .then(r => r.arrayBuffer())
        .then(data => degzip(new Uint8Array(data)))
        .then(data => new TextDecoder().decode(data))
        .then(data => JSON.parse(data));
  const licenses: License[] = [];
  multiple.forEach(l => {
    if (!Array.isArray(l.used_by)) return;
    l.used_by.forEach(u => {
      licenses.push({
        type: "crate",
        name: u.name,
        version: u.version,
        repository: u.url,
        source: u.url,
        license: l.license,
        licenseText: l.licenseText
      });
    });
  });
  return licenses;
}

export async function getLicenses(): Promise<License[]> {
  const crateLicenses = await getCrateLicenses();
  if (import.meta.env.PROD) {
    const npmLicenses = await getNPMLicenses();
    return npmLicenses.concat(crateLicenses);
  }
  return crateLicenses;
}

function promisify<T, U>(
  fn: (arg: T, cb: (err: Error | null, result?: U) => void) => void
): (arg: T) => Promise<U> {
  return arg =>
    new Promise((resolve, reject) =>
      fn(arg, (err, result) => (err ? reject(err) : resolve(result!)))
    );
}
