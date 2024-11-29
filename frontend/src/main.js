
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/styles/index.css' // Assuming you have a file for Tailwind CSS
import 'sweetalert2/dist/sweetalert2.min.css'
import ToastPlugin from 'vue-toast-notification'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
const app = createApp(App)
app.use(router)
app.use(Toast)
app.mount('#app')