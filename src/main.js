import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
// import v_store from './store'
import './style.css'
import "preline/preline"
// import initAppWindow from './components/titlebar/index'

const app = createApp(App);
// initAppWindow();

app.use(router)
    // .use(v_store)
    .mount('#app')
