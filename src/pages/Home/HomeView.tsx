import classNames from "classnames";
import * as React from "react";
import { gsap } from "gsap";
import SplitType from "split-type";

// @ts-ignore
import { ReactComponent as Star1 } from "@/assets/svg/star/1.svg";
// @ts-ignore
import { ReactComponent as Star2 } from "@/assets/svg/star/2.svg";
// @ts-ignore
import { ReactComponent as Star3 } from "@/assets/svg/star/3.svg";
import { useStore } from "@/context/store";

import "./HomeView.scss";

interface IHomeViewProps {}

const HomeView: React.FC<IHomeViewProps> = () => {
  const store = useStore();
  const subtitleElement = React.useRef<HTMLDivElement>(null);
  const [svgAnimation, setSvgAnimation] = React.useState({
    star1: false,
    star2: false,
    star3: false,
  });
  const mainBtn = React.useRef<HTMLButtonElement>(null);
  const elements: React.RefObject<HTMLDivElement>[] = React.useMemo(
    () =>
      [...Array(4)].reduce((refArr, _, index) => {
        refArr[index] = React.createRef<HTMLDivElement>();
        return refArr;
      }, []),
    [],
  );

  let timeline = gsap.timeline();
  let subtitleSplitType: any = null;

  React.useEffect(() => {
    store?.setBlockBtn(false);

    new Promise<void>((resolve) => {
      setTimeout(() => {
        if (subtitleElement.current) {
          subtitleSplitType = new SplitType(subtitleElement.current, { types: "words, lines" });
        }
        gsap.set(subtitleElement.current, { opacity: 1 });

        resolve();
      }, 300);
    });

    return () => {
      timeline?.kill();
    };
  }, []);

  React.useEffect(() => {
    if (!store?.isLoading) {
      setAnimation();
    }
  }, [store?.isLoading]);

  const lineAnimation = () => {
    const element = subtitleElement.current;
    const lines = element ? element.querySelectorAll(".line") : [];

    for (let i = 0; i < lines.length; i += 1) {
      const delay = i / lines.length;

      gsap.to(lines[i].children, {
        opacity: 1,
        y: 0,
        stagger: 0.005,
        delay,
        ease: "sine.out",
      });
    }
  };

  const setAnimation = () => {
    timeline?.kill();

    timeline = gsap.timeline({
      delay: 0.3,
      onStart() {
        lineAnimation();
      },
      onUpdate() {
        const timelineProgress = this.progress() * 10;

        if (timelineProgress >= 0.25) {
          setSvgAnimation((currState) => ({ ...currState, star1: true }));
        }
        if (timelineProgress >= 0.5) {
          setSvgAnimation((currState) => ({ ...currState, star2: true }));
        }
        if (timelineProgress >= 0.75) {
          setSvgAnimation((currState) => ({ ...currState, star3: true }));
        }
      },
    });

    timeline
      .to(
        elements.map((ref) => ref?.current),
        {
          opacity: 1,
          y: 0,
          ease: "sine.out",
          stagger: 0.05,
        },
      )
      .to(mainBtn.current, { opacity: 1, ease: "sine.out" });
  };

  const beforeLeave = () => {
    store?.setBlockBtn(true);

    return new Promise((res) => {
      timeline?.kill();

      const element = subtitleElement.current;
      const lines = element ? element.querySelectorAll(".line") : [];
      const stars = document.querySelectorAll(".home__star");

      timeline = gsap
        .timeline({
          onComplete() {
            res({});
          },
        })
        .timeScale(1.5);

      timeline
        .to(stars, { opacity: 0 })
        .to(
          elements.map((ref) => ref?.current),
          {
            opacity: 0,
            y: -20,
            delay: 0.05,
            willChange: "transform, opacity",
          },
          "<",
        )
        .to(
          lines,
          {
            opacity: 0,
            y: -20,
            stagger: 0.1,
            delay: 0.15,
            willChange: "transform, opacity",
          },
          "<",
        )
        .to(mainBtn.current, { opacity: 0, delay: 0.2 }, "<");
    });
  };

  const buttonClickHandler = async () => {
    await beforeLeave();
    store?.setView("spread", "home");
  };

  return (
    <div className={classNames("home", { "_cover-header": true })} style={{ paddingTop: "calc(105px + 2rem)" }}>
      <div className="home__hero">
        <div className="home__title text-h0">
          <div className="home__title-wrapper">
            <span ref={elements[0]}>New  </span>
            <span ref={elements[1]}>Year's</span>
            <div className="home__star">
              <Star1 className={classNames("svg-star", { active: svgAnimation.star1 })} />
            </div>
          </div>
          <div className="home__title-wrapper">
            <span ref={elements[2]}>Tarot</span>
            <div className="home__star">
              <Star2 className={classNames("svg-star", { active: svgAnimation.star2 })} />
            </div>
            <span ref={elements[3]}>Reading</span>
            <div className="home__star">
              <Star3 className={classNames("svg-star", { active: svgAnimation.star3 })} />
            </div>
          </div>
        </div>

        <p ref={subtitleElement} className="home__subtitle">
          In 2022, the Tarot cards experienced their rebirth: artists from all over the world created their decks, and
          even global brands resorted to the symbolism of Tarot in their collections. We weren't left out and created a
          Water Rabbit deck that predicts the future!
        </p>

        <button
          ref={mainBtn}
          onClick={buttonClickHandler}
          className={classNames("home__btn", { _disabled: store?.isBlockBtn })}
          disabled={store?.isBlockBtn}
        >
          <span>Looking to 2023</span>
        </button>
      </div>
    </div>
  );
};

export default HomeView;
