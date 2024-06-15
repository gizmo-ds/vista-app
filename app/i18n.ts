import { nextTick } from "vue"

import type { I18n, Locale } from "vue-i18n"

export const SUPPORT_LOCALES = ["en", "zh-hans"]

const getResourceMessages = (r: any) => r.default || r

export async function loadLocaleMessages(i18n: I18n, locale: Locale) {
  // load locale messages
  const messages = await import(`./locales/${locale}.yaml`).then(
    getResourceMessages
  )

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages)

  return nextTick()
}
