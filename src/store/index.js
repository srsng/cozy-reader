import {createStore} from 'vuex';

export default createStore({
    state: {
        uploadBooksStatus:{
            uploading: false,
            solving: false,
            event: null,
        },
        curBookTitle: null,
        curBookChapter: null,
        readerSettings: {
            fontFamily: null,
            viewerWidth: 60,
            fontSize: 20,
            lineHeight: 180,
            firstLineIndent: false,
            zoomLongPic: false,
            scrollBarVisable: false,
        }
    },
    mutations: {
        setUploadBooksStatus(state, newState) {
          state.uploadBooksStatus.uploading = newState.uploading;
          state.uploadBooksStatus.solving = newState.solving;
          state.uploadBooksStatus.event = newState.event;
        },
        increaseViewerWidth(state) {
            if (state.readerSettings.viewerWidth < 100) {
             state.readerSettings.viewerWidth += 10;
            }
            localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
        },
        decreaseViewerWidth(state) {
            console.log(state);
            if (state.readerSettings.viewerWidth > 10) {
                state.readerSettings.viewerWidth -= 10;
            }
            localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
        },
        resetViewerWidth(state) {
            state.readerSettings.viewerWidth = 60;
            localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
        },
        increaseFontSize(state) {
            if (state.readerSettings.fontSize < 256){  
                state.readerSettings.fontSize += 2;
                localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
            }
        },
        decreaseFontSize(state) {
            if (state.readerSettings.fontSize > 4){              
                state.readerSettings.fontSize -= 2;
                localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
            }
        },
        resetFontSize(state) {
            state.readerSettings.fontSize = 20;
            localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
        },
        increaseLineHeight(state) {
            if (state.readerSettings.lineHeight < 360){  
                state.readerSettings.lineHeight += 10;
                localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
            }
        },
        decreaseLineHeight(state) {
            if (state.readerSettings.lineHeight > 30){              
                state.readerSettings.lineHeight -= 10;
                localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
            }
        },
        resetLineHeight(state) {
            state.readerSettings.lineHeight = 180;
            localStorage.setItem("readerSettings", JSON.stringify(state.readerSettings));
        },
        setCurBookTitle(state, bookTitle) {
            state.curBookTitle = bookTitle;
        },
        setCurBookChapter(state, bookChapter) {
            if (state.curBookChapter === bookChapter) {
                state.curBookChapter = null;
            } else {
                state.curBookChapter = bookChapter;
            }
        },
        setReaderSettings(state, someSettings) {
            state.readerSettings = {...state.readerSettings, ...someSettings};
            localStorage.setItem('readerSettings', JSON.stringify(state.readerSettings));
        }
      },
    actions: {
        loadStore({ commit }) {
            // if (localStorage.getItem('uploadBooksStatus')) {
            //   commit('setUploadBooksStatus', JSON.parse(localStorage.getItem('uploadBooksStatus')));
            // }
            if (localStorage.getItem('readerSettings')) {
                let readerSettings = JSON.parse(localStorage.getItem('readerSettings'));
                let settings = {
                    fontFamily: null,
                    viewerWidth: 60,
                    fontSize: 20,
                    lineHeight: 180,
                    firstLineIndent: false,
                    zoomLongPic: false,
                    scrollBarVisable: false,
                    ...readerSettings
                };
                commit('setReaderSettings', settings);
            }
          }
    }
});
