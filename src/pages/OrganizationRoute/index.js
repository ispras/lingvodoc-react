import React from 'react';
import './styles.scss';
import Info from '../Info';
import { Link } from 'react-router-dom';

class OrganizationRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='organizationRoute'>
          <div className="column-icon">

            <div className="block">
              <p>Гранты и организации</p>
              <Link to='/grants' className='background-img'>  <div ></div></Link>
            </div >
          <div className="block" >
            <p>Проекты вне гранта</p>
            <Link to='/no_grants' className='background-img'> <div ></div> </Link>
          </div>
          </div>
        </div>

        <Info />
      </div>


    );
  }
}

export default OrganizationRoute;

