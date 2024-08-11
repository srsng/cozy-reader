// import {createStore} from 'vuex';
// import {Store} from 'tauri/api/store';

// export default createStore({
//   state: {
//     theme: 'default',
//     // 只用来存放书籍数据
//     tauri_store: new Store('store.bin'),
//   },
//   getters: {
//     getTheme: state => state.theme,
//     getBookByKey: (state, key) => state.tauri_store.get(key),
//     getBookKeys: state => state.tauri_store.keys(),
//   },
//   mutations: {
//     setTheme: (state, theme) => {
//       state.theme = theme;
//     },
//     setBookByKey: (state, {fileName, bookData, bookInfo}) => {
//       state.tauri_store.set(fileName, {bookData:bookData, bookInfo:bookInfo});
//     },

//   },
//   // actions: {
//   //   setTheme: ({commit}, theme) => {
//   //   commit('setTheme', theme);
//   //   },
//   //   setTauriStore: ({commit}, store) => {
//   //   commit('setTauriStore', store);
//   //   },
//   // },
// });
