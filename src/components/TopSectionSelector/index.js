import React from 'react';
import './styles.scss';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgOrganization from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import { Link, withRouter } from 'react-router-dom';
import TreeRoute from 'pages/TreeRoute';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';


class TopSectionSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state={show:false,showTab:''}
        this.clickTab=this.clickTab.bind(this);
      }
      clickTab (props){
        console.log(this.state.show)
        if (this.state.show == false){
              this.setState({show:true,showTab:true}) 
              console.log(props)
        }else{
            this.setState({show:false,showTab:false}) 
        }
     
      }
    render() {
      return (
      <div className="topSectionSelector"> 
      <button>
        <Link to="/TreeRoute">click</Link>
        </button>
      <label className={this.state.show ? "hidden-label" : ""}>Tree</label>
      <img className={this.state.show ? "hidden" : "img-tree img"} src={imgTree} onClick={this.clickTab} name="tree" ></img>
      <label className={this.state.showTab ? "nonTab":''}>Tools</label>
      <img className={this.state.showTab ? "nonTab":"img-tools img" } src={imgTools} onClick={this.clickTab}/>
      <label className={this.state.showTab ? "nonTab":''}>Dashboard</label>
      <img className={this.state.showTab ? "nonTab":"img-dashboard img"} src={imgDashboard} onClick={this.clickTab}/>
      <label className={this.state.showTab ? "nonTab":''}>Organization</label>
      <img className={this.state.showTab ? "nonTab":"img-organization img"} src={imgOrganization} onClick={this.clickTab}/>
      <label className={this.state.showTab ? "nonTab":''}>Support</label>
      <img className={this.state.showTab ? "nonTab":"img-support img"} src={imgSupport} onClick={this.clickTab}/>
      </div>
     );
    }
  }


export default compose(TopSectionSelector);