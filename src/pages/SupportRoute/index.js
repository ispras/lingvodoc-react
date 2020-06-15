import React from 'react';
import './styles.scss';
import image from '../../images/support.jpg';
import { getTranslation } from 'api/i18n';

class SupportRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="supportRoute">
          <div className="background-img" />
          <p>{getTranslation('Support')}</p>
          <div className="img-block">
            <p>{getTranslation('Help')}</p>
            <a href="https://github.com/ispras/lingvodoc-react/wiki" target="_blank" rel="noopener noreferrer">
              <img className="img " src={image} alt="Support" />
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default SupportRoute;
