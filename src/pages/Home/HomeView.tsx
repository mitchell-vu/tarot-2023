import classNames from "classnames";
import * as React from "react";
import { gsap } from "gsap";
import SplitType from "split-type";

// @ts-ignore
import { ReactComponent as Star1 } from "@/assets/star/1.svg";
// @ts-ignore
import { ReactComponent as Star2 } from "@/assets/star/2.svg";
// @ts-ignore
import { ReactComponent as Star3 } from "@/assets/star/3.svg";
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
  const firstElement = React.useRef<HTMLElement>(null);
  const secondElement = React.useRef<HTMLElement>(null);
  const mainBtn = React.useRef<HTMLButtonElement>(null);

  let timeline = gsap.timeline();
  let subtitleSplitType: any = null;

  React.useEffect(() => {
    setTimeout(() => {
      // checkCoverHeader();
      if (subtitleElement.current) {
        subtitleSplitType = new SplitType(subtitleElement.current, { types: "words, lines" });
      }

      gsap.set(subtitleElement.current, { opacity: 1 });
    }, 300);
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
      .to(firstElement.current, {
        opacity: 1,
        y: 0,
        ease: "sine.out",
        stagger: 0.05,
      })
      .to(
        secondElement.current,
        {
          opacity: 1,
          y: 0,
          ease: "sine.out",
          stagger: 0.05,
        },
        ">-0.7",
      )
      .to(mainBtn.current, { opacity: 1, ease: "sine.out" });
  };

  return (
    <div className={classNames("home", { "_cover-header": true })} style={{ paddingTop: "calc(105px + 2rem)" }}>
      <div className="home__hero">
        <div className="home__title text-h0">
          <div className="home__title-wrapper">
            <span ref={firstElement}>New  </span>
            <span ref={secondElement}>Year's</span>
            <div className="home__star">
              <Star1 className={classNames("svg-star", { active: svgAnimation.star1 })} />
            </div>
          </div>
          <div className="home__title-wrapper">
            <span>Tarot</span>
            <div className="home__star">
              <Star2 className={classNames("svg-star", { active: svgAnimation.star2 })} />
            </div>
            <span>Reading</span>
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

        <button ref={mainBtn} onClick={() => store?.setView("spread", "home")} className="home__btn">
          <span>Looking to 2023</span>
        </button>
      </div>
    </div>
  );
};

export default HomeView;
