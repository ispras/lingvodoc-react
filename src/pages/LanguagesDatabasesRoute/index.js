import React from 'react';
import './styles.scss';
import imageCard from '../../images/cat.svg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function treeRoute() {
  return (
    <div>
      <div className="treeRoute">
        <h2 className="tree-header">{getTranslation('Languages databases')}</h2>
        
        <div class="cards-list">
          <Link className="card" to="/dashboard/dictionaries_all">
            <label className="card__label">{getTranslation('Dictionaries')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
          <Link className="card" to="/corpora_all">
            <label className="card__label">{getTranslation('Language corpora')}</label>
            <img className="card__img" src={imageCard} />
          </Link>
        </div>
      </div>

    </div>
  );
}

export default treeRoute;
