import * as React from "react";
import "./SpreadView.scss";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";

interface ISpreadViewProps {}

const SpreadView: React.FC<ISpreadViewProps> = () => {
  const navigate = useNavigate();

  const randomCardPick = () => {
    navigate("/card/8");
  };

  return (
    <div
      className={classNames("spread", { "_cover-header": true })}
      style={{ paddingTop: "calc(105px + 2rem)" }}
    >
      <div className="spread__wrapper">
        <div className="spread__wrapper-content">
          <div className="spread__title text-h0">
            <div className="spread__title-wrapper">
              <span>Draw</span>
              <div className="spread__star">{/* <img src="" alt="" /> */}</div>
            </div>
            <span>A Card</span>
          </div>

          <p className="spread__subtitle">
            The Water Rabbit tells you what your year 2023 will be like, including the areas of
            finance and love! Pull the card and read your personalised forecast!
          </p>

          <button onClick={randomCardPick} className="spread__btn">
            <span>I'm lucky</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpreadView;
