import React from 'react';
import './styles.scss';
import imageDictionaries from '../../images/dictionaries.png';
import imageLanguage from '../../images/languages.png';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';


function treeRoute() {
  return (
    <div>
      <div className="treeRoute">
        <div className="background-img" />
        <label className="languages_databases">{getTranslation('Languages databases')}</label>
        <div className="img-block">
          <Link to="/dashboard/dictionaries_all"> <img className="img " src={imageDictionaries} /></Link>
          <p> {getTranslation('Dictionaries')}</p>
        </div>
        <div className="img-block">
          <Link to="/corpora_all"><img className="img " src={imageLanguage} /></Link>
          <p>{getTranslation('Language corpora')}</p>
        </div>
      </div>

    </div>

  );
}


export default treeRoute;
