import 'semantic-ui-css/semantic.css';
import 'styles/main.scss';

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Sidebar } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import Modals from 'components/Modals';
import PlayerModal from 'components/PlayerModal';
import MarkupModal from 'components/MarkupModal';
import DictionaryProperties from 'components/DictionaryPropertiesModal';
import SaveDictionary from 'components/SaveDictionaryModal';
import PerspectiveProperties from 'components/PerspectivePropertiesModal';
import PhonemicAnalysisModal from 'components/PhonemicAnalysisModal';
import CognateAnalysisModal from 'components/CognateAnalysisModal';
import PhonologyModal from 'components/PhonologyModal';
import ConverEafModal from 'components/ConverEafModal';
import StatisticsModal from 'components/StatisticsModal';
import BanModal from 'components/BanModal';
import CreateFieldModal from 'components/CreateFieldModal';
import RolesModal from 'components/RolesModal';
import CreateOrganizationModal from 'components/CreateOrganizationModal';
import DictionaryOrganizationsModal from 'components/DictionaryOrganizationsModal';
import CreatePerspectiveModal from 'components/CreatePerspectiveModal';

import NavBar from './NavBar';
import TasksSidebar from './TasksSidebar';
import Snackbar from './Snackbar';
import Routes from './Routes';

const Content = styled.div`
  padding: 5em 20px;
  height: 100vh !important;
  overflow-y: auto !important;
`;

class Layout extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { selected, loading } = this.props;

    return (
      <div key={`${selected.id}${loading}`}>
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
        <ConverEafModal />
        <StatisticsModal />
        <BanModal />
        <CreateFieldModal />
        <RolesModal />
        <CreateOrganizationModal />
        <DictionaryOrganizationsModal />
        <CreatePerspectiveModal />
      </div>
    );
  }
}
Layout.propTypes = {
  selected: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};
/*
 * Without withRouter() using connect() breaks routing, see
 * https://reacttraining.com/react-router/core/guides/redux-integration, "Blocked Updates".
 */
export default withRouter(connect(state => state.locale)(Layout));
