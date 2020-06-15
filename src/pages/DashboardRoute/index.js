import React from 'react';
import './styles.scss';
import image from '../../images/dashboard.png';
import imageDictionaries from '../../images/dictionaries.jpg';
import { Link } from 'react-router-dom';
import { getTranslation } from 'api/i18n';

class DashboardRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="dashboardRoute">
          <div className="background-img" />
          <p>{getTranslation('Dashboard')}</p>
          <div className="img-block">
            <p> {getTranslation('Dictionaries')}</p>
            <Link to="/dashboard/dictionaries">
              <img className="img" src={imageDictionaries} alt="Dictionaries" />
            </Link>
          </div>
          <div className="img-block">
            <p>{getTranslation('Create dictionary')}</p>
            <Link to="/dashboard/create_dictionary">
              <img className="img" src={image} alt="Create dictionary" />
            </Link>
          </div>
          <div className="img-block">
            <p>{getTranslation('Create corpus')}</p>
            <Link to="/dashboard/create_corpus">
              <img className="img" src={image} alt="Create corpus" />
            </Link>
          </div>
          <div className="img-block">
            <p>{getTranslation('Import dialeqt')}</p>
            <Link to="/import_dialeqt">
              <img className="img" src={image} alt="Import dialeqt" />
            </Link>
          </div>
          <div className="img-block">
            <p>{getTranslation('Import')}</p>
            <Link to="/import">
              <img className="img" src={image} alt="Import" />
            </Link>
          </div>
          <div className="img-block">
            <p>{getTranslation('Corpora')}</p>
            <Link to="/dashboard/corpora">
              <img className="img " src={image} alt="Corpora" />
            </Link>
          </div>
        </div>
      </div>

    );
  }
}

export default DashboardRoute;
