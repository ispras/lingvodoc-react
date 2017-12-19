import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'pages/Home';
import ProxyHome from 'pages/Home/proxy';
import Info from 'pages/Info';
import Search from 'pages/Search';
import DictImport from 'pages/DictImport';
import Perspective from 'pages/Perspective';
import Languages from 'pages/Languages';
import Files from 'pages/Files';
import NotFound from 'pages/NotFound';
import { DictionaryDashboard, CorpusDashboard } from 'pages/Dashboard';

import config from 'config';

const homeComponent = config.proxy ? ProxyHome : Home;

const Routes = () =>
  <Switch>
    <Route exact path={config.homePath} component={homeComponent} />
    <Route path="/info" component={Info} />
    <Route path="/languages" component={Languages} />
    <Route path="/dashboard/dictionaries" component={DictionaryDashboard} />
    <Route path="/dashboard/corpora" component={CorpusDashboard} />
    <Route path="/map_search" component={Search} />
    <Route path="/import" component={DictImport} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/files" component={Files} />
    <Route component={NotFound} />
  </Switch>;

export default Routes;
