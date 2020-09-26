import React from 'react';
import './styles.scss';
import imageQuestion from '../../images/question.png';
import image from '../../images/support.jpg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function supportRoute() {
  return (
    <div>
      <div className="supportRoute">
        <div className="background-img" />
        <p>{getTranslation('Support')}</p>
        <div className="img-block">
     
          <a href='https://github.com/ispras/lingvodoc-react/wiki' target="_blank"> <img className='img ' src={imageQuestion} /></a>
          <p>{getTranslation('Help')}</p>
          <a href="https://github.com/ispras/lingvodoc-react/wiki" target="_blank"> <img className="img " src={image} /></a>
        </div>
        <div className="img-block">
          <p> {getTranslation('Desktop')}</p>
          <Link to="/desktop"><img className="img " src={image} /></Link>
        </div>
      </div>
    </div>
  );
}

export default supportRoute;
