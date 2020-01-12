import React from 'react';
import './styles.scss';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgOrganization from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';


class TopSectionSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false, showTab: '' }
    this.clickTab = this.clickTab.bind(this);
  }
  clickTab(props) {
    if (this.state.show === false) {
      this.setState({ show: true, showTab: true })
      console.log(props)
    } else {
      this.setState({ show: false, showTab: false })
    }

  }
  render() {
    return (
      <div className="topSectionSelector">
        <label className={this.state.showTab ? "nonTab" : ""}>Tree</label>
        <Link to='/treeRoute'><img className={this.state.showTab ? "nonTab" : "img-tree img"} src={imgTree} onClick={this.clickTab} name="tree" ></img></Link>
        <label className={this.state.showTab ? "nonTab" : ''}>Tools</label>
        <Link to='/toolsRoute'><img className={this.state.showTab ? "nonTab" : "img-tools img"} src={imgTools} onClick={this.clickTab} /></Link>
        <label className={this.state.showTab ? "nonTab" : ''}>Dashboard</label>
        <Link to='/dashboardRoute'><img className={this.state.showTab ? "nonTab" : "img-dashboard img"} src={imgDashboard} onClick={this.clickTab} /></Link>
        <label className={this.state.showTab ? "nonTab" : ''}>Organization</label>
        <Link to='/organizationRoute'><img className={this.state.showTab ? "nonTab" : "img-organization img"} src={imgOrganization} onClick={this.clickTab} /></Link>
        <label className={this.state.showTab ? "nonTab" : ''}>Support</label>
        <Link to='/supportRoute'><img className={this.state.showTab ? "nonTab" : "img-support img"} src={imgSupport} onClick={this.clickTab} /></Link>
      </div>
    );
  }
}


export default compose(TopSectionSelector);