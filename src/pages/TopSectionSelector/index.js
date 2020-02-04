import React from 'react';
import './styles.scss';
import imgTree from '../../images/tree.jpg';
import imgTools from '../../images/tools.jpg';
import imgDashboard from '../../images/dashboard.png';
import imgOrganization from '../../images/organization.jpg';
import imgSupport from '../../images/support.jpg';
import { Link, withRouter } from 'react-router-dom';
import { Dropdown, Menu, Button } from 'semantic-ui-react';
import { graphql, Query } from 'react-apollo';
import { getTranslation } from 'api/i18n';
import gql from 'graphql-tag';
import { compose, branch, renderNothing } from 'recompose';



/* const TestFun = () =>(
  <Query query={
    gql`
query isAuthenticatedProxy {
  is_authenticated
}`
  }>
{
  ({loading,error,data})=>{
    for (let key in argument[0][key])
    console.log(key, argument[0][key]);
    console.log(data,'data')
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;


      return(
        <ul> <li key={id}>{id}</li>
      <li key={is_authenticated}>{is_authenticated}</li></ul>
     
      )
  }
}


  </Query>
) */

/* const Test2 = (props) =>{
  const {data:{ loading, error, is_authenticated: isAuthenticated } } = props;
  if (loading || error || !isAuthenticated) {
    console.log(isAuthenticated,'isAuthenticated')
    return null;
  }
  console.log(isAuthenticated,'isAuthenticated3')
  return(
    
    <div> 
      egerg
       </div>
  
  );
}  */
const DashboardWithData = gql`
  query isAuthenticated {
    is_authenticated
  }
`;


/* class TopSectionSelector extends React.Component {
  constructor(props) {
    super(props);
    
    const {data:{ loading, error, is_authenticated: isAuthenticated } } = props;
    console.log(props,'props')
  
  }
  
  render() {
   
    return (
   
      <div className="topSectionSelector">
          
        <label className='label'>{getTranslation("Tree")}</label>
        <Link to='/treeRoute'><img className="img-tree img" src={imgTree}></img></Link>
        <label className='label'>{getTranslation('Tools')}</label>
        <Link to='/toolsRoute'><img className="img-tools img" src={imgTools} /></Link>
        <label className='label'>{getTranslation('Dashboard')}</label>
        <Link to='/dashboardRoute'><img className="img-dashboard img" src={imgDashboard} /></Link>
        <label className='label'>{getTranslation('Organization')}</label>
        <Link to='/organizationRoute'><img className="img-organization img" src={imgOrganization} /></Link>
        <label className='label'>{getTranslation('Support')}</label>
        <Link to='/supportRoute'><img className="img-support img" src={imgSupport} /></Link>
      </div>



    );
  }
}
 */
const TopSectionSelector = (props) => {

  const { data: { loading, error, is_authenticated: isAuthenticated } } = props;
  console.log(props, 'props');
  console.log(isAuthenticated, 'isAuthenticated3')

  return (

    <div className="topSectionSelector">

      <label className='label'>{getTranslation("Tree")}</label>
      <Link to='/treeRoute'><img className="img-tree img" src={imgTree}></img></Link>
      <label className='label'>{getTranslation('Tools')}</label>
      <Link to='/toolsRoute'><img className="img-tools img" src={imgTools} /></Link>
      {isAuthenticated ? <label className='label'>{getTranslation('Dashboard')}</label> : null}
      {isAuthenticated ?  <Link to='/dashboardRoute'><img className="img-dashboard img" src={imgDashboard} /></Link>: null}
      <label className='label'>{getTranslation('Organization')}</label>
      <Link to='/organizationRoute'><img className="img-organization img" src={imgOrganization} /></Link>
      <label className='label'>{getTranslation('Support')}</label>
      <Link to='/supportRoute'><img className="img-support img" src={imgSupport} /></Link>
    </div>



  );

}

export default compose(
  graphql(DashboardWithData)(TopSectionSelector))