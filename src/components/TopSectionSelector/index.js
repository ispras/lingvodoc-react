import React from 'react';
import './styles.scss';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgOrganization from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';

class TopSectionSelector extends React.Component {
  constructor(props) {
    super(props);

  }
  render() {
    return (
      <div className="topSectionSelector">
        <label className= 'label'>Tree</label>
        <Link to='/treeRoute'><img className= "img-tree img" src={imgTree}  ></img></Link>
        <label className= 'label'>Tools</label>
        <Link to='/toolsRoute'><img className= "img-tools img" src={imgTools} /></Link>
        <label className= 'label'>Dashboard</label>
        <Link to='/dashboardRoute'><img className= "img-dashboard img" src={imgDashboard} /></Link>
        <label className= 'label'>Organization</label>
        <Link to='/organizationRoute'><img className= "img-organization img" src={imgOrganization} /></Link>
        <label className= 'label'>Support</label>
        <Link to='/supportRoute'><img className= "img-support img" src={imgSupport} /></Link>
      </div>
    );
  }
}


export default TopSectionSelector;