import React from "react";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import PropTypes from "prop-types";
import styled from "styled-components";

import TranslationContext from "Layout/TranslationContext";

import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/assets/css/leaflet.css";
import "./style.scss";

const Wrapper = styled.div`
  width: 100%;
  height: 400px;
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

const icon = L.divIcon({
  className: "map-marker marker-color-gray a-class",
  iconSize: [28, 28],
  html: '<i class="fa fa-fw fa-2x fa-question"></i>'
});

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.marker = null;
    this.onChangeLocation = this.onChangeLocation.bind(this);
  }

  componentDidMount() {
    const { location } = this.props;
    this.leaflet = L.map(this.map, {}).setView(location ? [location.lat, location.lng] : [61.32, 60.82], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.leaflet);

    this.leaflet.on("click", event => {
      let node = event.originalEvent.target.parentNode;
      while (node) {
        if (node.classList && node.classList.contains("leaflet-control-geosearch")) {
          return;
        }
        node = node.parentNode;
      }
      this.onChangeLocation(event.latlng);
    });

    new GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style: "bar",
      searchLabel: this.context("Type to search"),
      autoClose: true,
      marker: {
        icon: icon,
        draggable: false
      }
    }).addTo(this.leaflet);
    this.leaflet.on("geosearch/showlocation", ({ location: loc }) => {
      this.onChangeLocation({ lat: loc.y, lng: loc.x });
    });
    if (location) {
      this.marker = L.marker([location.lat, location.lng], { icon }).addTo(this.leaflet);
    }
  }

  componentWillUnmount() {
    this.leaflet.remove();
  }

  onChangeLocation(latlng) {
    if (this.marker) {
      this.leaflet.removeLayer(this.marker);
    }

    this.marker = L.marker([latlng.lat, latlng.lng], { icon }).addTo(this.leaflet);
    this.props.onChange(latlng);
  }

  render() {
    return (
      <Wrapper>
        <div
          ref={ref => {
            this.map = ref;
          }}
          className="leaflet"
        />
      </Wrapper>
    );
  }
}

Map.contextType = TranslationContext;

Map.propTypes = {
  onChange: PropTypes.func.isRequired,
  location: PropTypes.object
};

export default Map;
