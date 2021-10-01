import React from 'react';
import './styles.scss';
import imageCard from '../../images/cat.svg';
import { Link } from 'react-router-dom';
import { getTranslation } from 'api/i18n';

const supportRoute = (props) => {

  return (
  <div class="lingvodoc-page">
    <div className="background-cards lingvodoc-page__content">
      <div className="supportRoute">
        <h2 class="support-header">{getTranslation('Support')}</h2>

        <div class="cards-list">
          <a className="card-item" href="https://github.com/ispras/lingvodoc-react/wiki" target="_blank">
            <label className="card-item__label">{getTranslation('Help')}</label>
            <img className="card-item__img" src={imageCard} />
          </a>
          {/*
            <Link className="card-item" to="/desktop">
              <label className="card-item__label">{getTranslation('Desktop')}</label>
              <img className="card-item__img" src={imageCard} />
            </Link>
          */}
          <a className="card-item" href="https://t.me/lingvodoc_support" target="_blank">
            <label className="card-item__label card__label_telegram">{getTranslation('Support@Telegram')}</label>
            <img className="card-item__img" src={imageCard} />
          </a>
          <Link className="card-item" to="/version_route">
            <label className="card-item__label">{getTranslation('Version')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
        </div>
      </div>
    </div>
    <div class="lingvodoc-page__footer lingvodoc-footer">
        Copyright © 2012-2021 Institute of Linguistics Russian Academy of Sciences, Ivannikov Institute for System Programming of the Russian Academy of Sciences, Tomsk State University
    </div>
  </div>
  );
};

export default (supportRoute);
