import React from 'react';
import './styles.scss';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgOrganization from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { getTranslation } from 'api/i18n';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import News from '../../components/NewsWidget'

const IsAuthenticated = gql`
  query isAuthenticated {
    is_authenticated
  }
`;

const TopSectionSelector = (props) => {
  const { data: { loading, error, is_authenticated: isAuthenticated } } = props;
  console.log(isAuthenticated, 'isAuthenticated')
  return (
    <div className="top-section-selector">
      <div className="top-section-selector_icon">
        <div className="icon">
          <label className='label'>{getTranslation("Languages databases")}</label>
          <Link to='/LanguagesDatabasesRoute'>
            <img className="img-tree img" src={imgTree}></img>
          </Link>
        </div>
        <div className="icon">
          <label className='label'>{getTranslation('Tools')}</label>
          <Link to='/toolsRoute'>
            <img className="img-tools img" src={imgTools} />
          </Link>
        </div>
        <div className="icon">
          {isAuthenticated ? <label className='label'>{getTranslation('Dashboard')}</label> : null}
          {isAuthenticated ? <Link to='/dashboardRoute'>
            <img className="img-dashboard img" src={imgDashboard} />
          </Link> : null}
        </div>
        <div className="icon">
          <label className='label'>{getTranslation('Organization')}</label>
          <Link to='/organizationRoute'>
            <img className="img-organization img" src={imgOrganization} />
          </Link>
        </div>
        <div className="icon">
          <label className='label'>{getTranslation('Support')}</label>
          <Link to='/supportRoute'>
            <img className="img-support img" src={imgSupport} />
          </Link>
        </div>
      </div>
      <News />
    </div>




  );

}

export default compose(
  graphql(IsAuthenticated)(TopSectionSelector))