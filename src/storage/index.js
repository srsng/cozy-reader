// 使用tuari store api
import { Store } from '@tauri-apps/plugin-store';


class Storage {
    constructor() {
        this.store = new Store('store.bin');
    }
    async get(key) {
        return await this.store.get(key);
    }
    async set(key, value) {
        return await this.store.set(key, value);
    }
    async save() {
        return await this.store.save();
    }
}

export default new Storage();