import 'semantic-ui-css/semantic.css';
import 'styles/main.scss';

import React from 'react';
import styled from 'styled-components';
import { Sidebar } from 'semantic-ui-react';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

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

import NavBar from './NavBar';
import TasksSidebar from './TasksSidebar';
import Snackbar from './Snackbar';
import Routes from './Routes';

import { stringsToTranslate, setTranslation } from 'api/i18n';

const getTranslationsQuery = gql`
  query getTranslations($searchstrings: [String]!) {
    advanced_translation_search(searchstrings: $searchstrings) {
      translation
    }
  }
`;

const Content = styled.div`
  padding: 5em 20px;
  height: 100vh !important;
  overflow-y: auto !important;
`;

class Layout extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(props) {
    const { data: { error, loading, advanced_translation_search: translated } } = props;
    if (loading || error) {
      return;
    }
  
    for (let i = 0; i < stringsToTranslate.length; i++) {
      setTranslation(stringsToTranslate[i], translated[i].translation);
    }
  }

  render() {
    if (this.props.data.loading) {
      return null;
    }

    return (
      <div>
        <NavBar />
        <Snackbar />
        <Sidebar.Pushable as="div">
          <TasksSidebar />
          <Sidebar.Pusher as={Content}>
            <Routes />
          </Sidebar.Pusher>
        </Sidebar.Pushable>
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
      </div>
    );
  }

}

export default graphql(
  getTranslationsQuery,
  { options: () => ({ variables: { searchstrings: stringsToTranslate } }) }
)(Layout);
