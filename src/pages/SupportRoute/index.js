import React from 'react';
import './styles.scss';
import image from '../../images/support.jpg';

import { getTranslation } from 'api/i18n';

function supportRoute() {
  return (
    <div>
      <div className='supportRoute'>
        <div className='background-img'></div>
        <p>{getTranslation('Support')}</p>
        <div className="img-block">
          <p>{getTranslation('Help')}</p>
          <a href='https://github.com/ispras/lingvodoc-react/wiki' target="_blank"> <img className='img ' src={image} /></a>
        </div>
      </div>
    </div>
  );
}

export default supportRoute;