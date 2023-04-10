import classNames from "classnames";
import { gsap } from "gsap";
import * as React from "react";
import { useParams } from "react-router-dom";
import SplitType from "split-type";

import { CardTag } from "@/components";
import { useStore } from "@/context/store";
import "./CardView.scss";

interface ICardViewProps {}

const CardView: React.FC<ICardViewProps> = (props) => {
  const { id } = useParams();
  if (!id) return null;

  const store = useStore();
  const card = React.useMemo(() => store?.getCards(id), [id]);

  const wrapperElement = React.useRef<HTMLDivElement | null>(null);
  const titleElement = React.useRef<HTMLDivElement | null>(null);
  const subtitleElement = React.useRef<HTMLDivElement | null>(null);
  const tagsElement = React.useRef<HTMLDivElement | null>(null);
  const descriptionElement = React.useRef<HTMLDivElement | null>(null);
  const mainBtn = React.useRef<HTMLButtonElement | null>(null);
  const subtitleSplitType: Array<any> = [];
  let timeline = gsap.timeline();

  React.useEffect(() => {
    store?.setView("spread", "home");
    store?.setBlockBtn(false);

    new Promise<void>((resolve) => {
      setTimeout(() => {
        if (titleElement.current) {
          new SplitType(titleElement.current, { types: "words" });

          gsap.set(titleElement.current, { opacity: 1 });
        }

        if (descriptionElement.current) {
          const children = descriptionElement.current?.children as HTMLCollection;

          for (let i = 0; i < children.length; i += 1) {
            const item = children[i] as HTMLElement;

            subtitleSplitType.push(new SplitType(item, { types: "lines", lineClass: "card-line" }));
          }
        }
        resolve();
      }, 100);
    }).then(() => {
      if (!store?.isLoading) {
        setAnimation();
      }
    });

    return () => {
      beforeLeave();
    };
  }, [store?.isLoading]);

  function setAnimation() {
    timeline?.kill();

    const element = descriptionElement.current;
    const lines = element ? element.querySelectorAll<HTMLElement>(".card-line") : [];
    const tagItems = tagsElement.current?.children as HTMLCollection;
    const titleItems = titleElement.current?.children as HTMLCollection;

    gsap.set(element, { opacity: 1 });

    timeline = gsap.timeline({
      delay: 0.3,
    });

    timeline
      .to(subtitleElement.current, { opacity: 1, y: 0, ease: "sine.out" })
      .to(
        titleItems,
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          ease: "sine.out",
          willChange: "transform, opacity",
        },
        "<",
      )
      .to(
        tagItems,
        {
          opacity: 1,
          stagger: 0.1,
          ease: "sine.out",
          delay: 0.2,
        },
        "<",
      )
      .to(
        lines,
        {
          opacity: 1,
          y: 0,
          stagger: 0.07,
          ease: "sine.out",
        },
        "<",
      )
      .to(mainBtn.current, { opacity: 1, ease: "sine.out" }, "<");
  }

  const beforeLeave = () => {
    return new Promise((resolve) => {
      store?.setBlockBtn(true);

      timeline
        .timeScale(2.0)
        .reverse()
        .then(() => resolve({}));
    });
  };

  return (
    <div className={classNames("card", { "_cover-header": true })} style={{ paddingTop: "calc(105px + 2rem)" }}>
      <div ref={wrapperElement} className="card__wrapper">
        <div className="card__img" style={{ visibility: "hidden" }}></div>
        <div>
          <div ref={subtitleElement} className="card__subtitle">
            <span className="card__subtitle-text">{card?.arcan}</span>
          </div>
          <h1 ref={titleElement} className="card__title text-h1">
            {card?.name}
          </h1>
          <div ref={tagsElement} className="card__tags">
            {card?.keywords.split(", ").map((name, index) => (
              <div key={index} className="card__tags-tag">
                <CardTag name={name} />
              </div>
            ))}
          </div>
          <div
            ref={descriptionElement}
            className="card__descriptions"
            dangerouslySetInnerHTML={{ __html: card?.description ?? "" }}
          />

          <button ref={mainBtn} className="spread__btn">
            <span>Read more</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardView;
