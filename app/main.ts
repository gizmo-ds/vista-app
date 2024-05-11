import { createApp } from "vue"
import { createPinia } from "pinia"
import "virtual:uno.css"
import App from "./App.tsx"
import router from "./router.ts"

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount("#app")
