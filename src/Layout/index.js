import 'semantic-ui-css/semantic.css';
import 'styles/main.scss';

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import Home from 'pages/Home';
import Info from 'pages/Info';
import NotFound from 'pages/NotFound';

import NavBar from './NavBar';

const Content = styled.div`
  padding: 20px;
  padding-top: 5em;
  min-height: 100vh;
`;

const Routes = () =>
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/info" component={Info} />
    <Route component={NotFound} />
  </Switch>;

const Layout = () =>
  <div>
    <NavBar />
    <Content>
      <Routes />
    </Content>
  </div>;

export default Layout;
