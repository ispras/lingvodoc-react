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


const distanceDict= '{"operationName":"computeCognateAnalysis","variables":{"sourcePerspectiveId":[657,4],"baseLanguageId":[508,45],"groupFieldId":[66,25],"perspectiveInfoList":[[[688,14233],[66,8],[66,10]],[[656,3],[66,8],[66,10]],[[660,8],[66,8],[66,10]],[[657,4],[66,8],[66,10]],[[2872,20255],[66,8],[66,10]],[[2685,1654],[66,8],[66,10]],[[2685,847],[66,8],[66,10]],[[2685,7],[66,8],[66,10]],[[867,10],[66,8],[66,10]],[[652,3],[66,8],[66,10]],[[2654,9324],[66,8],[66,10]],[[1393,29132],[66,8],[66,10]]],"multiList":[],"mode":"","matchTranslationsValue":1,"onlyOrphansFlag":true,"figureFlag":true,"debugFlag":false,"intermediateFlag":false},"query":"mutation computeCognateAnalysis($sourcePerspectiveId: LingvodocID!, $baseLanguageId: LingvodocID!, $groupFieldId: LingvodocID!, $perspectiveInfoList: [[LingvodocID]]!, $multiList: [ObjectVal], $mode: String, $figureFlag: Boolean, $matchTranslationsValue: Int, $onlyOrphansFlag: Boolean, $debugFlag: Boolean, $intermediateFlag: Boolean) {\n  cognate_analysis(source_perspective_id: $sourcePerspectiveId, base_language_id: $baseLanguageId, group_field_id: $groupFieldId, perspective_info_list: $perspectiveInfoList, multi_list: $multiList, mode: $mode, match_translations_value: $matchTranslationsValue, only_orphans_flag: $onlyOrphansFlag, figure_flag: $figureFlag, debug_flag: $debugFlag, intermediate_flag: $intermediateFlag, distance_flag: true, reference_perspective_id: [657,4]) {\n    triumph\n    dictionary_count\n    group_count\n    not_enough_count\n    transcription_count\n    translation_count\n    xlsx_url\n    figure_url\n    minimum_spanning_tree\n    embedding_2d\n    embedding_3d\n    perspective_name_list\n    suggestion_list\n    suggestion_field_id\n    intermediate_url_list\n    distance_list  __typename\n  }\n}\n"}'








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
