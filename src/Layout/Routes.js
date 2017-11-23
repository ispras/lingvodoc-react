import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'pages/Home';
import Info from 'pages/Info';
import Search from 'pages/Search';
import DictImport from 'pages/DictImport';
import Perspective from 'pages/Perspective';
import NotFound from 'pages/NotFound';

const Routes = () =>
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/info" component={Info} />
    <Route path="/map_search" component={Search} />
    <Route path="/import" component={DictImport} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route component={NotFound} />
  </Switch>;

export default Routes;
