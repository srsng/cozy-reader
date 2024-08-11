import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/tauri';

export const useMainStore = defineStore('main', {
  state: () => ({
    data: null,
    keys: []
  }),
  actions: {
    async fetchData() {
      try {
        this.data = await invoke('get_data');
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    },
    async fetchKeys() {
      try {
        this.keys = await invoke('get_keys');
      } catch (error) {
        console.error('Failed to fetch keys:', error);
      }
    }
  }
});