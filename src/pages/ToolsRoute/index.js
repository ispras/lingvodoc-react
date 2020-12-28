import React from 'react';
import './styles.scss';
import image from '../../images/maps.png';
import imageSearch from '../../images/search.png';
import imageBox from '../../images/box.png';
import imageHeatmap from '../../images/heatmap.png';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

function toolsRoute(props) {
  return (
    <div>
      <div className="toolsRoute">
        <div className="background-img" />
        <p className="tools">{getTranslation('Tools')}</p>
        <div className="img-block">
          <Link to="/map"> <img className="img " src={image} /></Link>
          <p>{getTranslation('Maps')}</p>
        </div>
        <div className="img-block">
          <Link to="/map_search"><img className="img " src={imageSearch} /></Link>
          <p>{getTranslation('Search')}</p>
        </div>
        <div className="img-block">
          <a target="_blank" href="https://github.com/ispras/lingvodoc-react/wiki/%D0%A5%D1%80%D0%B0%D0%BD%D0%B8%D0%BB%D0%B8%D1%89%D0%B5-%D0%BA%D0%B0%D1%80%D1%82"><img className="img " src={imageBox} /></a>
          <p>{getTranslation('Storage')}</p>
        </div>
        {props.user && props.user.id == 1 && (
          <div className="img-block">
            <Link to="/distance_map"><img className="img " src={imageHeatmap} /></Link>
            <p>{getTranslation('Distance map')}</p>
          </div>
        )}
        <div className="img-block">
          <Link to="/languages"><img className="img " src={image} /></Link>
          <p>{getTranslation('Languages')}</p>
        </div>
      </div>
    </div>
  );
}

export default connect(state => state.user)(toolsRoute);
