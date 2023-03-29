import React from "react";
import { Segment } from "semantic-ui-react";
import Immutable, { fromJS } from "immutable";
import L from "leaflet";
import { isEqual } from "lodash";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

import getAreaOutline from "./areas";
import initializeContextMenu from "./leaflet.contextmenu";

import "leaflet/dist/leaflet.css";
import "./leaflet.contextmenu.scss";
import "./index.scss";

const wrapDivIcon = (func) => {
  return options => L.divIcon(func(options));
};

class MapAreas extends React.PureComponent {
  constructor(props) {
    super();
    initializeContextMenu(L);

    this.map = null;

    this.markersLeafletElements = new Map();
    this.iconFunc = wrapDivIcon(props.pointIcon);

    this.points = [];
    this.pointsSet = new Immutable.Set();
    this.areas = [];
    this.areasMode = false;

    this.areasLayer = null;
    this.areasPathsLeafletElements = {};

    this.markerWidth = 24;
    this.markerHeight = 24;

    this.initMap = this.initMap.bind(this);
    this.onZoomStartEventHandler = this.onZoomStartEventHandler.bind(this);
    this.onZoomEndEventHandler = this.onZoomEndEventHandler.bind(this);
  }

  componentDidMount() {
    this.map = this.initMap(this.mapContainer);

    const { points, areas, areasMode, markersGroups } = this.props;
    this.updateMap(points, areas, areasMode, markersGroups);
  }

  componentDidUpdate() {
    const { points, areas, areasMode, markersGroups } = this.props;

    this.updateMap(points, areas, areasMode, markersGroups);
  }

  initMap(mountPoint) {
    const map = L.map(mountPoint, {
      contextmenu: true,
      contextmenuWidth: 270,
      zoomSnap: 0.5,
      zoomDelta: 0.5
    }).setView([62.8818649, 117.4730521], 4);
  
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    return map;
  }

  setAreasEventHandlers() {
    this.map.on("zoomstart", this.onZoomStartEventHandler);
    this.map.on("zoomend", this.onZoomEndEventHandler);
  }

  setMarkerEventHandlers(markerData) {
    const marker = this.markersLeafletElements.get(markerData);

    if (marker) {
      marker.on("click", () => this.props.onPointClick(markerData));
    }
  }

  renderMarkers() {
    const { points } = this;

    points.forEach(point => this.addMarkerToMap(point));
  }

  renderAreas() {
    this.areas.forEach(areaItem => {
      const areaPoints = this.getAreaPoints(areaItem);
      const { id: areaId, color } = areaItem;

      if (!this.isAreaSet(areaId)) {
        this.createAreaPath(areaId);
      }

      this.updateArea(areaPoints, areaId, color);
    });
  }

  getGroupItemsAddMarkerToGroup(markerGroups, dictionary) {
    const groups = Object.values(this.markersGroups).filter(group => markerGroups.indexOf(group.id) === -1);

    return groups.map(group => ({
      text: group.text,
      callback: () => {
        this.props.markersHandlers.addDictToGroup(dictionary, group.id);
      }
    }));
  }

  getGroupItemsAddAllMarkersToGroup(markerGroups) {
    const groups = Object.values(this.markersGroups);

    return groups.map(group => ({
      text: group.text,
      callback: () => {
        this.props.markersHandlers.addAllDictsToGroup(markerGroups, group.id);
      }
    }));
  }

