import React from "react";
import { Route, Switch } from "react-router-dom";

import config from "config";
import AuthorsRoute from "pages/AuthorsRoute";
import CorporaAll from "pages/CorporaAll";
import { CreateCorpus, CreateDictionary } from "pages/CreateDictionary";
import { CorpusDashboard, DictionaryDashboard } from "pages/Dashboard";
import DashboardRoute from "pages/DashboardRoute";
import Desktop from "pages/Desktop";
import DialeqtImport from "pages/DialeqtImport";
import DictImport from "pages/DictImport";
import DictionariesAll from "pages/DictionariesAll";
import DistanceMap from "pages/DistanceMap";
import MapSelectedLanguages from "pages/DistanceMap/map";
import SelectedLanguages from "pages/DistanceMap/selectorLangGroup";
import Docx2Eaf from "pages/Docx2Eaf";
import EditTranslations from "pages/EditTranslations";
import Files from "pages/Files";
import Grants from "pages/Grants";
import GrantsRoute from "pages/GrantsRoute";
import Info from "pages/Info";
import Languages from "pages/Languages";
import LanguagesDatabasesRoute from "pages/LanguagesDatabasesRoute";
import Map from "pages/Map";
import NotFound from "pages/NotFound";
import Organizations from "pages/Organizations";
import Perspective from "pages/Perspective";
import Requests from "pages/Requests";
import Search from "pages/Search";
import SupportRoute from "pages/SupportRoute";
import ToolsRoute from "pages/ToolsRoute";
import TopSectionSelector from "pages/TopSectionSelector";
import Valency from "pages/Valency";
import VersionRoute from "pages/VersionRoute";
import WithoutGrants from "pages/WithoutGrants";

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
    <Route path="/map_search/:searchId" component={Search} />
    <Route path="/map_search" component={Search} />
    <Route path="/distance_map/selected_languages/map" component={MapSelectedLanguages} />
    <Route path="/distance_map/selected_languages" component={SelectedLanguages} />
    <Route path="/distance_map" component={DistanceMap} />
    <Route path="/import" component={DictImport} />
    <Route path="/import_dialeqt" component={DialeqtImport} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode" component={Perspective} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/#/dictionary/:pcid/:poid/perspective/:cid/:oid" component={Perspective} />
    <Route path="/files" component={Files} />
    <Route path="/edit_translations" component={EditTranslations} />
    <Route path="/organizations" component={Organizations} />
    <Route path="/LanguagesDatabasesRoute" component={LanguagesDatabasesRoute} />
    <Route path="/toolsRoute" component={ToolsRoute} />
    <Route path="/dashboardRoute" component={DashboardRoute} />
    <Route path="/grantsRoute" component={GrantsRoute} />
    <Route path="/supportRoute" component={SupportRoute} />
    <Route path="/without_grants" component={WithoutGrants} />
    <Route path="/corpora_all" component={CorporaAll} />
    <Route path="/authors_route" component={AuthorsRoute} />
    <Route path="/version_route" component={VersionRoute} />
    <Route path="/docx2eaf" component={Docx2Eaf} />
    <Route path="/valency" component={Valency} />
    <Route component={NotFound} />
  </Switch>
);

export default Routes;
