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
import  'heatmap.js'

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
    async allDicts() {
        const { dictionaries, mainDictionary, data: { all_fields: all_fields, loading }, test, rootLanguage } = this.props;
        console.log(this.props)
        if (!loading) {
            const dictionariesWithColors = await calculateColorForDict(dictionaries, all_fields, mainDictionary, test, rootLanguage)
            this.setState({ dictionariesWithColors: dictionariesWithColors })
            this.pointAndAreaDictionary(this.state.dictionariesWithColors)
        }


    }


    pointAndAreaDictionary = (dictionariesWithColors) => {

        var testData = {
            max: 8,
            data: [{ lat: 24.6408, lng: 46.7728, count: 3 }, { lat: 50.75, lng: -1.55, count: 1 }]
        };

        var baseLayer = L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '...',
            maxZoom: 18
        }
        );

        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            // if scaleRadius is false it will be the constant radius used in pixels
            "radius": 2,
            "maxOpacity": .8,
            // scales the radius based on map zoom
            "scaleRadius": true,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": true,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count'
        };


        var heatmapLayer = new HeatmapOverlay(cfg);

        var map = new L.Map('map-canvas', {
            center: new L.LatLng(25.6586, -80.3568),
            zoom: 4,
            layers: [baseLayer, heatmapLayer]
        });

        heatmapLayer.setData(testData);


        /*   dictionariesWithColors.forEach((mainDictionary) => {
              // don't forget to include leaflet-heatmap.js
      
            const mainDictionaryCoords = {
              coords: [mainDictionary.additional_metadata.location.lat, mainDictionary.additional_metadata.location.lng],
              colors: mainDictionary.color,
              values: [1],
            };
            // Маркер главного словаря
            L.marker(mainDictionaryCoords.coords, { icon: this.iconFunc(mainDictionaryCoords.colors) }).addTo(this.map);
            // Область главного словаря
          }); */

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
