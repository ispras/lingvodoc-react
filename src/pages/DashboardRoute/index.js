import React from 'react';
import './styles.scss';
import image from '../../images/dashboard.png';
import imageDictionaries from '../../images/dictionaries.jpg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function dashboardRoute() {
  return (
    <div>
      <div className="dashboardRoute">
        <div className="background-img" />
        <p>{getTranslation('Dashboard')}</p>
        <div className="img-block">
          <p> {getTranslation('Dictionaries')}</p>
          <Link to="/dashboard/dictionaries"> <img className="img " src={imageDictionaries} /></Link>
        </div>
        <div className="img-block">
          <p>{getTranslation('Create dictionary')}</p>
          <Link to="/dashboard/create_dictionary"> <img className="img " src={image} /></Link>
        </div>
        <div className="img-block">
          <p>{getTranslation('Create corpus')}</p>
          <Link to="/dashboard/create_corpus"><img className="img " src={image} /></Link>
        </div>
        <div className="img-block">
          <p>{getTranslation('Import Dialeqt dictionary')}</p>
          <Link to="/import_dialeqt"> <img className="img " src={image} /></Link>
        </div>
        <div className="img-block">
          <p>{getTranslation('Import Starling dictionaries')}</p>
          <Link to="/import"><img className="img " src={image} /></Link>
        </div>
        <div className="img-block">
          <p>{getTranslation('Corpora')}</p>
          <Link to="/dashboard/corpora"><img className="img " src={image} /></Link>
        </div>
      </div>
    </div>

  );
}


export default dashboardRoute;
