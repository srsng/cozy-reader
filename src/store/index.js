import {createStore} from 'vuex';
// import {Store} from 'tauri/api/store';
// import { stat } from 'fs';

import localforage from 'localforage';

export default createStore({
    state: {
        uploadBooksStatus:{
            uploading: false,
            solving: false,
            event: null,
        },
        viewerWidth: localStorage.getItem('viewerWidth') ? parseInt(localStorage.getItem('viewerWidth')) : 60,
    },
    mutations: {
        setUploadBooksStatus(state, newState) {
          state.uploadBooksStatus.uploading = newState.uploading;
          state.uploadBooksStatus.solving = newState.solving;
          state.uploadBooksStatus.event = newState.event;
        },
        increaseViewerWidth(state) {
            if (state.viewerWidth < 101) {
             state.viewerWidth += 10;
            }
        },
        decreaseViewerWidth(state) {
            if (state.viewerWidth > 10) {
                state.viewerWidth -= 10;
            }
        },
      },
});
