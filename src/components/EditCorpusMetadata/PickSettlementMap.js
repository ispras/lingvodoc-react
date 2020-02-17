import L from 'leaflet';
import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { Button } from 'semantic-ui-react';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

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
    this.state = {};
  }

  componentDidMount () {
    this.map = L.map( this.mapWrapper ).setView([ 51.505, -0.09 ], 13 );

    L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo( this.map );

    new GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style: 'bar',
      searchLabel: getTranslation('Type to search'),
      autoClose: true,
      marker: {
        icon: markerIcon,
        draggable: false,
      },
    }).addTo(this.map);

    let qwe = new OpenStreetMapProvider();

    console.log( qwe );

    this.map.on( 'click', ( event ) => {
      const coordinates = event.latlng;

      if ( !this.marker ) {
        this.marker = L.marker( coordinates, { icon: markerIcon }).addTo( this.map );

        return;
      }

      this.marker.setLatLng( coordinates );
    });

    this.map.on('geosearch/showlocation', ({ location }) => {
      console.log( 'geosearch/showlocation' );
    });
  }

  selected () {
    this.props.callback();
  }

  render () {
    return (
      <div>
        <div
          ref={ ( ref ) => {
            this.mapWrapper = ref;
          }}
          className = "pick-settlement-map"
        >
        </div>
        <br/>
        <Button onClick = { () => {
          this.selected()
        }}>Select</Button>
      </div>
    )
  }
};

export default PickSettlementMap;
