import React from "react";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import gql from "graphql-tag";
import L from "leaflet";
import { isEmpty, isEqual, sortBy } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";
import styled from "styled-components";

import BlobsModal from "components/Search/blobsModal";
import { openBlobsModal } from "ducks/blobs";

import "leaflet.markercluster";

import "components/DictionaryPropertiesModal/style.scss";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const Wrapper = styled.div`
  position: absolute;
  width: 98%;
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
    html: '<i class="fa fa-fw fa-2x fa-question"></i>'
  });

const iconWithoutDictionaries = icon("marker-color-gray");
const iconWithDictionaries = icon("marker-color-red");

function toggleHighlighting(marker) {
  marker._icon.classList.toggle("marker-highlighted");
  setTimeout(() => {
    if (marker._icon) {
      marker._icon.classList.toggle("marker-highlighted");
    }
  }, 3000);
}

class Map extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.leaflet = L.map(this.map, { preferCanvas: true }).setView([61.32, 60.82], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.leaflet);
  }

  componentWillReceiveProps(nextProps) {
    const {
      actions,
      data: { loading, dictionaries, blobs: allBlobs }
    } = nextProps;

    if (!loading) {
      const markersGroup = L.markerClusterGroup({ maxClusterRadius: 70, showCoverageOnHover: false });
      const map = this.leaflet;
      markersGroup.on("clustermouseover", event => {
        map.closePopup();
        const oldContent = document.getElementById("map-popup");
        if (oldContent != null) {
          oldContent.remove();
        }
        let popUpText = '<ul id="map-popup">';
        const markers = [];
        sortBy(event.layer.getAllChildMarkers(), marker => marker.options.title).forEach(marker => {
          popUpText += `<li><u id=${marker._leaflet_id} style="cursor: pointer">${marker.options.title}</u></li>`;
          markers.push(marker);
        });
        popUpText += "</ul>";
        L.popup({ maxHeight: 300 }).setLatLng(event.layer.getLatLng()).setContent(popUpText).openOn(map);
        markers.forEach(marker => {
          document.getElementById(marker._leaflet_id).onclick = function () {
            map.closePopup();
            if (marker._icon) {
              toggleHighlighting(marker);
            } else {
              markersGroup.zoomToShowLayer(marker, () => {
                toggleHighlighting(marker);
              });
            }
          };
        });
      });
      map.addLayer(markersGroup);
      dictionaries
        .filter(dictionary => dictionary.additional_metadata.location)
        .map(dictionary => {
          const {
            additional_metadata: { location, blobs }
          } = dictionary;
          const { lat, lng } = location;
          const dictionaryBlobs = blobs
            ? blobs
                .filter(b => !!b)
                .map(blobId => allBlobs.find(b => isEqual(blobId, b.id)))
                .filter(b => !!b)
            : [];
          return L.marker([lat, lng], {
            title: dictionary.translation,
            icon: isEmpty(dictionaryBlobs) ? iconWithoutDictionaries : iconWithDictionaries
          })
            .addTo(markersGroup)
            .on("click", () =>
              actions.openBlobsModal(
                dictionary,
                dictionaryBlobs.map(b => b.id)
              )
            );
        });
      map.on("zoomend", () => map.closePopup());
    }
  }

  shouldComponentUpdate() {
    return true;
  }

  render() {
    return (
      <div className="page-content page-content_relative">
        <Wrapper>
          <div
            ref={ref => {
              this.map = ref;
            }}
            className="leaflet"
          />
          <BlobsModal />
        </Wrapper>
      </div>
    );
  }
}

Map.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    openBlobsModal: PropTypes.func.isRequired
  }).isRequired
};

export default compose(
  connect(
    state => state.blobs,
    dispatch => ({ actions: bindActionCreators({ openBlobsModal }, dispatch) })
  ),
  graphql(dictionaryMapQuery)
)(Map);
