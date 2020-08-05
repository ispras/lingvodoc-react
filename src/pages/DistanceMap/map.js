/* eslint-disable no-restricted-syntax */
import React, { PureComponent } from 'react';
import { Segment, Dropdown, Button } from 'semantic-ui-react';
import 'leaflet/dist/leaflet.css';
import L, { point, Point } from 'leaflet';
import initializeContextMenu from '../../components/MapAreas/leaflet.contextmenu';
import '../../components/MapAreas/leaflet.contextmenu.scss';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Immutable, { fromJS } from 'immutable';
import getAreaOutline from '../../components/MapAreas/areas';
import { compose } from 'recompose';
import calculateColorForDict from './calculateColorForDictionary';
import Placeholder from 'components/Placeholder';


const allField = gql`
query{
    all_fields{
      id
          translation
          english_translation: translation(locale_id: 2)
          data_type
    }
    }`
const test = gql` mutation computeCognateAnalysis(
      $sourcePerspectiveId: LingvodocID!, 
      $baseLanguageId: LingvodocID!,
      $groupFieldId: LingvodocID!,
      $perspectiveInfoList: [[LingvodocID]]!,
      $multiList: [ObjectVal],
      $mode: String,
      $figureFlag: Boolean,
      $matchTranslationsValue: Int,
      $onlyOrphansFlag: Boolean,
      $debugFlag: Boolean,
      $intermediateFlag: Boolean,
      $distanceFlag :Boolean
      $referencePerspectiveId:LingvodocID!) {
        cognate_analysis(
          source_perspective_id: $sourcePerspectiveId,
          base_language_id: $baseLanguageId,
          group_field_id: $groupFieldId,
          perspective_info_list: $perspectiveInfoList,
          multi_list: $multiList,
          mode: $mode,
          match_translations_value: $matchTranslationsValue,
          only_orphans_flag: $onlyOrphansFlag,
          figure_flag: $figureFlag,
          debug_flag: $debugFlag,
          intermediate_flag: $intermediateFlag,
          distance_flag: $distanceFlag,
         reference_perspective_id: $referencePerspectiveId)
        {
          distance_list
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
      color: '#5E35B1',
      dictionariesWithColors: []

    };
    this.statusLoadingPoint = false
    this.backToDictionaries = props.backToDictionaries;
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
      this.pointAndAreaDictionary(this.state.dictionariesWithColors)
    });
    this.map.on('zoomend', () => {
      this.removeAreasFromMap();
      this.pointAndAreaDictionary(this.state.dictionariesWithColors)
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


  async allDicts() {
    const { dictionaries, mainDictionary, data: { all_fields: all_fields }, test, rootLanguage } = this.props;
    const dictionariesWithColors = await calculateColorForDict(dictionaries, all_fields, mainDictionary, test, rootLanguage)
    this.setState({ dictionariesWithColors: dictionariesWithColors })
    this.pointAndAreaDictionary(this.state.dictionariesWithColors)
  }


  pointAndAreaDictionary = (dictionariesWithColors) => {

    dictionariesWithColors.forEach((mainDictionary) => {
      const mainDictionaryCoords = {
        coords: [mainDictionary.additional_metadata.location.lat, mainDictionary.additional_metadata.location.lng],
        colors: mainDictionary.color,
        values: [1],
      };
      // Маркер главного словаря
      L.marker(mainDictionaryCoords.coords, { icon: this.iconFunc(mainDictionaryCoords.colors) }).addTo(this.map);
      // Область главного словаря
      this.areaDictionaryGroup([mainDictionaryCoords], mainDictionary.color);
    });

  }

  back = () => {
    this.backToDictionaries(null)
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
        {/*  <Button onClick={this.back}>Назад</Button> */}
      </Segment>
    );
  }
}


export default compose(graphql(allField), graphql(test, { name: 'test' }))(MapAreas);
