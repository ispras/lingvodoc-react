import React from "react";
import { Route, Routes } from "react-router-dom";

// eslint-disable-next-line import/no-unresolved
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

const AppRoutes = () => (
  <Routes>
    <Route path={config.homePath} element={<TopSectionSelector />} />
    <Route path="/info" element={<Info />} />
    <Route path="/desktop" element={<Desktop />} />
    <Route path="/languages" element={<Languages />} />
    <Route path="/dashboard/dictionaries" element={<DictionaryDashboard />} />
    <Route path="/dashboard/corpora" element={<CorpusDashboard />} />
    <Route path="/dashboard/corpora_all" element={<CorporaAll />} />
    <Route path="/dashboard/create_dictionary" element={<CreateDictionary />} />
    <Route path="/dashboard/create_corpus" element={<CreateCorpus />} />
    <Route path="/dashboard/dictionaries_all" element={<DictionariesAll />} />
    <Route path="/grants" element={<Grants />} />
    <Route path="/requests" element={<Requests />} />
    <Route path="/map" element={<Map />} />
    <Route path="/map_search/:searchId" element={<Search />} />
    <Route path="/map_search" element={<Search />} />
    <Route path="/distance_map/selected_languages/map" element={<MapSelectedLanguages />} />
    <Route path="/distance_map/selected_languages" element={<SelectedLanguages />} />
    <Route path="/distance_map" element={<DistanceMap />} />
    <Route path="/import" element={<DictImport />} />
    <Route path="/import_dialeqt" element={<DialeqtImport />} />
    <Route path="/dictionary/:pcid/:poid/perspective/:cid/:oid/*" element={<Perspective />} />
    <Route path="/files" element={<Files />} />
    <Route path="/edit_translations" element={<EditTranslations />} />
    <Route path="/organizations" element={<Organizations />} />
    <Route path="/LanguagesDatabasesRoute" element={<LanguagesDatabasesRoute />} />
    <Route path="/toolsRoute" element={<ToolsRoute />} />
    <Route path="/dashboardRoute" element={<DashboardRoute />} />
    <Route path="/grantsRoute" element={<GrantsRoute />} />
    <Route path="/supportRoute" element={<SupportRoute />} />
    <Route path="/without_grants" element={<WithoutGrants />} />
    <Route path="/authors_route" element={<AuthorsRoute />} />
    <Route path="/version_route" element={<VersionRoute />} />
    <Route path="/docx2eaf" element={<Docx2Eaf />} />
    <Route path="/valency" element={<Valency />} />
    <Route element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
