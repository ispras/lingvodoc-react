import 'semantic-ui-css/semantic.css';
import 'Styles/main.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import mainSaga from './sagas';

import NavBar from './NavBar';

import Home from 'Pages/Home';
import Info from 'Pages/Info';
import NotFound from 'Pages/NotFound';

const Content = styled.div`
  padding: 0 20px;
  padding-top: 5em;
  min-height: 100vh;
`;

const Routes = () =>
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/info" component={Info} />
    <Route component={NotFound} />
  </Switch>;

class Layout extends React.Component {
  static contextTypes = {
    runSaga: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.context.runSaga(mainSaga);
  }

  render() {
    return (
      <div>
        <NavBar />
        <Content>
          <Routes />
        </Content>
      </div>
    );
  }
}

export default Layout;
