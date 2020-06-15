import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import initializeContextMenu from './leaflet.contextmenu';
import './leaflet.contextmenu.scss';
import getAreaOutline from './areas';
import { getTranslation } from 'api/i18n';
import './index.scss';

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

function wrapDivIcon(func) {
  return options => L.divIcon(func(options));
}

class MapAreas extends PureComponent {
  constructor(props) {
    super();
    initializeContextMenu(L);

    this.map = null;

    this.markersLeafletElements = new Map();
    this.iconFunc = wrapDivIcon(props.pointIcon);

    this.points = [];
    this.areas = [];
    this.areasMode = false;

    this.areasLayer = null;
    this.areasPathsLeafletElements = {};

    this.markerWidth = 24;
    this.markerHeight = 24;

    this.onZoomStartEventHandler = this.onZoomStartEventHandler.bind(this);
    this.onZoomEndEventHandler = this.onZoomEndEventHandler.bind(this);
  }

  componentDidMount() {
    this.map = initMap(this.mapContainer);

    const {
      points, areas, areasMode, markersGroups,
    } = this.props;

    this.updateMap(points, areas, areasMode, markersGroups);
  }

  componentDidUpdate() {
    const {
      points, areas, areasMode, markersGroups,
    } = this.props;

    this.updateMap(points, areas, areasMode, markersGroups);
  }

  setAreasEventHandlers() {
    this.map.on('zoomstart', this.onZoomStartEventHandler);
    this.map.on('zoomend', this.onZoomEndEventHandler);
  }

  setMarkerEventHandlers(markerData) {
    const marker = this.markersLeafletElements.get(markerData);

    if (marker) {
      marker.on('click', () => this.props.onPointClick(markerData));
    }
  }

  renderMarkers() {
    const { points } = this;

    points.forEach(point => this.addMarkerToMap(point));
  }

  renderAreas() {
    this.areas.forEach((areaItem) => {
      const areaPoints = this.getAreaPoints(areaItem);
      const { id: areaId, color } = areaItem;

      if (!this.isAreaSet(areaId)) {
        this.createAreaPath(areaId);
      }

      this.updateArea(areaPoints, areaId, color);
    });
  }

  getGroupItemsAddMarkerToGroup(markerGroups, dictionary) {
    const groups = Object.values(this.markersGroups)
      .filter(group => markerGroups.indexOf(group.id) === -1);

    return groups.map(group => ({
      text: group.text,
      callback: () => { this.props.markersHandlers.addDictToGroup(dictionary, group.id); },
    }));
  }

  getGroupItemsAddAllMarkersToGroup(markerGroups) {
    const groups = Object.values(this.markersGroups);

    return groups.map(group => ({
      text: group.text,
      callback: () => { this.props.markersHandlers.addAllDictsToGroup(markerGroups, group.id); },
    }));
  }

  getGroupItemsMoveMarkerToGroup(markerGroups, dictionary) {
    let groups = [];

    if (markerGroups.length === 1) {
      groups = Object.values(this.markersGroups)
        .filter(group => markerGroups.indexOf(group.id) === -1);
    } else {
      groups = Object.values(this.markersGroups);
    }

    return groups.map(group => ({
      text: group.text,
      callback: () => { this.props.markersHandlers.moveDictToGroup(dictionary, markerGroups, group.id); },
    }));
  }

  getAreaPoints(area) {
    const { color } = area;
    return this.points.filter(point => point.colors.indexOf(color) !== -1);
  }

  getAreaPath(areaId) {
    return this.areasPathsLeafletElements[areaId];
  }

  addMarkerLeafletElement(markerData, markerLeafletElement) {
    this.markersLeafletElements.set(markerData, markerLeafletElement);
  }

  isAreaSet(areaName) {
    const areaPath = this.getAreaPath(areaName);

    return !!areaPath;
  }

