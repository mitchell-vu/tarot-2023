import * as events from "events";
import { gsap } from "gsap";

declare interface PreloadAnimation {
  on(event: "finish", listener: () => void): this;
  on(event: "update", listener: (value: number) => void): this;
}

type AnimatedValueOptions = {
  from: number;
  to: number;
  duration: number;
  ease: string;
};

class PreloadAnimation extends events.EventEmitter {
  value = 0;
  animated = { value: 0 };
  options: AnimatedValueOptions;

  tl: gsap.core.Tween | null = null;

  constructor(from = 0, to = 100, duration = 4, ease = "power1.inOut") {
    super();

    this.options = {
      from,
      to,
      duration,
      ease,
    };

    this.animated.value = this.options.from;
  }

  to(value = 100) {
    this.value = value;

    const { to, duration, ease } = this.options;
    this.tl?.kill();

    const diff = value - this.animated.value;
    const $duration = (duration / to) * (diff < 0 ? 0 : diff);

    this.tl = gsap.to(this.animated, {
      value,
      duration: $duration,
      ease,
      onUpdate: () => {
        this.emit("update", this.animated.value);

        if (this.animated.value >= to) {
          this.emit("finish");
        }
      },
    });
  }
}

export default PreloadAnimation;
