import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { gql, graphql } from 'react-apollo';
import Immutable, { fromJS } from 'immutable';
import { Container, Dimmer, Loader, Tab, Button, Divider, Menu, Message } from 'semantic-ui-react';
import { isEqual } from 'lodash';
import styled from 'styled-components';
import Labels from 'components/Search/Labels';
import ResultsMap from 'components/Search/ResultsMap';
import IntersectionControl from 'components/Search/IntersectionControl';
import QueryBuilder from 'components/Search/QueryBuilder';
import LanguageTree from 'components/Search/LanguageTree';
import BlobsModal from 'components/Search/blobsModal';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';
import { compositeIdToString } from 'utils/compositeId';
import L from 'leaflet';
import { openBlobsModal } from 'ducks/blobs';

import 'components/DictionaryPropertiesModal/style.scss';

const Wrapper = styled.div`
  width: 100%;
  height: 90%;
  border: 1px solid grey;
  border-radius: 2px;

  .leaflet {
    width: 100%;
    height: 100%;

    .point {
      display: flex;
      flex-direction: column;
      height: 2em !important;
      width: 2em !important;
      border-radius: 2px;
      border: 1px solid black;

      span {
        flex: 1 1 auto;

        &:not(:last-child) {
          border-bottom: 1px solid black;
        }
      }
    }
  }
`;

const dictionaryMapQuery = gql`
  query DictionaryMap {
    dictionaries(category: 0, published: true) {
      id
      parent_id
      translation
      additional_metadata {
        blobs
        location
      }
    }
    blobs: user_blobs {
      id
      data_type
      content
    }
    is_authenticated
  }
`;

const icon = L.divIcon({
  className: 'map-marker marker-color-gray a-class',
  iconSize: [28, 28],
  html: '<i class="fa fa-fw fa-2x fa-question"></i>',
});

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.markers = [];
  }

  componentDidMount() {
    this.leaflet = L.map(this.map, {}).setView([61.32, 60.82], 4);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.leaflet);
  }

  componentWillReceiveProps(nextProps) {
    const { actions, data: { loading, dictionaries, blobs: allBlobs } } = nextProps;

    if (!loading) {
      this.markers = dictionaries.filter(dictionary => dictionary.additional_metadata.location).map((dictionary) => {
        const { additional_metadata: { location, blobs } } = dictionary;
        const { lat, lng } = location;
        const dictionaryBlobs = blobs
          ? blobs.filter(b => !!b).map(blobId => allBlobs.find(b => isEqual(blobId, b.id)))
          : [];
        return L.marker([lat, lng], { icon })
          .addTo(this.leaflet)
          .on('click', () => actions.openBlobsModal(dictionary, dictionaryBlobs.map(b => b.id)));
      });
    }
  }

  shouldComponentUpdate() {
    return true;
  }

  render() {
    return (
      <Wrapper>
        <div
          ref={(ref) => {
            this.map = ref;
          }}
          className="leaflet"
        />
        <BlobsModal />
      </Wrapper>
    );
  }
}

Map.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
};

export default compose(
  connect(state => state.blobs, dispatch => ({ actions: bindActionCreators({ openBlobsModal }, dispatch) })),
  graphql(dictionaryMapQuery)
)(Map);
