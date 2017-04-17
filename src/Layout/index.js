import 'semantic-ui-css/semantic.css';
import 'styles/main.scss';

import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { Sidebar } from 'semantic-ui-react';

import Home from 'pages/Home';
import Info from 'pages/Info';
import Perspective from 'pages/Perspective';
import NotFound from 'pages/NotFound';

import NavBar from './NavBar';
import TasksSidebar from './TasksSidebar';
import Snackbar from './Snackbar';

const Content = styled.div`
  padding: 5em 20px;
  height: 100vh !important;
  overflowY: auto !important;
`;

const Routes = () =>
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/info" component={Info} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route component={NotFound} />
  </Switch>;

const Layout = () =>
  <div>
    <NavBar />
    <Snackbar />
    <Sidebar.Pushable as="div">
      <Sidebar.Pusher as={Content}>
        <Routes />
      </Sidebar.Pusher>
      <TasksSidebar />
    </Sidebar.Pushable>
  </div>;

export default Layout;
