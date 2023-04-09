// import { store } from '@/store';
import * as THREE from "three";
import { COVER_TEXTURES_PATH, MAIN_COVER_TEXTURE_PATH } from "@/modules/Tarot/constants";
import { RawCard } from "@/vite-env";

class RabbitsStore {
  data: Array<RawCard>;
  assets = new Map();
  futureSelection = "";
  selection = "";
  selected: Array<string> = [];
  loader = new THREE.TextureLoader();

  init(cards: RawCard[], id: string) {
    this.data = cards;
    this.selection = id || this.getRandomCard();
    this.futureSelection = this.getRandomCard();
  }

  async preload(onProgress: () => any = () => false) {
    const cover1 = this.loadCover(this.selection).then(() => onProgress());
    const cover2 = this.loadCover(this.futureSelection).then(() => onProgress());
    const mainCover = new Promise((resolve) => {
      this.loader.load(MAIN_COVER_TEXTURE_PATH, (texture) => {
        this.assets.set("main", texture);
        onProgress();

        resolve({});
      });
    });

    await Promise.all([cover1, cover2, mainCover]);
  }

  loadCover(id: string) {
    return new Promise((resolve) => {
      if (this.assets.has(id)) {
        resolve({});

        return;
      }

      this.loader.load(`${`${COVER_TEXTURES_PATH}${id}`}.png`, (texture) => {
        this.assets.set(id, texture);

        resolve({});
      });
    });
  }

  getRandomCard(): string {
    let available = this.data.filter(({ id }) => !this.selected.includes(id));
    if (available.length < 10) {
      this.selected = [];
      available = this.data;
    }

    const res = available[Math.floor(Math.random() * available.length)].id;
    this.selected.push(res);

    return res;
  }

  update() {
    this.selection = this.futureSelection;
    this.futureSelection = this.getRandomCard();

    this.loadCover(this.futureSelection);
  }
}

export default new RabbitsStore();
