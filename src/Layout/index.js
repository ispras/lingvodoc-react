import 'semantic-ui-css/semantic.css';
import 'Styles/main.scss';

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import NavBar from './NavBar';

import Home from 'Pages/Home';
import Info from 'Pages/Info';
import NotFound from 'Pages/NotFound';

const Content = styled.div`
  padding-top: 5em;
`;

const App = () => (
  <div>
    <NavBar />
    <Content>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/info" component={Info} />
        <Route component={NotFound} />
      </Switch>
    </Content>
  </div>
);

export default App;
