import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';
import { Placeholder } from 'semantic-ui-react';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgAuthors from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import { Link } from 'react-router-dom';
import { getTranslation } from 'api/i18n';
import { compose } from 'recompose';
import { connect } from 'react-redux';


const topSectionSelector = (props) => {
  const { isAuthenticated } = props;
  return (
    <div className="top-section-selector">
      <div className="top-section-selector_icon">
        <div className="icon">
          <label className="label">{getTranslation('Languages databases')}</label>
          <Link to="/LanguagesDatabasesRoute">
            <img className="img-tree img" src={imgTree} />
          </Link>
        </div>
        <div className="icon">
          <label className="label">{getTranslation('Tools')}</label>
          <Link to="/toolsRoute">
            <img className="img-tools img" src={imgTools} />
          </Link>
        </div>
        {(isAuthenticated === undefined) && (
          <div className="icon">
            <label className="label">{getTranslation('Dashboard')}</label>
            <Placeholder className="img">
              <Placeholder.Image rectangular />
            </Placeholder>
          </div>)}
        {(isAuthenticated) && (
          <div className="icon">
            <label className="label">{getTranslation('Dashboard')}</label>
            <Link to="/dashboardRoute">
              <img className="img-dashboard img" src={imgDashboard} />
            </Link>
          </div>)}
        <div className="icon">
          <label className="label">{getTranslation('Authors')}</label>
          <Link to="/authorsRoute">
            <img className="img-authors img" src={imgAuthors} />
          </Link>
        </div>
        <div className="icon">
          <label className="label">{getTranslation('Support')}</label>
          <Link to="/supportRoute">
            <img className="img-support img" src={imgSupport} />
          </Link>
        </div>
      </div>
    </div>


  );
};

topSectionSelector.propTypes = {
  isAuthenticated: PropTypes.bool
};

topSectionSelector.defaultProps = {
  isAuthenticated: false
};


export default compose(connect(state => state.auth)(topSectionSelector));
