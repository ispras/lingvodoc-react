import React from 'react';
import { Switch, Route } from 'react-router-dom';


import Home from 'pages/Home';
import Info from 'pages/Info';
import Perspective from 'pages/Perspective';
import NotFound from 'pages/NotFound';

const Routes = () =>
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/info" component={Info} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route component={NotFound} />
  </Switch>;

export default Routes;