  getGroupItemsMoveMarkerToGroup(markerGroups, dictionary) {
    let groups = [];

    if (markerGroups.length === 1) {
      groups = Object.values(this.markersGroups).filter(group => markerGroups.indexOf(group.id) === -1);
    } else {
      groups = Object.values(this.markersGroups);
    }

    return groups.map(group => ({
      text: group.text,
      callback: () => {
        this.props.markersHandlers.moveDictToGroup(dictionary, markerGroups, group.id);
      }
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
      markerLeafletElement = L.marker(coords, { icon: this.iconFunc(markerData) }).addTo(this.map);
    } else {
      markerLeafletElement = L.marker(coords, {
        icon: this.iconFunc(markerData),
        contextmenu: true,
        contextmenuItems: [
          {
            text: this.context("Disable marker"),
            callback: () => {
              this.props.markersHandlers.deleteDictFromSearches(dictionary, markerGroups);
            }
          },
          {
            text: this.context("Disable all markers of the groups this marker belongs to."),
            callback: () => {
              this.props.markersHandlers.deleteAllDictsOfGroups(markerGroups);
            }
          },
          {
            separator: true
          },
          {
            text: this.context("Add marker to group"),
            contextmenuItems: this.getGroupItemsAddMarkerToGroup(markerGroups, dictionary)
          },
          {
            text: this.context("Add all markers of the groups to which this marker belongs to the group"),
            contextmenuItems: this.getGroupItemsAddAllMarkersToGroup(markerGroups)
          },
          {
            separator: true
          },
          {
            text: this.context("Move marker to group"),
            contextmenuItems: this.getGroupItemsMoveMarkerToGroup(markerGroups, dictionary)
          }
        ]
      }).addTo(this.map);
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

    points.sort((a, b) => {
      const [ax, ay] = a.coords;
      const [bx, by] = b.coords;
      return ax - bx || ay - by;
    });

    if (!isEqual(points, this.points)) {
      this.resetMarkers();
      this.resetAreas();

      this.updatePoints(points);
      this.updateAreas(areas);

      /*
       * If we are adding never before seen markers to the map,
       * we refit the map to include all of them.
       */

      let new_point_flag = false;

      for (const point of points) {
        const point_signature = fromJS({ ...point, dictionary: point.dictionary.get("id").toJS() });

        if (!this.pointsSet.has(point_signature)) {
          this.pointsSet = this.pointsSet.add(point_signature);
          new_point_flag = true;
        }
      }

      if (new_point_flag) {
        const coord_list = points.map(point => point.coords);

        this.map.fitBounds(this.map.getBounds().extend(L.latLngBounds(coord_list).pad(0.05)), {
          maxZoom: this.map.getZoom()
        });
      }

      this.renderMarkers();
      this.showAreas();
    } else if (areas !== this.areas) {
      this.resetAreas();

      this.updateAreas(areas);
      this.showAreas();
    }
  }

  createAreaPath(areaId) {
    const areaPath = L.SVG.create("path");
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

    path.setAttribute("fill", color);
    path.setAttribute("opacity", 0.5);
    path.setAttribute("stroke", "black");
    path.setAttribute("d", outline);
  }

  reset() {
    this.resetMarkers();
    this.resetAreas();
  }

  resetMarkers() {
    this.removeMarkersEventHandlers();

    for (const marker of this.markersLeafletElements.values()) {
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
    Object.values(this.areasPathsLeafletElements).forEach(path => {
      path.parentNode.removeChild(path);
    });

    this.areasPathsLeafletElements = {};
  }

  removeAreasEventHandlers() {
    this.map.on("zoomstart", () => {});
    this.map.on("zoomend", () => {});
  }

  removeMarkersEventHandlers() {
    for (const marker of this.markersLeafletElements.values()) {
      marker.on("click", () => {});
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
            ref={ref => {
              this.mapContainer = ref;
            }}
            className="leaflet__map"
          />
        </div>
      </Segment>
    );
  }
}

MapAreas.contextType = TranslationContext;

MapAreas.propTypes = {
  pointIcon: PropTypes.func.isRequired,
  onPointClick: PropTypes.func.isRequired,
  points: PropTypes.array.isRequired,
  areas: PropTypes.array.isRequired,
  areasMode: PropTypes.bool.isRequired,
  markersGroups: PropTypes.object.isRequired,
  markersHandlers: PropTypes.object.isRequired
};

export default MapAreas;
