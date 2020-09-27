import React from 'react';
import './styles.scss';
import image from '../../images/maps.png';
import imageSearch from '../../images/search.jpg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function toolsRoute() {
  return (
    <div>
      <div className="toolsRoute">
        <div className="background-img" />
        <p>{getTranslation('Tools')}</p>
        <div className="img-block">
          <p>{getTranslation('Maps')}</p>
          <Link to="/map"> <img className="img " src={image} /></Link>
        </div>
        <div className="img-block">
          <p>{getTranslation('Search')}</p>
          <Link to="/map_search"><img className="img " src={imageSearch} /></Link>
        </div>
        <div className="img-block">
          <p>{getTranslation('Storage')}</p>
          <a target="_blank" href="https://github.com/ispras/lingvodoc-react/wiki/%D0%A5%D1%80%D0%B0%D0%BD%D0%B8%D0%BB%D0%B8%D1%89%D0%B5-%D0%BA%D0%B0%D1%80%D1%82"><img className="img " src={image} /></a>
        </div>
        <div className="img-block">
          <p>{getTranslation('Distance map')}</p>
          <Link to="/distance_map"><img className="img " src={image} /></Link>
        </div>
        <div className="img-block">
          <p>{getTranslation('Languages')}</p>
          <Link to="/languages"><img className="img " src={image} /></Link>
        </div>
      </div>
    </div>
  );
}


export default toolsRoute;
