import * as THREE from "three";
import { gsap } from "gsap";
import { isMobile } from "react-device-detect";

import { Assets } from "@/modules/Tarot/Assets";
import { calcCameraSizes, delay, log } from "@/modules/Tarot/utils";
import { FRUSTUM_SIZE, CLOUD_TEXTURE_PATH, STAR_TEXTURE_PATH } from "@/modules/Tarot/constants";
import TarotBackground from "@/modules/Tarot/TarotBackground";
import Points from "@/modules/Tarot/Points";
import Cards from "@/modules/Tarot/Cards";

// App motion module including webgl background and cards models
class Tarot {
  preloadDone = false;

  UI: { [key: string]: HTMLElement } = {};

  sizes = {
    width: 0,
    height: 0,
    aspectRatio: 1,
  };

  mouse: Coords = {
    x: 0,
    y: 0,
  };

  scene: THREE.Scene;
  scene2: THREE.Scene;
  camera: THREE.OrthographicCamera;
  camera2: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  background: TarotBackground;
  points: Points;
  cards: Cards;

  resizeHandler: () => void;
  renderHandler: () => void;

  backgroundLightMotionTl: gsap.core.Tween | null = null;

  // ----------------------------------------------------------------

  public preload() {
    return new Promise((resolve) => {
      const loadingManager = new THREE.LoadingManager();
      const textureLoader = new THREE.TextureLoader(loadingManager);

      const cloudTexture = textureLoader.load(CLOUD_TEXTURE_PATH);
      const starTexture = textureLoader.load(STAR_TEXTURE_PATH);

      loadingManager.onLoad = () => {
        Assets.set("cloudTexture", cloudTexture);
        Assets.set("starTexture", starTexture);
        this.preloadDone = true;

        resolve({});
      };
    });
  }

  /**
   * @param element
   */
  public async create(element: HTMLElement | null) {
    if (!this.preloadDone) throw new Error("Preload assets first");
    if (element === null) throw new Error("Element is null");

    this.UI.element = element;

    await this.createScene();
  }

  private async createScene() {
    this.resize();

    const { width, height, aspectRatio } = this.sizes;

    this.scene = new THREE.Scene();
    this.scene2 = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(
      (FRUSTUM_SIZE * aspectRatio) / -2,
      (FRUSTUM_SIZE * aspectRatio) / 2,
      FRUSTUM_SIZE / 2,
      FRUSTUM_SIZE / -2,
      -FRUSTUM_SIZE,
      1,
    );
    this.scene.add(this.camera);

    this.camera2 = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    this.camera2.position.z = 5;

    calcCameraSizes(this.camera2);

    this.background = new TarotBackground(width, height);
    this.scene.add(this.background.mesh);

    this.points = new Points(width, height);
    this.scene.add(this.points.group);

    this.cards = new Cards(width, height, this.camera2, this.scene2);
    this.scene2.add(this.cards.group);

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.UI.element.append(this.renderer.domElement);

    await this.warmUp();

    this.bindEvents();
    this.enableOnMousemoveBackgroundMotion();

    await delay(150);
  }

  // TODO: Add warn up function
  private async warmUp() {
    this.render();

    await delay(350);

    const { cloudReposition, lightRadiusMultiplier } = this.background.materialUniforms;

    cloudReposition.value = 0.25;
    lightRadiusMultiplier.value = 0;
    this.cards.hide();
  }

  private bindEvents() {
    this.resizeHandler = this.resize.bind(this);
    this.renderHandler = this.render.bind(this);

    window.addEventListener("resize", this.resizeHandler);
    gsap.ticker.add(this.renderHandler);
  }

  private resize() {
    const { element } = this.UI;
    const { offsetWidth: width, offsetHeight: height } = element;
    const aspectRatio = width / height;

    this.sizes = { width, height, aspectRatio };

    this.renderer?.setSize(width, height);
    this.renderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.camera && this.camera2) {
      Object.assign(this.camera, {
        left: (FRUSTUM_SIZE * aspectRatio) / -2,
        right: (FRUSTUM_SIZE * aspectRatio) / 2,
      });
      this.camera.updateProjectionMatrix();

      this.camera2.aspect = aspectRatio;
      this.camera2.updateProjectionMatrix();

      calcCameraSizes(this.camera2);
    }

    this.cards?.resize(width, height);

    this.background?.setSize(width, height);
  }

  private render(time = 0) {
    this.background.update(time, this.mouse);
    this.points.update(time);
    this.cards.update();

    this.renderer.autoClear = true;
    this.renderer.render(this.scene, this.camera);

    this.renderer.autoClear = false;
    this.renderer.render(this.scene2, this.camera2);
  }

  enableOnMousemoveBackgroundMotion() {
    const { element } = this.UI;

    if (isMobile) {
      log("Background light motion is disabled for mobile devices");

      return;
    }

    if (!this.background) {
      throw new Error("Background instance does not exist");
    }

    document.documentElement.addEventListener("mousemove", ({ clientX, clientY }) => {
      const { width, height } = this.sizes;
      const { x, y } = this.background.materialUniforms.lightPosition.value;
      const pixelRatio = Math.min(window.devicePixelRatio, 2);

      this.mouse = {
        x: clientX - width / 2,
        y: clientY - height / 2,
      };

      const animated = {
        x: x / pixelRatio,
        y: y / pixelRatio,
      };

      this.backgroundLightMotionTl?.kill();
      this.backgroundLightMotionTl = gsap.to(animated, {
        x: clientX,
        y: element.offsetHeight - clientY,
        duration: 0.25,
        ease: "power1.out",
        onUpdate: () => {
          this.background?.setLightPosition(animated.x, animated.y);
        },
      });
    });
  }

  kill() {
    window.removeEventListener("resize", this.resizeHandler);
    gsap.ticker.remove(this.renderHandler);
  }
}

export const TarotMotion = new Tarot();
