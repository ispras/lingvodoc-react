import React from 'react';
import './styles.scss';
import image from '../../images/dashboard.png';
import { Link } from 'react-router-dom';

class DashboardRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='dashboardRoute'>
          <div className='background-img'></div>
          <p>Dashboard</p>
          <div className="img-block">
            <p>Create dictionary</p>
            <Link to='/dashboard/create_dictionary'> <img className='img ' src={image} /></Link>
          </div>
          <div className="img-block">
            <p>Create corpus</p>
            <Link to='/dashboard/create_corpus'><img className='img ' src={image} /></Link>
          </div>
          <div className="img-block">
            <p>Import dialeqt</p>
            <Link to='/import_dialeqt'> <img className='img ' src={image} /></Link>
          </div>
          <div className="img-block">
            <p>Import</p>
            <Link to='/import'><img className='img ' src={image} /></Link>
          </div>

        </div>
      </div>

    );
  }
}

export default DashboardRoute;