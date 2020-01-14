import React from 'react';

import './styles.scss';
import image from '../../images/support.jpg';
import gql from 'graphql-tag';






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
            <a  href='https://github.com/ispras/lingvodoc-react/wiki' target="_blank"> <img className='img ' src={image} /></a>
          </div>
        </div>
      </div>

    );
  }
}

export default SupportRoute;