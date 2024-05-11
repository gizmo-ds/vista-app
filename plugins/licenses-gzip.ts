import type { Plugin } from "vite";
import { gzipSync } from "fflate";

export default function (): Plugin {
  return {
    name: "vite-plugin-licenses-gzip",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      if ("oss-licenses.json" in bundle) {
        const b = bundle["oss-licenses.json"];
        if (b.type !== "asset") return;
        const source =
          typeof b.source === "string"
            ? b.source
            : new TextDecoder().decode(b.source);
        const licenses = JSON.parse(source).map((l: any) => ({
          type: "npm",
          name: l.name,
          version: l.version,
          repository: l.repository,
          source: l.source,
          license: l.license,
          licenseText: l.licenseText
        }));
        b.source = gzipSync(new TextEncoder().encode(JSON.stringify(licenses)));
        b.fileName = "assets/npm-licenses.json.gz";
      }
      Object.entries(bundle).forEach(([name, b]) => {
        if (b.type !== "asset") return;
        if (name.startsWith("assets/crate-licenses")) {
          const source =
            typeof b.source === "string"
              ? b.source
              : new TextDecoder().decode(b.source);
          b.source = gzipSync(new TextEncoder().encode(source));
          b.fileName = name + ".gz";
        }
      });
    }
  };
}
