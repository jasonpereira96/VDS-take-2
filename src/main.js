import { createApp } from 'vue'
import App from './App.vue'
import Chart from "./components/chart.vue"
import BootstrapVue3 from 'bootstrap-vue-3'

// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

// Make BootstrapVue available throughout your project

const app = createApp(App)
app.use(BootstrapVue3)

app.component('Chart', Chart)

app.mount('#app')

window.app = app;
