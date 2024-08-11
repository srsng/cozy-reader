import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookReader from '../views/BookReader.vue'

if (typeof window.HSStaticMethods === 'undefined') {
  window.HSStaticMethods = {};
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/book/:fileName?',
    name: 'BookReader',
    component: BookReader,
    props: true
  },
  // {
  //   path: '/:pathMatch(.*)*', // 捕获所有未匹配的路径
  //   name: 'NotFound',
  //   component: 'Home',
  //   redirect: '/' // 如果你想重定向到根路径
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// // 全局前置守卫
// router.beforeEach((to, from, next) => {
//   console.log('to:', to);
//   if (to.name === 'book' && !to.params.fileName) {
//     // 如果请求的路径是 /book 并且没有 fileName 参数，则重定向到根路径
//     next({ path: '/' });
//   } else {
//     next();
//   }
// });

router.afterEach((to, from, failure) => {
  if (!failure) {
    setTimeout(() => {
      window.HSStaticMethods.autoInit();
    }, 100)
  }
});

export default router
