import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Create the Vue app instance
const app = createApp(App)

// Use plugins
app.use(router)
app.use(store)

// Mount the app
app.mount('#app')
