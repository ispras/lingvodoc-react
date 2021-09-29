import React from 'react';
import './styles.scss';
import imageCard from '../../images/cat.svg';
import { Link } from 'react-router-dom';
import { getTranslation } from 'api/i18n';

const supportRoute = (props) => {

  return (
    <div>
      <div className="supportRoute">
        <h2 class="support-header">{getTranslation('Support')}</h2>

        <div class="cards-list">
          <a className="card" href="https://github.com/ispras/lingvodoc-react/wiki" target="_blank">
            <label className="card__label">{getTranslation('Help')}</label>
            <img className="card__img" src={imageCard} />
          </a>
          {/*
            <Link className="card" to="/desktop">
              <label className="card__label">{getTranslation('Desktop')}</label>
              <img className="card__img" src={imageCard} />
            </Link>
          */}
          <a className="card" href="https://t.me/lingvodoc_support" target="_blank">
            <label className="card__label card__label_telegram">{getTranslation('Support@Telegram')}</label>
            <img className="card__img" src={imageCard} />
          </a>
          <Link className="card" to="/version_route">
            <label className="card__label">{getTranslation('Version')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default (supportRoute);
