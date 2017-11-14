import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'pages/Home';
import Info from 'pages/Info';
import Perspective from 'pages/Perspective';
import Languages from 'pages/Languages';
import NotFound from 'pages/NotFound';
import { DictionaryDashboard, CorpusDashboard } from 'pages/Dashboard';

const Routes = () =>
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/info" component={Info} />
    <Route path="/languages" component={Languages} />
    <Route path="/dashboard/dictionaries" component={DictionaryDashboard} />
    <Route path="/dashboard/corpora" component={CorpusDashboard} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route component={NotFound} />
  </Switch>;

export default Routes;
