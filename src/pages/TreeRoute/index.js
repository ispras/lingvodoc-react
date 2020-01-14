import React from 'react';

import './styles.scss';
import image from '../../images/bilingual.jpg';
import { Link } from 'react-router-dom';

class TreeRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='treeRoute'>
          <div className='background-img'></div>
          <p>Tree</p>
          <div className="img-block">
            <p>Dictionaries</p>
            <Link to='/dashboard/dictionaries'> <img className='img ' src={image} /></Link>
          </div>
          <div className="img-block">
            <p>Corpora</p>
            <Link to='/dashboard/corpora'><img className='img ' src={image} /></Link>
          </div>
          <div className="img-block">
            <p>Bilingual</p>
            <Link to='/dashboard/bilingual'> <img className='img ' src={image} /></Link>
          </div>
        </div>
      </div>

    );
  }
}

export default TreeRoute;