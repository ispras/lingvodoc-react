import React from 'react';
import './styles.scss';
import image from '../../images/maps.png';
import imageSearch from '../../images/search.jpg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';
class ToolsRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='toolsRoute'>
          <div className='background-img'></div>
          <p>{getTranslation('Tools')}</p>
          <div className="img-block">
            <p>{getTranslation('Maps')}</p>
            <Link to='/map'> <img className='img ' src={image} /></Link>
          </div>
          <div className="img-block">
            <p>{getTranslation('Search')}</p>
            <Link to='/map_search'><img className='img ' src={imageSearch} /></Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ToolsRoute;