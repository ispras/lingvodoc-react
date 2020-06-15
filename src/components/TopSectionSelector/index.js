import React from 'react';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgOrganization from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import { Link } from 'react-router-dom';
import { Label } from 'semantic-ui-react'
import { getTranslation } from 'api/i18n';

class TopSectionSelector extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="topSectionSelector">
        <Label className="Label">{getTranslation('Tree')}</Label>
        <Link to="/treeRoute">
          <img className="img-tree img" src={imgTree} alt="tree" />
        </Link>
        <Label className="Label">{getTranslation('Tools')}</Label>
        <Link to="/toolsRoute">
          <img className="img-tools img" src={imgTools} />
        </Link>
        <Label className="Label">{getTranslation('Dashboard')}</Label>
        <Link to='/dashboardRoute'>
          <img className="img-dashboard img" src={imgDashboard} />
        </Link>
        <Label className="Label">{getTranslation('Organization')}</Label>
        <Link to='/organizationRoute'>
          <img className="img-organization img" src={imgOrganization} />
        </Link>
        <Label className="Label">{getTranslation('Support')}</Label>
        <Link to='/supportRoute'>
          <img className="img-support img" src={imgSupport} />
        </Link>
      </div>
    );
  }
}


export default TopSectionSelector;