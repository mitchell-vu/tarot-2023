import * as THREE from "three";
import { gsap } from "gsap";
import events from "events";
import { isMobile } from "react-device-detect";

import { cameraSizes, getRandomInt, isTablet } from "./utils";
import RabbitsStore from "./RabbitsStore";

declare interface Cards {
  on(event: "click", listener: () => void): this;
  on(event: "focus", listener: () => void): this;
  on(event: "blur", listener: () => void): this;
}

const PLANE_PARAMS = () => [2.72 * 0.9, 4 * 0.9, 1, 1];
const GAP = 0.5;
const I = 5;

class Cards extends events.EventEmitter {
  group = new THREE.Group();
  geometryFront = new THREE.PlaneGeometry(...PLANE_PARAMS());
  geometryBack = new THREE.PlaneGeometry(...PLANE_PARAMS()).applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));
  materialFront = new THREE.MeshBasicMaterial({
    depthTest: false,
    transparent: true,
    side: THREE.DoubleSide,
  });
  materialBack = new THREE.MeshBasicMaterial({ depthTest: false, transparent: true });

  private $scrollY = 0;
  boxSizeY = 0;
  boxSizeX = 0;
  maxTop = 0;
  maxBottom = 0;

  direction = "up";

  current = 1;

  allowChange = false;
  allowPoint = false;

  nextHandler: () => void;
  prevHandler: () => void;
  mousemoveHandler: (e: MouseEvent) => void;
  clickHandler: () => void;

  sizes = {
    width: 0,
    height: 0,
  };

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  pointerM = new THREE.Vector2();

  detailMode = false;

  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;

  captured = false;
  startTouch = new THREE.Vector3();
  endTouch = new THREE.Vector3();

  constructor(width: number, height: number, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    super();

    this.createMeshes(4);
    this.camera = camera;
    this.scene = scene;

    this.maxTop = cameraSizes.height / 2 + this.boxSizeY;
    this.maxBottom = -cameraSizes.height / 2 - this.boxSizeY;

    this.resize(width, height);

    this.nextHandler = this.next.bind(this);
    this.prevHandler = this.prev.bind(this);
    this.mousemoveHandler = this.onMouseMove.bind(this);
    this.clickHandler = this.onClick.bind(this);

    if (!isMobile) {
      window.addEventListener("wheelup", this.nextHandler);
      window.addEventListener("wheeldown", this.prevHandler);
      window.addEventListener("mousemove", this.mousemoveHandler);
    } else {
      document.getElementById("main")?.addEventListener("touchstart", (e) => {
        if (!this.allowChange) return;

        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;

        const pointer = new THREE.Vector2();

        pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(pointer, camera);
        const intersects = this.raycaster.intersectObjects(scene.children);

        if (intersects) {
          this.startTouch = new THREE.Vector3(x, y, 0);
          this.captured = true;
        }
      });
      document.getElementById("main")?.addEventListener("touchend", (e) => {
        const x = e.changedTouches?.[0]?.clientX;
        const y = e.changedTouches?.[0]?.clientY;

        this.endTouch = new THREE.Vector3(x, y, 0);

        if (this.allowChange) {
          const dist = this.endTouch.distanceTo(this.startTouch);

          if (dist > 100) {
            if (this.endTouch.y > this.startTouch.y) {
              this.prev();
            } else {
              this.next();
            }
          }
        }

        // gsap.to(this.camera.position, { y: 0 });

        this.captured = false;
      });
      document.getElementById("main")?.addEventListener("touchcancel", (e) => {
        const x = e.changedTouches?.[0]?.clientX;
        const y = e.changedTouches?.[0]?.clientY;

        this.endTouch = new THREE.Vector3(x, y, 0);

        if (this.allowChange) {
          const dist = this.endTouch.distanceTo(this.startTouch);

          if (dist > 100) {
            if (this.endTouch.y > this.startTouch.y) {
              this.prev();
            } else {
              this.next();
            }
          }
        }

        // gsap.to(this.camera.position, { y: 0 });

        this.captured = false;
      });
      document.getElementById("main")?.addEventListener("click", (e) => {
        if (!this.allowChange) return;
        this.onMouseMove(e);

        this.raycaster.setFromCamera(this.pointer, camera);
        const intersects = this.raycaster.intersectObjects(scene.children);

        if (!intersects.length) {
          return;
        }

        intersects.forEach(({ object }) => {
          if (object.userData.index !== this.current) {
            return;
          }

          this.emit("focus");
          this.onClick();
        });
      });
      document.getElementById("main")?.addEventListener(
        "touchmove",
        (e) => {
          // e.preventDefault();

          if (!this.allowChange) return;
          this.onTouchMove(e);

          // без { passive: true } не работает скролл на мобилке
        },
        { passive: true },
      );
    }
  }

  private createMeshes(count: number) {
    for (let i = 0; i < count; i += 1) {
      const card = new THREE.Group();
      const cardWrapper = new THREE.Group();

      const { geometryFront, geometryBack, materialFront, materialBack } = this;

      const front = new THREE.Mesh(geometryFront, materialFront);

      front.userData.index = i;

      card.add(front);
      cardWrapper.add(card);

      this.group.add(cardWrapper);

      if (!this.boxSizeY) {
        const { min, max } = new THREE.Box3().setFromObject(card);
        this.boxSizeY = Math.abs(min.y - max.y);
        this.boxSizeX = Math.abs(min.x - max.x);
      }

      card.position.y = (this.boxSizeY + GAP) * -i;
      card.userData.originY = card.position.y;
    }
  }

  public setBack() {
    const { selection } = RabbitsStore;
    const texture = RabbitsStore.assets.get(selection);

    this.materialBack.map = texture;
    this.materialBack.needsUpdate = true;

    const back = new THREE.Mesh(this.geometryBack, this.materialBack);
    back.userData.index = this.current;

    const card = this.group.children[this.current].children[0];
    card.add(back);
  }

  public get scrollY(): number {
    return this.$scrollY;
  }

  public set scrollY(value: number) {
    const { direction } = this;
    this.$scrollY = value;
    const box = new THREE.Box3();

    this.group.children.forEach((wrapper, index) => {
      // eslint-disable-next-line no-param-reassign
      wrapper.position.y = value;
      const { min, max } = box.setFromObject(wrapper);
      const card = wrapper.children[0];
      const groupLast = this.group.children.length - 1;
      const center = new THREE.Vector3();
      box.getCenter(center);
      const toCenter = center.distanceTo(new THREE.Vector3(center.x, 0, center.z)) * 0.1;

      card.rotation.x = center.y < 0 ? toCenter : -toCenter;
      card.position.z = -toCenter;

      if (direction === "up") {
        const val = max.y;

        if (val < this.maxTop) return;

        let prevIndex = index - 1;
        if (prevIndex < 0) prevIndex = groupLast;
        const prevCard = this.group.children[prevIndex].children[0];

        card.position.y = prevCard.position.y - this.boxSizeY - GAP;
      } else {
        const val = min.y;

        if (val > this.maxBottom) return;

        let nextIndex = index + 1;
        if (nextIndex > groupLast) nextIndex = 0;
        const nextCard = this.group.children[nextIndex].children[0];
        card.position.y = nextCard.position.y + this.boxSizeY + GAP;
      }
    });
  }

  public async goToCard(index: number, duration = isMobile ? 0.75 : 1.25) {
    const wrapper = this.group.children[index];
    this.current = index;

    const box = new THREE.Box3();
    box.setFromObject(wrapper);

    const wrapperCenter = new THREE.Vector3();
    box.getCenter(wrapperCenter);
    const dist = wrapperCenter.distanceTo(new THREE.Vector3(wrapperCenter.x, 0, wrapperCenter.z));

    const res = wrapperCenter.y < 0 ? dist : -dist;

    await new Promise((resolve) => {
      gsap.to(this, {
        scrollY: this.$scrollY + res,
        duration,
        ease: isMobile ? undefined : "back.inOut(1.7)",
        onComplete: resolve,
      });
    });
  }

  public setMainTexture() {
    this.materialFront.map = RabbitsStore.assets.get("main");
    this.materialFront.needsUpdate = true;
  }

  public hide() {
    this.group.position.y = cameraSizes.height / -2 - this.boxSizeY / 2;
  }

  public async show(instantly = false) {
    const first = this.group.children[0];
    const box = new THREE.Box3();
    box.setFromObject(first);
    const firstCenter = new THREE.Vector3();
    box.getCenter(firstCenter);

    const farY = firstCenter.y + (this.boxSizeY + GAP) * -I;

    await new Promise((resolve) => {
      gsap.to(this, {
        scrollY: -farY,
        duration: instantly ? 0.3 : 3,
        ease: "power2.out",
        onComplete: resolve,
      });
    });

    this.allowChange = true;
  }

  public resize(width: number, height: number) {
    const cameraQuoter = cameraSizes.width / 4;

    this.group.position.x = isTablet() ? 0 : cameraQuoter;
    this.sizes = {
      width,
      height,
    };

    if (this.detailMode) {
      this.toDetail(true);
    }
  }

  public async next() {
    if (!this.allowChange) return;

    this.direction = "up";
    let next = this.current + 1;

    if (next > this.group.children.length - 1) {
      next = 0;
    }

    this.allowChange = false;
    await this.goToCard(next);
    this.allowChange = true;
  }

  public async prev() {
    if (!this.allowChange) return;

    this.direction = "down";
    let prev = this.current - 1;

    if (prev < 0) {
      prev = this.group.children.length - 1;
    }

    this.allowChange = false;
    await this.goToCard(prev);
    this.allowChange = true;
  }

  public async random() {
    const i = getRandomInt(10, 20);
    const res = this.scrollY + (this.boxSizeY + GAP) * -i;
    const duration = i * 0.2;

    this.direction = "down";
    this.allowChange = false;

    await new Promise((resolve) => {
      gsap.to(this, {
        scrollY: res,
        duration,
        ease: "power2.inOut",
        onComplete: resolve,
        onUpdate: () => {
          this.allowChange = false;
        },
      });
    });

    const box = new THREE.Box3();
    let result: undefined | number;
    let index = 0;
    this.group.children.forEach((wrapper, ind) => {
      box.setFromObject(wrapper);
      const center = new THREE.Vector3();
      box.getCenter(center);

      const dist = center.distanceTo(new THREE.Vector3(center.x, 0, center.z));

      if (result === undefined || dist < result) {
        result = dist;
        index = ind;
      }
    });

    this.current = index;
    this.allowChange = true;
  }

  private onTouchMove(event: TouchEvent) {
    this.pointerM.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    this.pointerM.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  }

  private onMouseMove(event: MouseEvent) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  update() {
    const { camera, scene } = this;

    const reset = () => {
      if (!isMobile) {
        gsap.set(document.documentElement, { clearProps: "cursor" });
        document.removeEventListener("click", this.clickHandler);
      }

      this.emit("blur");
    };

    if (!this.allowChange) {
      reset();
      return;
    }

    if (false) {
      const targetY = this.pointerM.y * -0.75;

      // eslint-disable-next-line no-param-reassign
      camera.position.y += 0.1 * (targetY - camera.position.y);

      return;
    }

    this.raycaster.setFromCamera(this.pointer, camera);
    const intersects = this.raycaster.intersectObjects(scene.children);

    if (!intersects.length) {
      reset();
    }

    intersects.forEach(({ object }) => {
      if (object.userData.index !== this.current) {
        reset();

        return;
      }

      this.emit("focus");
      if (!isMobile) {
        document.addEventListener("click", this.clickHandler);
        gsap.set(document.documentElement, { cursor: "pointer" });
      }
    });
  }

  onClick() {
    if (!this.allowChange) return;

    this.setBack();

    this.emit("click");
  }

  public async toDetail(instantly = false) {
    const currentWrapper = this.group.children[this.current];
    const currentCard = currentWrapper.children[0];

    let nextIndex = this.current + 1;
    if (nextIndex > this.group.children.length - 1) nextIndex = 0;

    let prevIndex = this.current - 1;
    if (prevIndex < 0) prevIndex = this.group.children.length - 1;

    const nextWrapper = this.group.children[nextIndex];
    const nextCard = nextWrapper.children[0];

    const prevWrapper = this.group.children[prevIndex];
    const prevCard = prevWrapper.children[0];

    if (this.allowChange) {
      currentCard.userData.originY = currentCard.position.y;
      prevCard.userData.originY = prevCard.position.y;
      nextCard.userData.originY = nextCard.position.y;
    }

    this.allowChange = false;
    const method = instantly ? "set" : "to";

    await new Promise((resolve) => {
      const tl = gsap.timeline({ delay: instantly ? undefined : 0.1, onComplete: resolve });

      tl[method](prevCard.position, { y: prevCard.position.y + this.boxSizeY / 2, duration: 0.35 });
      tl[method](
        nextCard.position,
        { y: nextCard.position.y - this.boxSizeY / 2, duration: 0.35 },
        instantly ? undefined : "<",
      );

      if (isTablet()) {
        tl[method](
          currentCard.rotation,
          { y: Math.PI, duration: 1.25, ease: "back.in(1.3)" },
          instantly ? undefined : "<",
        );
        tl[method](
          currentCard.position,
          { y: currentCard.position.y - this.boxSizeY * 2, duration: 1.0, ease: "back.in(1.3)" },
          instantly ? undefined : ">1.0",
        );

        return;
      }

      tl[method](
        currentCard.position,
        { y: currentCard.position.y - this.boxSizeY * 2, duration: 1.0, ease: "back.in(1.3)" },
        instantly ? undefined : "<",
      );
      tl[method](
        currentCard.rotation,
        { y: Math.PI * 0.5, duration: 1, ease: "back.in(1.3)" },
        instantly ? undefined : "<",
      );

      tl.add(() => {
        currentCard.rotation.y = Math.PI * 0.75;
        currentCard.position.x = -cameraSizes.width * 0.5;
      });

      tl[method](currentCard.position, {
        y: currentCard.userData.originY,
        duration: 1.0,
        ease: "back.out(1.3)",
        onStart: resolve,
      });
      tl[method](currentCard.rotation, { y: Math.PI, duration: 1, ease: "back.out(1.3)" }, instantly ? undefined : "<");
    });

    this.detailMode = true;
  }

  async prepareForDetail() {
    this.group.visible = false;

    await this.show(true);
    this.setBack();
    this.toDetail().then(() => {
      this.group.visible = true;
    });
  }

  public async backToChoice() {
    if (!this.detailMode) return;

    this.allowChange = false;

    const currentWrapper = this.group.children[this.current];
    const currentCard = currentWrapper.children[0];

    let nextIndex = this.current + 1;
    if (nextIndex > this.group.children.length - 1) nextIndex = 0;

    let prevIndex = this.current - 1;
    if (prevIndex < 0) prevIndex = this.group.children.length - 1;

    const nextWrapper = this.group.children[nextIndex];
    const nextCard = nextWrapper.children[0];

    const prevWrapper = this.group.children[prevIndex];
    const prevCard = prevWrapper.children[0];

    await new Promise((resolve) => {
      const tl = gsap.timeline({
        delay: 0.1,
        onComplete: () => {
          this.allowChange = true;
        },
      });

      tl.to(
        currentCard.position,
        { y: currentCard.userData.originY - this.boxSizeY * 2, duration: 1.0, ease: "back.in(1.3)" },
        "<",
      );
      tl.to(currentCard.rotation, { y: Math.PI * 0.5, duration: 1, ease: "back.in(1.3)" }, "<");

      tl.add(() => {
        currentCard.rotation.y = Math.PI * 0.25;
        currentCard.position.x = 0;
      });

      tl.to(currentCard.position, {
        y: currentCard.userData.originY,
        duration: 1.0,
        ease: "back.out(1.3)",
        onStart: resolve,
      });
      tl.to(currentCard.rotation, { y: 0, duration: 1, ease: "back.out(1.3)" }, "<");

      tl.to(prevCard.position, { y: prevCard.userData.originY, duration: 0.35 }, ">-0.35");
      tl.to(nextCard.position, { y: nextCard.userData.originY, duration: 0.35 }, "<");
    });

    this.detailMode = false;
  }
}

export default Cards;
