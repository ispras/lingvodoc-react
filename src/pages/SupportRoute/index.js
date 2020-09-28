import React from 'react';
import './styles.scss';
import imageQuestion from '../../images/question.png';
import imageComputer from '../../images/computer.png';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function supportRoute() {
  return (
    <div>
      <div className="supportRoute">
        <div className="background-img" />
        <p className="help">{getTranslation('Support')}</p>
        <div className="img-block">
          <a href='https://github.com/ispras/lingvodoc-react/wiki' target="_blank"> <img className='img ' src={imageQuestion} /></a>
          <p>{getTranslation('Help')}</p>
        </div>
        <div className="img-block">
          <Link to="/desktop"><img className="img " src={imageComputer} /></Link>
          <p> {getTranslation('Desktop')}</p>
        </div>
      </div>
    </div>
  );
}

export default supportRoute;
