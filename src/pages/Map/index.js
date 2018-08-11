import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { isEqual, isEmpty } from 'lodash';
import styled from 'styled-components';
import BlobsModal from 'components/Search/blobsModal';
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
    dictionaries(published: true) {
      id
      parent_id
      translation
      additional_metadata {
        blobs
        location
      }
    }
    blobs: user_blobs(data_type: "pdf", is_global: true) {
      id
      data_type
      content
    }
    is_authenticated
  }
`;

const icon = className =>
  L.divIcon({
    className: `map-marker ${className} a-class`,
    iconSize: [28, 28],
    html: '<i class="fa fa-fw fa-2x fa-question"></i>',
  });

const iconWithoutDictionaries = icon('marker-color-gray');
const iconWithDictionaries = icon('marker-color-red');

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.markers = [];
  }

  componentDidMount() {
    this.leaflet = L.map(this.map, { preferCanvas: true }).setView([61.32, 60.82], 4);
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
          ? blobs
            .filter(b => !!b)
            .map(blobId => allBlobs.find(b => isEqual(blobId, b.id)))
            .filter(b => !!b)
          : [];
        return L.marker([lat, lng], { icon: isEmpty(dictionaryBlobs) ? iconWithoutDictionaries : iconWithDictionaries })
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
  actions: PropTypes.shape({
    openBlobsModal: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(
  connect(state => state.blobs, dispatch => ({ actions: bindActionCreators({ openBlobsModal }, dispatch) })),
  graphql(dictionaryMapQuery)
)(Map);
