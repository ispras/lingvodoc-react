import React from 'react';
import './styles.scss';

import imageVocabulary from '../../images/vocabulary.png';
import imageSketch from '../../images/sketch.png';
import imageImport from '../../images/import.png';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function dashboardRoute() {
  return (
    <div>
      <div className="dashboardRoute">
        <div className="background-img" />
        <p className="dashboard">{getTranslation('Dashboard')}</p>
        <div className="img-block">
          <Link to="/dashboard/dictionaries"> <img className="img " src={imageVocabulary} /></Link>
          <p> {getTranslation('Dictionaries')}</p>

        </div>
        <div className="img-block">
          <Link to="/dashboard/create_dictionary"> <img className="img " src={imageSketch} /></Link>
          <p>{getTranslation('Create dictionary')}</p>

        </div>
        <div className="img-block">

          <Link to="/dashboard/create_corpus"><img className="img " src={imageSketch} /></Link>
          <p>{getTranslation('Create corpus')}</p>
        </div>
        <div className="img-block">

          <Link to="/dashboard/corpora"><img className="img " src={imageVocabulary} /></Link>
          <p>{getTranslation('Corpora')}</p>
        </div>
        <div className="img-block">

          <Link to="/import_dialeqt"> <img className="img " src={imageImport} /></Link>
          <p>{getTranslation('Import Dialeqt dictionary')}</p>
        </div>
        <div className="img-block">

          <Link to="/import"><img className="img " src={imageImport} /></Link>
          <p>{getTranslation('Import Starling dictionaries')}</p>
        </div>

      </div>
    </div>

  );
}


export default dashboardRoute;
