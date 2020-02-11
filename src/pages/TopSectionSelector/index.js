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
import News from '../../components/News'

const IsAuthenticated = gql`
  query isAuthenticated {
    is_authenticated
  }
`;

const TopSectionSelector = (props) => {
  const { data: { loading, error, is_authenticated: isAuthenticated } } = props;
  console.log(isAuthenticated, 'isAuthenticated')
  return (
    <div className="topSectionSelector">

      <label className='label'>{getTranslation("Tree")}</label>
      <Link to='/treeRoute'>
        <img className="img-tree img" src={imgTree}></img>
      </Link>
      <label className='label'>{getTranslation('Tools')}</label>
      <Link to='/toolsRoute'>
        <img className="img-tools img" src={imgTools} />
      </Link>
      {isAuthenticated ? <label className='label'>{getTranslation('Dashboard')}</label> : null}
      {isAuthenticated ? <Link to='/dashboardRoute'>
        <img className="img-dashboard img" src={imgDashboard} />
      </Link> : null}
      <label className='label'>{getTranslation('Organization')}</label>
      <Link to='/organizationRoute'>
        <img className="img-organization img" src={imgOrganization} />
      </Link>
      <label className='label'>{getTranslation('Support')}</label>
      <Link to='/supportRoute'>
        <img className="img-support img" src={imgSupport} />
      </Link>
<News/>
     
    </div>



  );

}

export default compose(
  graphql(IsAuthenticated)(TopSectionSelector))