import React from 'react';
import './styles.scss';

import imageCard from '../../images/cat.svg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function dashboardRoute() {
  return (
    <div>
      <div className="dashboardRoute">
        <h2 className="dashboard-header">{getTranslation('Dashboard')}</h2>
        
        <div class="cards-list">
          <Link className="card" to="/dashboard/dictionaries">
            <label className="card__label">{getTranslation('Dictionaries')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
          <Link className="card" to="/dashboard/create_dictionary">
            <label className="card__label">{getTranslation('Create dictionary')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
          <Link className="card" to="/dashboard/create_corpus">
            <label className="card__label">{getTranslation('Create corpus')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
          <Link className="card" to="/dashboard/corpora">
            <label className="card__label">{getTranslation('Corpora')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
          <Link className="card" to="/import_dialeqt">
            <label className="card__label">{getTranslation('Import Dialeqt dictionary')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
          <Link className="card" to="/import">
            <label className="card__label">{getTranslation('Import Starling dictionaries')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default dashboardRoute;
