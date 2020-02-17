import L from 'leaflet';
import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { Modal } from 'semantic-ui-react';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';
import './PickSettlementMapStyle.scss';

const markerIcon = L.divIcon({
  className: 'map-marker marker-color-gray a-class',
  iconSize: [28, 28]
});

class PickSettlementMap extends React.Component {
  constructor ( props ) {
    super( props );

    this.mapWrapper = null;
    this.marker = null;
    this.map = null;
  }

  componentDidMount () {
    this.map = L.map( this.mapWrapper ).setView([ 51.505, -0.09 ], 13 );

    L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo( this.map );

    this.map.on( 'click', ( event ) => {
      const coordinates = event.latlng;

      if ( !this.marker ) {
        this.marker = L.marker( coordinates, { icon: markerIcon }).addTo( this.map );

        return;
      }

      this.marker.setLatLng( coordinates );
    });
  }

  render () {
    return (
      <div
        ref={(ref) => {
          this.mapWrapper = ref;
        }}
        className = "pick-settlement-map"
      >

      </div>
    )
  }
};

export default PickSettlementMap;
