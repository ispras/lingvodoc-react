import React from "react";
import { Link } from "react-router-dom";
import { getTranslation } from "api/i18n";

import Footer from "components/Footer";

import imageHelp from "../../images/active_support.svg";
import imageTelegram from "../../images/ideas.svg";
import imageVersion from "../../images/version_control.svg";

import "./styles.scss";

const supportRoute = props => {
  return (
    <div className="lingvodoc-page">
      <div className="background-cards lingvodoc-page__content">
        <div className="supportRoute">
          <h2 className="support-header">{getTranslation("Support")}</h2>

          <div className="cards-list">
            <a className="card-item" href="https://github.com/ispras/lingvodoc-react/wiki" target="_blank" rel="noreferrer">
              <label className="card-item__label">{getTranslation("Help")}</label>
              <img className="card-item__img card-item__img_help" src={imageHelp} />
            </a>
            {/*
            <Link className="card-item" to="/desktop">
              <label className="card-item__label">{getTranslation('Desktop')}</label>
              <img className="card-item__img" src={imageCard} />
            </Link>
          */}
            <a className="card-item" href="https://t.me/lingvodoc_support" target="_blank" rel="noreferrer">
              <label className="card-item__label card__label_telegram">{getTranslation("Support@Telegram")}</label>
              <img className="card-item__img card-item__img_telegram" src={imageTelegram} />
            </a>
            <Link className="card-item" to="/version_route">
              <label className="card-item__label">{getTranslation("Version")}</label>
              <img className="card-item__img" src={imageVersion} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default supportRoute;
