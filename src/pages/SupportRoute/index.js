import React from 'react';

import './styles.scss';
import image from '../../images/support.jpg';
import { Link } from 'react-router-dom';

class SupportRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='supportRoute'>
          <div className='background-img'></div>
          <p>Support</p>
          <div className="img-block">
            <p>Help</p>
            <a href='https://github.com/ispras/lingvodoc-react/wiki'> <img className='img ' src={image} /></a>
          </div>
       


        </div>
      </div>

    );
  }
}

export default SupportRoute;