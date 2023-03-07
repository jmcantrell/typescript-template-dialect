import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "@jmcantrell/template-dialect",
    version: Deno.args[0],
    description: "A class for creating simple template dialects",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://git.sr.ht/~jmcantrell/typescript-template-dialect",
    },
  },
});

await Deno.copyFile("LICENSE", "npm/LICENSE");
await Deno.copyFile("README.md", "npm/README.md");
