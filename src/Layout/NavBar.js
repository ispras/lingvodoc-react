import React, { PropTypes as T } from 'react';

import AppBar from 'react-toolbox/lib/app_bar';
import { Link } from 'react-router-dom';

// import { Route, Link } from 'react-router-dom';

// const MenuLink = ({ to, exact, children }) => (
//   <Route path={to} exact={exact} >
//     {
//       ({ match }) =>
//         <li className={match ? 'active' : ''}>
//           <Link to={to}>{children}</Link>
//         </li>
//     }
//   </Route>
// );

// MenuLink.propTypes = {
//   to: T.string.isRequired,
//   exact: T.bool.isRequired,
//   children: T.string.isRequired,
// };

// MenuLink.defaultProps = {
//   exact: false,
// };

function NavBar() {
  return (
    <AppBar flat fixed>
      <Link to="/">
        Lingvodoc
      </Link>
      <nav>
        <ul>
          <li><Link to="/maps">Maps</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>
    </AppBar>
  );
}

export default NavBar;
