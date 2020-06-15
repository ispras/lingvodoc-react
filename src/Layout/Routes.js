import React from 'react';
import { Switch, Route } from 'react-router-dom';


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
import TopSectionSelector from 'pages/TopSectionSelector';
import NewsEditor from 'pages/NewsEditor';

import DictionariesAll from 'pages/DictionaryAll';
import TreeRoute from 'pages/TreeRoute';
import ToolsRoute from 'pages/ToolsRoute';
import DashboardRoute from 'pages/DashboardRoute';
import OrganizationRoute from 'pages/OrganizationRoute';
import SupportRoute from 'pages/SupportRoute';
import NoGrants from 'pages/NoGrants';
import CorporaAll from 'pages/CorporaAll';
import config from 'config';

const Routes = () => (
  <Switch>
    <Route exact path={config.homePath} component={TopSectionSelector} />
    <Route path="/info" component={Info} />
    <Route path="/desktop" component={Desktop} />
    <Route path="/languages" component={Languages} />
    <Route path="/dashboard/dictionaries" component={DictionaryDashboard} />
    <Route path="/dashboard/corpora" component={CorpusDashboard} />
    <Route path="/dashboard/create_dictionary" component={CreateDictionary} />
    <Route path="/dashboard/create_corpus" component={CreateCorpus} />
    <Route path="/dashboard/dictionaries_all" component={DictionariesAll} />
    <Route path="/grants" component={Grants} />
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
    <Route path="/treeRoute" component={TreeRoute} />
    <Route path="/toolsRoute" component={ToolsRoute} />
    <Route path="/dashboardRoute" component={DashboardRoute} />
    <Route path="/organizationRoute" component={OrganizationRoute} />
    <Route path="/supportRoute" component={SupportRoute} />
    <Route path="/no_grants" component={NoGrants} />
    <Route path="/corpora_all" component={CorporaAll} />
    <Route path="/news_editor" component={NewsEditor} />
    <Route component={NotFound} />

  </Switch>
);

export default Routes;
