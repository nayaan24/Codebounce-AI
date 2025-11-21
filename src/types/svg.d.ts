declare module "*.svg" {
  import type { StaticImport } from "next/dist/shared/lib/get-img-props";

  const content: StaticImport;
  export default content;
}

