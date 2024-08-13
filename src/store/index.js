import {createStore} from 'vuex';
// import {Store} from 'tauri/api/store';
// import { stat } from 'fs';

export default createStore({
    state: {
        uploadBooksStatus:{
            uploading: false,
            solving: false,
            event: null,
        }
    },
    mutations: {
        setUploadBooksStatus(state, newState) {
          state.uploadBooksStatus.uploading = newState.uploading;
          state.uploadBooksStatus.solving = newState.solving;
          state.uploadBooksStatus.event = newState.event;
        }
      },
});
