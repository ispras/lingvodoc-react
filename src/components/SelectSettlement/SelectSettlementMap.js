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
    this.geoSearchInput = null;
    this.markerText = null;
  }

  _createReference ( name, element ) {
    this[ name ] = element;
  }

  _createMap ( wrapper ) {
    const map = L.map( wrapper ).setView( INIT_MAP_COORDINATES, INIT_MAP_SCALE );

    return map;
  }

  _createTileLayer () {
    const tileLayer = L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }
    );
    
    return tileLayer;
  }

  _createMarker ( coordinates ) {
    const icon = this._createMarkerIcon();
    const marker = L.marker( coordinates, { icon });

    return marker;
  }

  _createMarkerIcon () {
    const icon = L.divIcon({
      className: 'map-marker marker-color-gray',
      iconSize:  [ 28, 28 ]
    });

    return icon;
  }

  _createProvider () {
    const provider = new OpenStreetMapProvider();

    return provider;
  }

  _createGeoSearchControl ( provider ) {
    const geoSearchControl = new GeoSearchControl({
      provider,
      searchLabel: getTranslation( 'Type to search' ),
      autoClose: true,
      style: 'bar',
      marker: {
        draggable: false,
        icon: this._createMarkerIcon()
      }
    });

    return geoSearchControl;
  }

  _getGeoSearchInput () {
    const geoSearchInput = document.querySelector( '.glass' );

    geoSearchInput.addEventListener( 'click', ( event ) => {
      event.stopPropagation();
    });

    return geoSearchInput;
  }

  _clickOnMapHandler ( provider, event ) {
    const coordinates = [ event.latlng.lat, event.latlng.lng ];

    if ( !this.marker ) {
      this.marker = this._createMarker( coordinates ).addTo( this.map );
    } else {
      this.marker.setLatLng( coordinates );
    }

    provider.search({ query: coordinates }).then( ( result ) => {
      const label = result[ 0 ].label;

      this.markerText = label;
      this.geoSearchInput.value = label;
      this.marker.bindPopup( label ).openPopup();
    });
  }

  _geoSearchHandler ( event ) {
    const label = event.location.label;
    const coordinates = [ Number( event.location.y ), Number( event.location.x ) ];

    if ( !this.marker ) {
      this.marker = this._createMarker( coordinates ).addTo( this.map );
    } else {
      this.marker.setLatLng( coordinates );
    }

    this.markerText = label;
    this.marker.bindPopup( label ).openPopup();
  }

  componentDidMount () {
    this.map = this._createMap( this.selectSettlementMapWrapper );

    const provider = this._createProvider();
    const tileLayer = this._createTileLayer();
    const geoSearchControl = this._createGeoSearchControl( provider );

    tileLayer.addTo( this.map );
    geoSearchControl.addTo( this.map );

    this.geoSearchInput = this._getGeoSearchInput();

    this.map.on( 'click', this._clickOnMapHandler.bind( this, provider ) );
    this.map.on( 'geosearch/showlocation', this._geoSearchHandler.bind( this ) );
  }

  selected () {
    this.props.callback( this.markerText );
  }

  render () {
    return (
      <div>
        <div
          ref={ this._createReference.bind( this, 'selectSettlementMapWrapper' ) }
          className = "select-settlement-map"
        >
        </div>
        <br/>
        <Button onClick = { () => {
          this.selected()
          this.props.closeModal()
        }} className="lingvo-button-violet">{ getTranslation('Select') }</Button>
        <Button onClick = { () => {
          this.props.closeModal()
        }} className="lingvo-button-basic-black">{ getTranslation('Close') }</Button>
      </div>
    )
  }
};

SelectSettlementMap.propTypes = {
  closeModal: PropTypes.func.isRequired,
  callback: PropTypes.func.isRequired
};

export default SelectSettlementMap;
