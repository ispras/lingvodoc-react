/* eslint-disable no-restricted-syntax */
import React, { PureComponent } from 'react';
import { Segment, Dropdown } from 'semantic-ui-react';
import 'leaflet/dist/leaflet.css';
import L, { point, Point } from 'leaflet';
import initializeContextMenu from '../../components/MapAreas/leaflet.contextmenu';
import '../../components/MapAreas/leaflet.contextmenu.scss';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Immutable, { fromJS } from 'immutable';
import getAreaOutline from '../../components/MapAreas/areas';
import { compose } from 'recompose';


const mainDictionaryQuery = gql`
query mainDictionaryQuery($id: LingvodocID){
  dictionary(id:$id){
    id
    translation
    additional_metadata{
      location
    }
  }
}`;





function initMap(mountPoint) {
  const map = L.map(mountPoint, {
    contextmenu: true,
    contextmenuWidth: 270,
  }).setView([62.8818649, 117.4730521], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}


function pointIcon(colors) {
  const html = `<span style="background-color: ${colors};"></span>`;
  return {
    className: 'point',
    html,
  };
}


function wrapDivIcon(func) {
  return options => L.divIcon(func(options));
}


class MapAreas extends PureComponent {
  constructor(props) {
    super();
    initializeContextMenu(L);
    this.areasPathsLeafletElements = {};
    this.iconFunc = wrapDivIcon(pointIcon);
    this.map = null;
    this.coors = [];
    this.state = {
      groupDictionaryCoords: [],
      outline: null,
      color: '#5E35B1'
    };
  }

  componentDidMount() {
    this.map = initMap(this.mapContainer);
    this.areasLayer = L.svg({ padding: 0 }).addTo(this.map);
    this.allDicts();
  }
  componentDidUpdate() {
    this.checkArea();
  }

  latLngToLayerPoint(coords) {
    return this.map.latLngToLayerPoint(coords);
  }
  getAreaPath(areaId) {
    const areaPath = L.SVG.create('path');
    this.areasPathsLeafletElements[areaId] = areaPath;
    this.areasLayer._container.appendChild(areaPath);

    return areaPath;
  }
  removeAreasFromMap() {
    Object.values(this.areasPathsLeafletElements)
      .forEach((path) => {
        path.parentNode.removeChild(path);
      });

    this.areasPathsLeafletElements = {};
  }
  checkArea() {
    this.map.on('zoomstart', () => {
      this.removeAreasFromMap();
      this.areaDictionaryGroup(this.state.groupDictionaryCoords, this.state.color);
    });
    this.map.on('zoomend', () => {
      this.removeAreasFromMap();
      this.areaDictionaryGroup(this.state.groupDictionaryCoords, this.state.color);
    });
  }
  updateAreaPath(areaId, outline, color) {
    const path = this.getAreaPath(areaId);
    path.setAttribute('fill', color);
    path.setAttribute('opacity', 0.5);
    path.setAttribute('stroke', 'black');
    path.setAttribute('d', outline);
  }
  areaDictionaryGroup(mainDictionaryCoords, color) {
    const pointsInPixel = mainDictionaryCoords.map(point => this.latLngToLayerPoint(point.coords));
    const outline = getAreaOutline(pointsInPixel, 24, 24);
    this.updateAreaPath(1, outline, color);
  }
  allDicts() {
    const { dictionaries, mainDictionary } = this.props;
    for (const dictionary of dictionaries) {
      if (dictionary.id[0] === mainDictionary.id[0] && dictionary.id[1] === mainDictionary.id[1]) {
        const mainDictionaryCoords = {
          coords: [dictionary.additional_metadata.location.lat, dictionary.additional_metadata.location.lng],
          colors: this.state.color,
          values: [1],
        };
        L.marker(mainDictionaryCoords.coords, { icon: this.iconFunc(mainDictionaryCoords.colors) }).addTo(this.map);
        this.areaDictionaryGroup([mainDictionaryCoords],this.state.color)
      }
    }

    // Обработка и прорисовка главного словаря
    /*  const mainDictionaryCoords = {
      coords: [mainDictionary.additional_metadata.location.lat, mainDictionary.additional_metadata.location.lng],
      colors: 'rgb(243, 0, 0)',
      values: [1],
    };
    // Маркер главного словаря
    L.marker(mainDictionaryCoords.coords, { icon: this.iconFunc(mainDictionaryCoords.colors) }).addTo(this.map);
    // Область главного словаря
    this.areaDictionaryGroup([mainDictionaryCoords],'rgb(243, 0, 0)')


    // Обработка и прорисовка словарей языковой группы
    const searchResults = Immutable.fromJS(dictionaries);
    const resultsCount = searchResults.filter(d => (d.getIn(['additional_metadata', 'location']) !== null));

    const groupDictionaryCoords = resultsCount.map((searches, dictionary) => {
      const location = searches.getIn(['additional_metadata', 'location']);
      return {
        coords: [parseFloat(location.get('lat')), parseFloat(location.get('lng'))],
        colors: '#5E35B1',
        values: [dictionary],
        dictionary: searches,
      };
    }).toJS();
    // Маркеры словарей
    groupDictionaryCoords.forEach((point) => { L.marker(point.coords, { icon: this.iconFunc(point.colors) }).addTo(this.map); });
   this.setState({groupDictionaryCoords:groupDictionaryCoords})
    // Области словарей
    this.areaDictionaryGroup(groupDictionaryCoords,this.state.color) */
  }
  render() {
    return (
      <Segment>
        <div className="leaflet">
          <div
            ref={(ref) => {
              this.mapContainer = ref;
            }}
            className="leaflet__map"
          />
        </div>
      </Segment>
    );
  }
}


export default MapAreas;
