// @ts-nocheck
import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/'
import Store from './store/'
import initAppWindow from "@/components/titlebar/";

const store =  Store;
const app = createApp(App);
app
    .use(store)
    .use(router);

store.dispatch('loadStore'); 
app
    .mount('#app');
initAppWindow();
