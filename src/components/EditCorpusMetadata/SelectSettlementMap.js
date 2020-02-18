import L from 'leaflet';
import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { Button } from 'semantic-ui-react';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';
import './SelectSettlementMapStyle.scss';

// Moscow
const INIT_MAP_COORDINATES = [ 55.751571644791326, 37.617981433868415 ];
const INIT_MAP_SCALE = 4;

class SelectSettlementMap extends React.Component {
  constructor ( props ) {
    super( props );

    this.marker = null;
    this.map = null;
    this.markerIcon = null;
  }

  _initMap () {
    this.map = L.map( this.selectSettlementMapWrapper );

    this.map.setView( INIT_MAP_COORDINATES, INIT_MAP_SCALE );
  }

  _initMarker () {
    const icon = this._createMarkerIcon();
    const marker = L.marker( INIT_MAP_COORDINATES, { icon });

    return marker;
  }

  _setReferenceToDOMElement ( referenceName, element ) {
    this[ referenceName ] = element;
  }

  _createMarkerIcon () {
    const icon = L.divIcon({
      className: 'map-marker marker-color-gray',
      iconSize:  [ 28, 28 ]
    });

    return icon;
  }

  _clickOnMapHandler ( event ) {
    const coordinates = event.latlng;

    if ( !this.marker ) {
      this.marker = this._initMarker();
      
      this.marker.addTo( this.map );
    }

    this.marker.setLatLng( coordinates );
  }

  componentDidMount () {
    this.map = L.map( this.selectSettlementMapWrapper ).setView([ 55.751571644791326, 37.617981433868415 ], 4 );

    L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo( this.map );

    new GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style: 'bar',
      searchLabel: getTranslation('Type to search'),
      autoClose: true,
      marker: {
        icon: this._createMarkerIcon(),
        draggable: false,
      },
    }).addTo(this.map);

    let qwe = new OpenStreetMapProvider();

    qwe.search({ query: [ 51.505, -0.09 ] }).then( ( result ) => {
      console.log( result );
    });

    this.map.on( 'click', this._clickOnMapHandler.bind( this ) );

    this.map.on('geosearch/showlocation', ({ location }) => {
      console.log( 'geosearch/showlocation', location );
    });
  }

  selected () {
    this.props.callback();
  }

  render () {
    return (
      <div>
        <div
          ref={ this._setReferenceToDOMElement.bind( this, 'selectSettlementMapWrapper' ) }
          className = "select-settlement-map"
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

export default SelectSettlementMap;
