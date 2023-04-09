import * as React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { gsap } from "gsap";

import { useStore } from "@/context/store";
import { CardPage, HomePage } from "@/pages";
import { Header } from "@/components";
import { TarotMotion } from "@/modules/Tarot";
import PreloadAnimation from "@/modules/PreloadAnimation";
import CARDS from "@/__mocks__/cards.json";

const App: React.FC = () => {
  const params = useParams();
  const store = useStore();
  const motionEl = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const preloading = async () => {
      const preloader: HTMLElement | null | undefined = document.getElementById("app-preloader");
      const preloaderContent = preloader?.querySelector<HTMLDivElement>(".app-preloader__content");
      const preloaderBackground = preloader?.querySelector<HTMLDivElement>(".app-preloader__background");

      if (!preloader || !preloaderContent || !preloaderBackground) {
        throw new Error("No preloader element found");
      }

      const preloadAnimation = new PreloadAnimation();

      const updateHandler = (value: number) => {
        preloaderContent.innerHTML = `${String(Math.ceil(value))}%`;
      };

      const finishHandler = async () => {
        preloadAnimation.removeListener("update", updateHandler);
        preloadAnimation.removeListener("finish", finishHandler);

        const tl = gsap.timeline();

        tl.set(preloaderContent, {
          animation: "none",
          opacity: 1,
          y: 0,
          willChange: "opacity, transform",
        })
          .to(preloaderContent, {
            y: -75,
            duration: 0.85,
            opacity: 0,
            ease: "power2.in",
          })
          .add(() => {
            preloader.style.opacity = "0";
            store?.finishLoading();
          });
      };

      preloadAnimation.on("update", updateHandler);
      preloadAnimation.on("finish", finishHandler);

      preloadAnimation.to(10);

      // Fire off all the promises at once
      await Promise.all([TarotMotion.preload(), store?.setCards(CARDS)]);
      await TarotMotion.create(motionEl.current);

      preloadAnimation.to(40);

      const showScene = () => {
        const tl = gsap.timeline();

        tl.set(preloaderContent, { willChange: "auto" });
        tl.to(preloaderBackground, {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            gsap.set(preloaderBackground, { willChange: "auto" });
          },
        });

        const { cloudReposition, lightRadiusMultiplier } = TarotMotion.background.materialUniforms;

        tl.to(cloudReposition, { value: 0, duration: 5, ease: "elastic.out(0.4, 0.8)" }, "<");
        tl.to(lightRadiusMultiplier, { value: 1, duration: 5, ease: "elastic.out(0.6, 0.4)" }, "<");
      };

      showScene();

      preloadAnimation.to(100);
    };

    preloading();

    return () => {
      TarotMotion.kill();
    };
  }, []);

  return (
    <>
      <Header />
      <main>
        <div ref={motionEl} className="app-motion" />
        <div className="app-inner">
          <Routes>
            <Route path="*" element={<Navigate to="/" />} />

            <Route path="/" element={<HomePage />} />
            <Route path="card/:id" element={<CardPage />} />
          </Routes>
        </div>
      </main>
    </>
  );
};

export default App;
