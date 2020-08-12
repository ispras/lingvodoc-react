/* eslint-disable no-restricted-syntax */
import React, { PureComponent } from 'react';
import { Segment, Button } from 'semantic-ui-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HeatMapOverlay from 'leaflet-heatmap';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import getDistancePoint from './getDistancePerspectives';
import Placeholder from 'components/Placeholder';
import icon from '../../images/point.png';
import normolizeMethod from './normolizeMethod';

const computeDistancePerspectives = gql` 
mutation computeCognateAnalysis(
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
  scaleRadius: true,
  useLocalExtrema: false,
  latField: 'lat',
  lngField: 'lng',
  valueField: 'count',
  gradient: {
    '.5': 'rgb(8, 74, 18)',
    '.8': 'rgb(8, 74, 18)',
    '.95': 'rgb(8, 74, 18)'
  }
};
const pointIcon = L.icon({
  iconUrl: icon,
  iconSize: [7, 7],
});
const heatmapLayer = new HeatMapOverlay(cfg);


function initMap(mountPoint) {
  const map = L.map(mountPoint, {
    contextmenu: true,
    contextmenuWidth: 270,
    layers: [heatmapLayer]
  }).setView([62.8818649, 117.4730521], 3);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);


  return map;
}


class MapAreas extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      statusMap: false,
      statusRequest: true
    }
    this.dictionariesWithColors = []
  }

  componentDidMount() {
    this.allDicts();
  }

  async allDicts() {
    const {
      dictionaries,
      mainDictionary,
      computeDistancePerspectives,
      rootLanguage,
      allField,
    } = this.props;
    let maxCount = 0;

    this.dictionariesWithColors = await getDistancePoint(dictionaries, allField, mainDictionary, computeDistancePerspectives, rootLanguage);
    console.log(this.dictionariesWithColors)

    if (!this.dictionariesWithColors) {
      this.setState({ statusRequest: false });
      return;
    }
    this.setState({ statusMap: true })
    this.map = initMap(this.mapContainer);
    ;

    this.dictionariesWithColors = normolizeMethod(this.dictionariesWithColors);

    const data = this.dictionariesWithColors.map((el) => {
      const lat = Number(el.additional_metadata.location.lat);
      const lng = Number(el.additional_metadata.location.lng);
      const translation = el.translation;
      const distanceDict = el.distanceDict;
      const count = el.normolizeDistanceList;

      if (maxCount < count) {
        maxCount = count;
      }

      L.marker([lat, lng], { icon: pointIcon, title: (translation + '  distance:' + distanceDict) }).addTo(this.map)

      return { lat, lng, count };
    });

    heatmapLayer.setData({ data, max: maxCount });
  }

  render() {
    return (
      <div>
        {(!this.state.statusRequest) && (
          <div>
            <Segment>
              Данные для анализа не найдены, выберите другой словарь
          </Segment>
            <Button /* onClick={} */>
              Назад
          </Button>
          </div>
        )}
        {(this.state.statusMap === false) && (this.state.statusRequest) && (
          <Placeholder />
        )}
        {(this.state.statusMap) && (this.state.statusRequest) && (
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
        )}
      </div>

    );
  }
}


export default compose(graphql(computeDistancePerspectives, { name: 'computeDistancePerspectives' }))(MapAreas);
