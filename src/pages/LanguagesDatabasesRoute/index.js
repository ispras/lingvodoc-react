import React from 'react';
import './styles.scss';
import imageCard from '../../images/cat.svg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function treeRoute() {
  return (
  <div class="lingvodoc-page">
    <div className="background-cards lingvodoc-page__content">
      <div className="treeRoute">
        <h2 className="tree-header">{getTranslation('Languages databases')}</h2>
        
        <div class="cards-list">
          <Link className="card-item" to="/dashboard/dictionaries_all">
            <label className="card-item__label">{getTranslation('Dictionaries')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
          <Link className="card-item" to="/corpora_all">
            <label className="card-item__label">{getTranslation('Language corpora')}</label>
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
}

export default treeRoute;
