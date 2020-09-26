import React from 'react';
import './styles.scss';
import imageQuestion from '../../images/question.png';

import { getTranslation } from 'api/i18n';

function supportRoute() {
  return (
    <div>
      <div className='supportRoute'>
        <div className='background-img'></div>
        <p className="help">{getTranslation('Support')}</p>
        <div className="img-block">
     
          <a href='https://github.com/ispras/lingvodoc-react/wiki' target="_blank"> <img className='img ' src={imageQuestion} /></a>
          <p>{getTranslation('Help')}</p>
        </div>
      </div>
    </div>
  );
}

export default supportRoute;