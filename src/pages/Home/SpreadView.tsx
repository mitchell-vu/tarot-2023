import * as React from "react";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import SplitType from "split-type";

import { useStore } from "@/context/store";
import StarImg from "@/assets/image/star.png";
// @ts-ignore
import { ReactComponent as StarBorder } from "@/assets/svg/starBorder.svg";
import "./SpreadView.scss";
import { TarotMotion } from "@/modules/Tarot";
import { isTablet } from "react-device-detect";

interface ISpreadViewProps {}

const SpreadView: React.FC<ISpreadViewProps> = () => {
  const navigate = useNavigate();
  const store = useStore();

  const titleElement = React.useRef<HTMLDivElement>(null);
  const subtitleElement = React.useRef<HTMLDivElement>(null);
  const star = React.useRef<HTMLDivElement>(null);
  const mainBtn = React.useRef<HTMLButtonElement>(null);

  const [svgAnimation, setSvgAnimation] = React.useState(false);

  let timeline = gsap.timeline();
  let subtitleSplitType: SplitType | null = null;

  React.useEffect(() => {
    new Promise<void>((resolve) => {
      store?.setBlockBtn(false);

      setTimeout(() => {
        if (subtitleElement.current) {
          subtitleSplitType = new SplitType(subtitleElement.current, { types: "words, lines" });
        }

        gsap.set(subtitleElement.current, { opacity: 1 });

        resolve();
      }, 100);
    }).then(() => {
      if (!store?.isLoading) {
        store?.setView("spread", "home");
        setAnimation();
      }
    });

    return () => {
      timeline?.kill();
      TarotMotion.cards?.removeListener("click", clickHandler);
    };
  }, []);

  const setAnimation = async () => {
    timeline?.kill();

    const subtitle = subtitleElement.current;
    const title = titleElement.current;

    const subtitleWords = subtitle?.querySelectorAll<HTMLElement>(".word");
    const spanTitles = title?.querySelectorAll<HTMLElement>("span");

    const { detailMode } = TarotMotion.cards;

    if (detailMode) await TarotMotion.cards.backToChoice();

    timeline = gsap.timeline({
      delay: detailMode ? 0 : 0.2,
      onStart() {
        gsap.to(star.current, {
          scale: 1,
          ease: "power4.out",
          duration: 1,
          willChange: "transform",
        });

        if (!detailMode) {
          TarotMotion.cards.show();
        }

        TarotMotion.cards.once("click", clickHandler);
      },
      onUpdate() {
        const progress = this.progress();

        if (progress * 10 > 4) {
          setSvgAnimation(true);
        }
      },
    });

    timeline
      .to(spanTitles!, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        ease: "sine.inOut",
      })
      .to(
        subtitleWords!,
        {
          opacity: 1,
          rotate: 0,
          y: 0,
          ease: "sine.inOut",
          stagger: 0.05,
        },
        ">-0.7",
      )
      .fromTo(mainBtn.current, { pointerEvents: "none" }, { opacity: 1, ease: "sine.out" })
      .set(mainBtn.current, { clearProps: "pointerEvents" });
  };

  const beforeLeave = () => {
    return new Promise((resolve) => {
      timeline?.kill();

      const element = subtitleElement.current;
      const lines = element ? element.querySelectorAll(".line") : [];

      const animation = async () => {
        timeline = gsap
          .timeline({
            onComplete: isTablet ? undefined : resolve,
          })
          .timeScale(1.5);

        timeline
          .to(star, { opacity: 0 })
          .to(
            lines,
            {
              opacity: 0,
              y: -20,
              stagger: 0.1,
              delay: 0.05,
              willChange: "transform, opacity",
            },
            "<",
          )
          .to(
            titleElement.current,
            {
              opacity: 0,
              y: -20,
              stagger: 0.1,
              delay: 0.1,
              willChange: "transform, opacity",
            },
            "<",
          )
          .to(mainBtn.current, { opacity: 0 }, "<");

        if (isTablet) {
          await TarotMotion.cards.toDetail(false);

          resolve({});
        } else {
          TarotMotion.cards.toDetail(false);
        }
      };

      animation();
    });
  };

  const clickHandler = async () => {
    store?.setBlockBtn(true);
    await beforeLeave();

    navigate(`/card/${2}`, { replace: true });
    // RabbitsStore.update();
  };

  const randomCardPick = async () => {
    if (!TarotMotion.cards.allowChange) return;

    store?.setBlockBtn(true);
    await TarotMotion.cards.random();
    TarotMotion.cards.onClick();
  };

  return (
    <div className={classNames("spread", { "_cover-header": true })} style={{ paddingTop: "calc(105px + 2rem)" }}>
      <div className="spread__wrapper">
        <div className="spread__wrapper-content">
          <div ref={titleElement} className="spread__title text-h0">
            <div className="spread__title-wrapper">
              <span>Draw</span>
              <div ref={star} className="spread__star">
                <img src={StarImg} alt="Star" />
                <StarBorder className={classNames("svg-star", { active: svgAnimation })} />
              </div>
            </div>
            <span>A Card</span>
          </div>

          <p ref={subtitleElement} className="spread__subtitle">
            The Water Rabbit tells you what your year 2023 will be like, including the areas of finance and love! Pull
            the card and read your personalised forecast!
          </p>

          <button ref={mainBtn} onClick={randomCardPick} className="spread__btn">
            <span>I'm lucky</span>
          </button>
        </div>
        <div className="spread__img" style={{ zIndex: 1 }} />
      </div>
    </div>
  );
};

export default SpreadView;
