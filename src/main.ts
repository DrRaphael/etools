import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 导入路由
import i18n from './i18n' // 导入 i18n

const app = createApp(App)

app.use(router) // 使用路由
app.use(i18n) // 使用 i18n

app.mount('#app')
