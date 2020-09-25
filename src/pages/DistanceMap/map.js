import React, { PureComponent } from 'react';
import { Segment, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setDefaultGroup } from 'ducks/distanceMap';

const mutationDistancePerspectives = gql` 
mutation computeDistancePerspectives(
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
const ButtonBack = {
  margin: ' 10px 10px 0  0',
};

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
    };
    this.dictionariesWithColors = [];
    this.returnToTree = this.returnToTree.bind(this);
    this.back = this.back.bind(this);
  }

  componentDidMount() {
    this.allDicts();
  }

  async allDicts() {
    const {
      location, computeDistancePerspectives, history
    } = this.props;

    if (!location.state) {
      history.push('/distance_map');
    }

    let maxCount = 0;
    const
      {
        dictionaries,
        mainDictionary,
        rootLanguage,
        allField
      } = location.state;

    this.dictionariesWithColors = await getDistancePoint(dictionaries, allField, mainDictionary, computeDistancePerspectives, rootLanguage);

    if (this.dictionariesWithColors.length === 0) {
      this.setState({ statusRequest: false });
      return [];
    }

    this.setState({ statusMap: true });
    this.map = initMap(this.mapContainer);


    this.dictionariesWithColors = normolizeMethod(this.dictionariesWithColors, 255);

    const data = this.dictionariesWithColors.map((el) => {
      const lat = Number(el.additional_metadata.location.lat);
      const lng = Number(el.additional_metadata.location.lng);
      const { translation, distanceDict, normolizeDistanceNumber } = el;

      if (maxCount < normolizeDistanceNumber) {
        maxCount = normolizeDistanceNumber;
      }

      L.marker([lat, lng], { icon: pointIcon, title: (`${translation}  distance:${distanceDict}`) }).addTo(this.map);

      return { lat, lng, count: normolizeDistanceNumber };
    });

    return heatmapLayer.setData({ data, max: maxCount });
  }
  back() {
    const { history } = this.props;

    history.goBack();
  }
  returnToTree() {
    const { history, actions } = this.props;
    actions.setDefaultGroup();
    history.push('/distance_map');
  }

  render() {
    return (
      <div>
        {(!this.state.statusRequest) && (
          <div>
            <Segment>
              {getTranslation('No data found for analysis, please select another dictionary')}
            </Segment>
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
        {((this.state.statusMap) || (!this.state.statusRequest)) && (
          <div>
            <Button style={ButtonBack} onClick={this.returnToTree}>
              {getTranslation('Return to tree')}
            </Button>
            <Button style={ButtonBack} onClick={this.back}>
              {getTranslation('Back')}
            </Button>
          </div>

        )
        }
      </div >

    );
  }
}


MapAreas.propTypes = {
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,

};


export default compose(
  connect(
    state => ({ ...state.distanceMap })
    , dispatch => ({ actions: bindActionCreators({ setDefaultGroup }, dispatch) })
  ),
  graphql(mutationDistancePerspectives, { name: 'computeDistancePerspectives' })
)(MapAreas);
