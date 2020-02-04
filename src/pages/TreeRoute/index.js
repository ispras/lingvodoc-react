import React from 'react';
import './styles.scss';
import image from '../../images/bilingual.jpg';
import imageDictionaries from '../../images/dictionaries.jpg';
import imageLanguage from '../../images/languages.png';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';
class TreeRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='treeRoute'>
          <div className='background-img'></div>
          <p>{getTranslation('Tree')}</p>
          <div className="img-block">
            <p> {getTranslation('Dictionaries')}</p>
             <Link to='/dashboard/dictionaries_all'> <img className='img ' src={imageDictionaries} /></Link> 
          </div>
          <div className="img-block">
            <p>{getTranslation('Language corpora')}</p>
            <Link to='/dashboard/corpora'><img className='img ' src={imageLanguage} /></Link>
          </div>
          <div className="img-block">
            <p>{getTranslation('Bilingual corpora')}</p>
            <Link to='/dashboard/bilingual'> <img className='img ' src={image} /></Link>
          </div>
        </div>
     
      </div>

    );
  }
}

export default TreeRoute;