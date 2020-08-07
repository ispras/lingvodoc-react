/* eslint-disable no-restricted-syntax */
import React, { PureComponent } from 'react';
import { Segment, Dropdown, Button } from 'semantic-ui-react';
import 'leaflet/dist/leaflet.css';
import L, { point, Point } from 'leaflet';
import HeatMapOverlay from 'leaflet-heatmap';
import initializeContextMenu from '../../components/MapAreas/leaflet.contextmenu';
import '../../components/MapAreas/leaflet.contextmenu.scss';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import calculateColorForDict from './calculateColorForDictionary';
import Placeholder from 'components/Placeholder';
import icon from '../../images/point.png'

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


const cfg = {
  radius: 5,
  maxOpacity: 0.8,
  scaleRadius: true,
  useLocalExtrema: false,
  latField: 'lat',
  lngField: 'lng',
  valueField: 'count'
};


let data = [];
const heatmapLayer = new HeatMapOverlay(cfg);
function initMap(mountPoint) {
  const map = L.map(mountPoint, {
    contextmenu: true,
    contextmenuWidth: 270,
    layers: [heatmapLayer]
  }).setView([62.8818649, 117.4730521], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);


  return map;
}

const pointIcon = L.icon({
  iconUrl: icon,
  iconSize: [5, 5],
});
class MapAreas extends PureComponent {
  constructor(props) {
    super();
    initializeContextMenu(L);
  }


  componentDidMount() {
    this.map = initMap(this.mapContainer);
    this.allDicts();
  }
  async allDicts() {
    const {
      dictionaries, mainDictionary, test, rootLanguage, allField
    } = this.props;

    const dictionariesWithColors = await calculateColorForDict(dictionaries, allField, mainDictionary, test, rootLanguage);
    let maxCount = 0;
    data = dictionariesWithColors.map((el) => {
      const lat = Number(el.additional_metadata.location.lat);
      const lng = Number(el.additional_metadata.location.lng);
      const count = el.distanceDict;
      if (maxCount < count) {
        maxCount = count;
      }
      L.marker([lat, lng], { icon: pointIcon }).addTo(this.map);

      return { lat, lng, count };
    });
    console.log({ data, max: maxCount });
    heatmapLayer.setData({ data, max: maxCount });
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


export default compose(graphql(test, { name: 'test' }))(MapAreas);
