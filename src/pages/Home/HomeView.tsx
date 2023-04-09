import classNames from "classnames";
import * as React from "react";
// @ts-ignore
import { ReactComponent as Star1 } from "../../assets/star/1.svg";
// @ts-ignore
import { ReactComponent as Star2 } from "../../assets/star/2.svg";
// @ts-ignore
import { ReactComponent as Star3 } from "../../assets/star/3.svg";
import "./HomeView.scss";

interface IWelcomeViewProps {
  toggleView: () => void;
}

const WelcomeView: React.FC<IWelcomeViewProps> = ({ toggleView }) => {
  return (
    <div
      className={classNames("home", { "cover-header": true })}
      style={{ paddingTop: "calc(105px + 2rem)" }}
    >
      <div className="home__hero">
        <div className="home__title text-h0">
          <div className="home__title-wrapper">
            <span>New  </span>
            <span>Year's</span>
            <div className="home__star">
              <Star1 />
            </div>
          </div>
          <div className="home__title-wrapper">
            <span>Tarot</span>
            <div className="home__star">
              <Star2 />
            </div>
            <span>Reading</span>
            <div className="home__star">
              <Star3 />
            </div>
          </div>
        </div>

        <p className="home__subtitle">
          In 2022, the Tarot cards experienced their rebirth: artists from all over the world
          created their decks, and even global brands resorted to the symbolism of Tarot in their
          collections. We weren't left out and created a Water Rabbit deck that predicts the future!
        </p>

        <button onClick={toggleView} className="home__btn">
          <span>Looking to 2023</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeView;
