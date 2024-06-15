import { DefineLocaleMessage } from "vue-i18n"
import en from "./locales/en.yaml"

type MessageSchema = typeof en

declare module "vue-i18n" {
  export interface DefineLocaleMessage extends MessageSchema {}
}
