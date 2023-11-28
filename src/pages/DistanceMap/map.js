import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Label, Segment } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import L from "leaflet";
import HeatMapOverlay from "leaflet-heatmap";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import Footer from "components/Footer";
import Placeholder from "components/Placeholder";
import { setDefaultGroup, setDictionariesGroup } from "ducks/distanceMap";
import TranslationContext from "Layout/TranslationContext";

import icon from "../../images/point.png";

import getDistancePoint from "./getDistancePerspectives";
import { dictionaryName } from "./graphql";
import normolizeMethod from "./normolizeMethod";

import "leaflet/dist/leaflet.css";

const mutationDistancePerspectives = gql`
  mutation computeDistancePerspectives(
    $sourcePerspectiveId: LingvodocID!
    $baseLanguageId: LingvodocID!
    $groupFieldId: LingvodocID!
    $perspectiveInfoList: [[LingvodocID]]!
    $multiList: [ObjectVal]
    $mode: String
    $figureFlag: Boolean
    $matchTranslationsValue: Int
    $onlyOrphansFlag: Boolean
    $debugFlag: Boolean
    $intermediateFlag: Boolean
    $distanceFlag: Boolean
    $referencePerspectiveId: LingvodocID!
  ) {
    cognate_analysis(
      source_perspective_id: $sourcePerspectiveId
      base_language_id: $baseLanguageId
      group_field_id: $groupFieldId
      perspective_info_list: $perspectiveInfoList
      multi_list: $multiList
      mode: $mode
      match_translations_value: $matchTranslationsValue
      only_orphans_flag: $onlyOrphansFlag
      figure_flag: $figureFlag
      debug_flag: $debugFlag
      intermediate_flag: $intermediateFlag
      distance_flag: $distanceFlag
      reference_perspective_id: $referencePerspectiveId
    ) {
      distance_list
    }
  }
`;
const ButtonBack = {
  margin: "26px 20px 0 0"
};

const cfg = {
  radius: 5,
  scaleRadius: true,
  useLocalExtrema: false,
  latField: "lat",
  lngField: "lng",
  valueField: "count",
  gradient: {
    ".5": "rgb(8, 74, 18)",
    ".8": "rgb(8, 74, 18)",
    ".95": "rgb(8, 74, 18)"
  }
};

const pointIcon = L.icon({
  iconUrl: icon,
  iconSize: [7, 7]
});

const heatmapLayer = new HeatMapOverlay(cfg);

function initMap(mountPoint) {
  const map = L.map(mountPoint, {
    contextmenu: true,
    contextmenuWidth: 270,
    layers: [heatmapLayer]
  }).setView([62.8818649, 117.4730521], 3);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  return map;
}

class MapAreas extends PureComponent {
  constructor() {
    super();
    this.state = {
      statusMap: false,
      statusRequest: true
    };
    this.dictionariesWithColors = [];
    this.returnToTree = this.returnToTree.bind(this);
    this.back = this.back.bind(this);
    this.newDict = [];

    this.map = null;
  }

  componentDidMount() {
    this.allDicts();
  }

