import React from 'react';

import './styles.scss';
import image from '../../images/maps.png';
import { Link } from 'react-router-dom';

class ToolsRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='toolsRoute'>
          <div className='background-img'></div>
          <p>Tools</p>
          <div className="img-block">
            <p>Maps</p>
            <Link to='/map'> <img className='img ' src={image} /></Link>
          </div>
          <div className="img-block">
            <p>Search</p>
            <Link to='/map_search'><img className='img ' src={image} /></Link>
          </div>
        </div>
      </div>

    );
  }
}

export default ToolsRoute;