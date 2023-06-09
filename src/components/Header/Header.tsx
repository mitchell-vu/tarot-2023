import * as React from "react";
import { Link } from "react-router-dom";

import LogoSvg from "@/assets/svg/logo.svg";
import "./Header.scss";

interface IHeaderProps {}

export const Header: React.FC<IHeaderProps> = (props) => {
  return (
    <header className="header">
      <div className="header__wrapper">
        <Link to="/">
          <div className="header__logo">
            <img src={LogoSvg} alt="2023 Tarot Logo" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