  addMarkerToMap(markerData) {
    const { coords, values: markerGroups, dictionary } = markerData;
    let markerLeafletElement = null;

    if (this.areasMode) {
      markerLeafletElement = L.marker(coords, { icon: this.iconFunc(markerData) })
        .addTo(this.map);
    } else {
      markerLeafletElement = L.marker(coords, {
        icon: this.iconFunc(markerData),
        contextmenu: true,
        contextmenuItems: [{
          text: getTranslation('Disable marker'),
          callback: () => { this.props.markersHandlers.deleteDictFromSearches(dictionary, markerGroups); },
        },
        {
          text: getTranslation('Disable all markers of the groups this marker belongs to.'),
          callback: () => { this.props.markersHandlers.deleteAllDictsOfGroups(markerGroups); },
        }, {
          separator: true,
        }, {
          text: getTranslation('Add marker to group'),
          contextmenuItems: this.getGroupItemsAddMarkerToGroup(markerGroups, dictionary),
        },
        {
          text: getTranslation('Add all markers of the groups to which this marker belongs to the group'),
          contextmenuItems: this.getGroupItemsAddAllMarkersToGroup(markerGroups),
        }, {
          separator: true,
        }, {
          text: getTranslation('Move marker to group'),
          contextmenuItems: this.getGroupItemsMoveMarkerToGroup(markerGroups, dictionary),
        }],
      })
        .addTo(this.map);
    }

    this.addMarkerLeafletElement(markerData, markerLeafletElement);

    if (!this.areasMode) {
      this.setMarkerEventHandlers(markerData);
    }
  }

  updateAreas(areas) {
    if (!areas) {
      return;
    }

    this.areas = areas;
  }

  updatePoints(points) {
    if (!points) {
      return;
    }

    this.points = points;
  }

  createAreasLayer() {
    this.areasLayer = L.svg({ padding: 0 }).addTo(this.map);

    return this.areasLayer;
  }

  updateMap(points, areas, areasMode, markersGroups) {
    if (!this.areasLayer && areas) {
      this.createAreasLayer();
    }

    if (!this.areasMode && areasMode) {
      this.removeMarkersEventHandlers();
    }

    this.areasMode = areasMode;
    this.markersGroups = markersGroups.toJS();

    if (points !== this.points) {
      this.resetMarkers();
      this.resetAreas();

      this.updatePoints(points);
      this.updateAreas(areas);

      this.renderMarkers();
      this.showAreas();
    } else if (areas !== this.areas) {
      this.resetAreas();

      this.updateAreas(areas);
      this.showAreas();
    }
  }

  createAreaPath(areaId) {
    const areaPath = L.SVG.create('path');
    this.areasPathsLeafletElements[areaId] = areaPath;

    this.areasLayer._container.appendChild(areaPath);

    return areaPath;
  }

  updateArea(areaPoints, areaId, color) {
    const { markerWidth, markerHeight } = this;
    const pointsInPixel = areaPoints.map(point => this.latLngToLayerPoint(point.coords));
    const outline = getAreaOutline(pointsInPixel, markerWidth, markerHeight);

    this.updateAreaPath(areaId, outline, color);
  }

  latLngToLayerPoint(coords) {
    return this.map.latLngToLayerPoint(coords);
  }

  updateAreaPath(areaId, outline, color) {
    const path = this.getAreaPath(areaId);

    path.setAttribute('fill', color);
    path.setAttribute('opacity', 0.5);
    path.setAttribute('stroke', 'black');
    path.setAttribute('d', outline);
  }

  reset() {
    this.resetMarkers();
    this.resetAreas();
  }

  resetMarkers() {
    this.removeMarkersEventHandlers();

    for (let marker of this.markersLeafletElements.values()) {
      this.map.removeLayer(marker);
    }

    this.markersLeafletElements.clear();

    this.points = [];
  }

  resetAreas() {
    this.areas = [];
    this.removeAreasFromMap();

    this.removeAreasEventHandlers();
  }

  removeAreasFromMap() {
    Object.values(this.areasPathsLeafletElements)
      .forEach((path) => {
        path.parentNode.removeChild(path);
      });

    this.areasPathsLeafletElements = {};
  }

  removeAreasEventHandlers() {
    this.map.on('zoomstart', () => {});
    this.map.on('zoomend', () => {});
  }

  removeMarkersEventHandlers() {
    for (let marker of this.markersLeafletElements.values()) {
      marker.on('click', () => {});
    }
  }

  onZoomStartEventHandler() {
    this.hideAreas();
  }

  onZoomEndEventHandler() {
    this.showAreas();
  }

  hideAreas() {
    this.removeAreasFromMap();
    this.removeAreasEventHandlers();
  }

  showAreas() {
    if (this.areas && this.areas.length > 0) {
      this.renderAreas();
      this.setAreasEventHandlers();
    }
  }

  destroy() {
    this.reset();
    this.map.remove();
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

MapAreas.propTypes = {
  pointIcon: PropTypes.func.isRequired,
  onPointClick: PropTypes.func.isRequired,
  points: PropTypes.array.isRequired,
  areas: PropTypes.array.isRequired,
  areasMode: PropTypes.bool.isRequired,
  markersGroups: PropTypes.object.isRequired,
  markersHandlers: PropTypes.object.isRequired,
};

export default MapAreas;