  async allDicts() {
    const {
      location,
      computeDistancePerspectives,
      selected,
      dataForTree,
      dictionariesGroupState: { arrDictionariesGroup: dictionaries },
      client
    } = this.props;

    if (!location.state) {
      return null;
    }

    if (selected && selected.id !== dataForTree.idLocale) {
      for (const dictionary of dictionaries) {
        const result = await client.query({
          query: dictionaryName,
          variables: { id: dictionary.id }
        });
        this.newDict.push(result.data.dictionary);
      }
    } else {
      this.newDict = dictionaries;
    }
    let maxCount = 0;
    const { allField } = dataForTree;
    const { mainDictionary, rootLanguage } = location.state;

    this.dictionariesWithColors = await getDistancePoint(
      this.newDict,
      allField,
      mainDictionary,
      computeDistancePerspectives,
      rootLanguage
    );

    if (this.dictionariesWithColors.length === 0) {
      this.setState({ statusRequest: false });
      return [];
    }

    this.setState({ statusMap: true });
    this.map = initMap(this.mapContainer);
    
    this.dictionariesWithColors = normolizeMethod(this.dictionariesWithColors, 255);

    const data = this.dictionariesWithColors.map(el => {
      if (!el.additional_metadata.location) {
        return null;
      }

      const lat = Number(el.additional_metadata.location.lat);
      const lng = Number(el.additional_metadata.location.lng);
      const { translations, distanceDict, normolizeDistanceNumber } = el;

      if (maxCount < normolizeDistanceNumber) {
        maxCount = normolizeDistanceNumber;
      }

      L.marker([lat, lng], { icon: pointIcon, title: `${T(translations)}  distance:${distanceDict}` }).addTo(this.map);

      return { lat, lng, count: normolizeDistanceNumber };
    });

    const dataFilter = data.filter(function(item) {
      if (item) {
        return item;
      }
    });

    return heatmapLayer.setData({ data: dataFilter, max: maxCount });
  }

  back() {
    this.props.navigate(-1);
  }

  returnToTree() {
    const { navigate, actions } = this.props;
    actions.setDefaultGroup();
    navigate("/distance_map");
  }

  render() {
    const { location, user } = this.props;

    const { mainDictionary } = location.state;

    if (!location.state) {
      return null;
    }

    if (!user || user.id !== 1) {
      return (
        <div style={{ marginTop: "1em" }}>
          <Label>
            {this.context("For the time being Distance Map functionality is available only for the administrator.")}
          </Label>
        </div>
      );
    }

    return (
      <div className="lingvodoc-page">
        <div className="lingvodoc-page__content">

          {mainDictionary && (
              <div className="background-header">
                <Container className="published">
                  <h2 className="page-title">{T(mainDictionary.translations)}</h2>
                </Container>
              </div>
          )}
          <Container>
            {!this.state.statusRequest && (
              <div className="lingvo-message lingvo-message_warning">
                {this.context("No data found for analysis, please select another dictionary")}
              </div>
            )}
            {this.state.statusMap === false && this.state.statusRequest && <Placeholder />}
            
            <Segment className={(this.state.statusMap && this.state.statusRequest) ? "lingvo-segment-maps" : "lingvo-segment-maps lingvo-segment-maps_hidden"}>
              <div className="leaflet">
                <div
                  ref={ref => {
                    this.mapContainer = ref;
                  }}
                  className="leaflet__map"
                />
              </div>
            </Segment>
            
            {(this.state.statusMap || !this.state.statusRequest) && (
              <div>
                <Button 
                  style={ButtonBack} 
                  onClick={this.returnToTree} 
                  className="lingvo-button-basic-black lingvo-button-basic-black_small"
                >
                  {this.context("Return to tree")}
                </Button>
                <Button 
                  style={ButtonBack} 
                  onClick={this.back}
                  className="lingvo-button-violet lingvo-button-violet_small"
                >
                  {this.context("Back")}
                </Button>
              </div>
            )}
          </Container>
        </div>

        <Footer />
      </div>
    );
  }
}

MapAreas.contextType = TranslationContext;

MapAreas.propTypes = {
  actions: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired
};

const EnhancedMapAreas = compose(
  connect(
    state => ({ ...state.distanceMap }),
    dispatch => ({ actions: bindActionCreators({ setDefaultGroup, setDictionariesGroup }, dispatch) })
  ),
  connect(state => state.locale),
  connect(state => state.user),
  graphql(mutationDistancePerspectives, { name: "computeDistancePerspectives" }),
  withApollo
)(MapAreas);

const Wrapper = props => {
  const location = useLocation();
  const navigate = useNavigate();

  return <EnhancedMapAreas {...props} location={location} navigate={navigate} />;
};

export default Wrapper;
