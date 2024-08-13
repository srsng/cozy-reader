// @ts-nocheck
import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/'
import store from './store/'
import initAppWindow from "@/components/titlebar/index.js";
import "preline/preline"
// import { devtools } from '@vue/devtools'
// import initAppWindow from './components/titlebar/index'


// if (process.env.NODE_ENV === 'development') {
//   devtools.connect('http://localhost', 8098)
// }
const app = createApp(App);
app
    .use(store)
    .use(router)
    .mount('#app');
initAppWindow();
