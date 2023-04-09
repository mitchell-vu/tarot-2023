import * as React from "react";
import "./CardTag.scss";

const icons = ["book", "brain", "cards", "flower", "heart", "measuring", "mind", "rays", "star"];

const randomIcon = () => {
  const iconsLength = icons.length;
  const randomInt = Math.floor(Math.random() * iconsLength);

  return icons[randomInt];
};

interface ICardTagProps {
  name: string;
  icon?: string;
}

const CardTag: React.FC<ICardTagProps> = ({ name, icon }) => {
  const nameTransformed = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="card-tag">
      <div className="card-tag__icon"></div>
      <span className="card-tag__name">{nameTransformed}</span>
    </div>
  );
};

export default CardTag;
