import React from 'react';
import './styles.scss';
import imageDictionares from '../../images/bookshelves.svg';
import imageCorpora from '../../images/file_bundle.svg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';
import Footer from 'components/Footer';

function treeRoute() {
  return (
  <div className="lingvodoc-page">
    <div className="background-cards lingvodoc-page__content">
      <div className="treeRoute">
        <h2 className="tree-header">{getTranslation('Languages databases')}</h2>
        
        <div className="cards-list">
          <Link className="card-item" to="/dashboard/dictionaries_all">
            <label className="card-item__label">{getTranslation('Dictionaries')}</label>
            <img className="card-item__img" src={imageDictionares} />
          </Link>
          <Link className="card-item" to="/corpora_all">
            <label className="card-item__label">{getTranslation('Language corpora')}</label>
            <img className="card-item__img card-item__img_corpora" src={imageCorpora} />
          </Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
}

export default treeRoute;
