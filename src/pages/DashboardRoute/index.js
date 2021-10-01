import React from 'react';
import './styles.scss';

import imageCard from '../../images/cat.svg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function dashboardRoute() {
  return (
  <div class="lingvodoc-page">
    <div className="background-cards lingvodoc-page__content">
      <div className="dashboardRoute">
        <h2 className="dashboard-header">{getTranslation('Dashboard')}</h2>
        
        <div class="cards-list">
          <Link className="card-item" to="/dashboard/dictionaries">
            <label className="card-item__label">{getTranslation('Dictionaries')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
          <Link className="card-item" to="/dashboard/create_dictionary">
            <label className="card-item__label">{getTranslation('Create dictionary')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
          <Link className="card-item" to="/dashboard/create_corpus">
            <label className="card-item__label">{getTranslation('Create corpus')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
          <Link className="card-item" to="/dashboard/corpora">
            <label className="card-item__label">{getTranslation('Corpora')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
          <Link className="card-item" to="/import_dialeqt">
            <label className="card-item__label">{getTranslation('Import Dialeqt dictionary')}</label>
            <img className="card-item__img" src={imageCard} />
          </Link>
          <Link className="card-item" to="/import">
            <label className="card-item__label">{getTranslation('Import Starling dictionaries')}</label>
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

export default dashboardRoute;
