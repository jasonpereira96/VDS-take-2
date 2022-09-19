import { createApp } from 'vue'
import App from './App.vue'
import Chart from "./components/chart.vue"


const app = createApp(App)

app.component('Chart', Chart)

app.mount('#app')
