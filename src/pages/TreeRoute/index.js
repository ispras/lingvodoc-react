import React from 'react';
import './styles.scss';
import image from '../../images/bilingual.jpg';
import imageDictionaries from '../../images/dictionaries.jpg';
import imageLanguage from '../../images/languages.png';
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
            <Link to='/dashboard/dictionaries'> <img className='img ' src={imageDictionaries} /></Link>
          </div>
          <div className="img-block">
            <p>Language corpora</p>
            <Link to='/dashboard/corpora'><img className='img ' src={imageLanguage} /></Link>
          </div>
          <div className="img-block">
            <p>Bilingual corpora</p>
            <Link to='/dashboard/bilingual'> <img className='img ' src={image} /></Link>
          </div>
        </div>
      </div>

    );
  }
}

export default TreeRoute;