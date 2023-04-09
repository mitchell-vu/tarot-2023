import * as React from "react";
import { useParams } from "react-router-dom";
import classNames from "classnames";

import CARDS from "@/__mocks__/cards.json";
import { CardTag } from "@/components";
import "./CardView.scss";

interface ICardViewProps {}

const CardView: React.FC<ICardViewProps> = (props) => {
  const { id } = useParams();
  if (!id) return null;

  const [card, setCard] = React.useState(CARDS.find((c) => c.id === id));

  return (
    <div className={classNames("card", { "_cover-header": true })} style={{ paddingTop: "calc(105px + 2rem)" }}>
      <div className="card__wrapper">
        <div className="card__img" style={{ visibility: "hidden" }}></div>
        <div>
          <div className="card__subtitle">
            <span className="card__subtitle-text">{card?.arcan}</span>
          </div>
          <h1 className="card__title text-h1">{card?.name}</h1>
          <div className="card__tags">
            {card?.keywords.split(", ").map((name, index) => (
              <div key={index} className="card__tags-tag">
                <CardTag name={name} />
              </div>
            ))}
          </div>
          <div className="card__descriptions" dangerouslySetInnerHTML={{ __html: card?.description ?? "" }} />

          <button className="spread__btn">
            <span>Read more</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardView;
