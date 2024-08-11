// @ts-nocheck
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/'
// import v_store from './store'
import './style.css'
import "preline/preline"
// import { devtools } from '@vue/devtools'
// import initAppWindow from './components/titlebar/index'


// if (process.env.NODE_ENV === 'development') {
//   devtools.connect('http://localhost', 8098)
// }

const app = createApp(App);

app.use(router)
    // .use(v_store)
    .mount('#app')
