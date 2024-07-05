import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import router from './router'
import Vuex from "vuex";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(Vuex)
app.use(router)
app.mount('#app')
