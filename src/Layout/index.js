import React from "react";
import { connect } from "react-redux";
import { Sidebar } from "semantic-ui-react";
import PropTypes from "prop-types";
import styled from "styled-components";

import BanModal from "components/BanModal";
import CognateAnalysisModal from "components/CognateAnalysisModal";
import ConfirmModal from "components/ConfirmModal";
import ConvertEafModal from "components/ConvertEafModal";
import CreateFieldModal from "components/CreateFieldModal";
import CreateOrganizationModal from "components/CreateOrganizationModal";
import CreatePerspectiveModal from "components/CreatePerspectiveModal";
import DictionaryOrganizationsModal from "components/DictionaryOrganizationsModal";
import DictionaryProperties from "components/DictionaryPropertiesModal";
import MarkupModal from "components/MarkupModal";
import Modals from "components/Modals";
import PerspectiveProperties from "components/PerspectivePropertiesModal";
import PhonemicAnalysisModal from "components/PhonemicAnalysisModal";
import PhonologyModal from "components/PhonologyModal";
import PlayerModal from "components/PlayerModal";
import RolesModal from "components/RolesModal";
import SaveDictionary from "components/SaveDictionaryModal";
import StatisticsModal from "components/StatisticsModal";
import smoothScroll from "utils/smoothscroll";

import NavBar from "./NavBar";
import Routes from "./Routes";
import Snackbar from "./Snackbar";
import TasksSidebar from "./TasksSidebar";
import TranslationContext from "./TranslationContext";

import "semantic-ui-css/semantic.min.css";
import "styles/main.scss";

const Content = styled.div`
  padding: 0;
  margin-top: 60px;
  height: calc(100vh - 60px) !important;
  overflow-y: auto !important;
`;

class Layout extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { translationGetter } = this.props;

    const scrollContainer = document.querySelector(".pusher");
    smoothScroll(0, 0, null, scrollContainer);

    return (
      <TranslationContext.Provider value={translationGetter}>
        <div>
          <NavBar />
          <Snackbar />
          {
            <Sidebar.Pushable as="div">
              <TasksSidebar />
              <Sidebar.Pusher as={Content}>
                <Routes />
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          }
          <Modals />
          <PlayerModal />
          <MarkupModal />
          <DictionaryProperties />
          <SaveDictionary />
          <PerspectiveProperties />
          <PhonemicAnalysisModal />
          <CognateAnalysisModal />
          <PhonologyModal />
          <ConvertEafModal />
          <StatisticsModal />
          <BanModal />
          <CreateFieldModal />
          <RolesModal />
          <CreateOrganizationModal />
          <DictionaryOrganizationsModal />
          <CreatePerspectiveModal />
          <ConfirmModal />
        </div>
      </TranslationContext.Provider>
    );
  }
}
Layout.propTypes = {
  translationGetter: PropTypes.func.isRequired
};

export default connect(({ locale: { translationGetter } }) => ({ translationGetter }))(Layout);
