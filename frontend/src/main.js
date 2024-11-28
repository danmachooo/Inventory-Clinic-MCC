
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/styles/index.css' // Assuming you have a file for Tailwind CSS

const app = createApp(App)
app.use(router)
app.mount('#app')