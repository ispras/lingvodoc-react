import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'pages/Home';
import Info from 'pages/Info';
import Search from 'pages/Search';
import DictImport from 'pages/DictImport';
import Perspective from 'pages/Perspective';
import Languages from 'pages/Languages';
import Files from 'pages/Files';
import Map from 'pages/Map';
import Desktop from 'pages/Desktop';
import NotFound from 'pages/NotFound';
import { DictionaryDashboard, CorpusDashboard } from 'pages/Dashboard';

import config from 'config';

const Routes = () =>
  <Switch>
    <Route exact path={config.homePath} component={Home} />
    <Route path="/info" component={Info} />
    <Route path="/desktop" component={Desktop} />
    <Route path="/languages" component={Languages} />
    <Route path="/dashboard/dictionaries" component={DictionaryDashboard} />
    <Route path="/dashboard/corpora" component={CorpusDashboard} />
    <Route path="/map" component={Map} /> 
    <Route path="/map_search" component={Search} />
    <Route path="/import" component={DictImport} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/#/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/files" component={Files} />
    <Route component={NotFound} />
  </Switch>;

export default Routes;
