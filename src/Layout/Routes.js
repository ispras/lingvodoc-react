import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'pages/Home';
import Info from 'pages/Info';
import Search from 'pages/Search';
import DialeqtImport from 'pages/DialeqtImport';
import DictImport from 'pages/DictImport';
import Perspective from 'pages/Perspective';
import Languages from 'pages/Languages';
import Files from 'pages/Files';
import Map from 'pages/Map';
import Desktop from 'pages/Desktop';
import NotFound from 'pages/NotFound';
import { DictionaryDashboard, CorpusDashboard } from 'pages/Dashboard';
import { CreateDictionary, CreateCorpus } from 'pages/CreateDictionary';
import Grants from 'pages/Grants';
import Requests from 'pages/Requests';
import EditTranslations from 'pages/EditTranslations';
import Organizations from 'pages/Organizations';
import TreeRoute from 'pages/TreeRoute';

import config from 'config';

const Routes = () => (
  <Switch>
    <Route exact path={config.homePath} component={TreeRoute} />
    <Route path="/info" component={Info} />
    <Route path="/desktop" component={Desktop} />
    <Route path="/languages" component={Languages} />
    <Route path="/dashboard/dictionaries" component={DictionaryDashboard} />
    <Route path="/dashboard/corpora" component={CorpusDashboard} />
    <Route path="/dashboard/create_dictionary" component={CreateDictionary} />
    <Route path="/dashboard/create_corpus" component={CreateCorpus} />
    <Route path="/grants" component={Grants} />
    <Route path="/TreeRoute" component={TreeRoute}/>
    <Route path="/requests" component={Requests} />
    <Route path="/map" component={Map} />
    <Route path="/map_search" component={Search} />
    <Route path="/import" component={DictImport} />
    <Route path="/import_dialeqt" component={DialeqtImport} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/#/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/files" component={Files} />
    <Route path="/edit_translations" component={EditTranslations} />
    <Route path="/organizations" component={Organizations} />
    <Route component={NotFound} />
  </Switch>
);

export default Routes;
