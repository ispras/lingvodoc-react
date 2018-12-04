import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BubbleSet, ShapeSimplifier, BSplineShapeGenerator, PointPath } from 'bubblesets-js';

function initMap(mountPoint) {
  const map = L.map(mountPoint, {}).setView([62.8818649, 117.4730521], 4);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

function wrapDivIcon(func) {
  return options => L.divIcon(func(options));
}

function getRectangles(width, height, markerX, markerY) {
  return {
    width,
    height,
    x: markerX,
    y: markerY,
  };
}

function getAreaOutline(rectangles) {
  const pad = 5;
  const bubbles = new BubbleSet();
  const list = bubbles.createOutline(
    BubbleSet.addPadding(rectangles, pad),
    []
  );

  const outline = new PointPath(list).transform([
    new ShapeSimplifier(0.0),
    new BSplineShapeGenerator(),
    new ShapeSimplifier(0.0),
  ]);

  return outline;
}

class Map {
  constructor(mountPoint, options) {
    this.options = options;
    this.map = initMap(mountPoint);
    this.markersLeafletElements = {};
    this.iconFunc = wrapDivIcon(options.icon);
    this.markerGroups = [];
    this.areas = [];
    this.areasLayer = null;
    this.areasPathsLeafletElements = {};

    this.onZoomStartEventHandler = this.onZoomStartEventHandler.bind(this);
    this.onZoomEndEventHandler = this.onZoomEndEventHandler.bind(this);
  }

  load(markerGroups, areas) {
    if (!this.areasLayer && areas) {
      this.createAreasLayer();
    }

    // data.forEach(point => this.addPoint(point));
    this.updateMarkers(markerGroups);
    this.renderMarkers();
    this.updateAreas(areas);
  }

  createAreasLayer() {
    this.areasLayer = L.svg({ padding: 0 }).addTo(this.map);

    return this.areasLayer;
  }

  setAreasEventHandlers() {
    this.map.on('zoomstart', this.onZoomStartEventHandler);
    this.map.on('zoomend', this.onZoomEndEventHandler);
  }

  updateMarkers(markerGroups) {
    if (!markerGroups) {
      return;
    }

    this.markerGroups = markerGroups;
  }

  renderMarkers() {
    this.markerGroups.forEach((group) => {
      group.markers.forEach((marker) => {
        this.addMarkerToMap({
          ...marker,
          colors: group.colors,
          groupName: group.name,
        });
      });
    });
  }

  updateAreas(areas) {
    if (!areas) {
      return;
    }

    this.areas = areas;
  }

  renderAreas() {
    this.areas.forEach((areaItem) => {
      const markerGroup = this.getMarkerGroup(areaItem);
      if (!markerGroup) {
        return;
      }

      const { name: markerGroupName } = markerGroup;

      if (!this.isAreaSet(markerGroupName)) {
        this.createAreaPath(markerGroupName);
      }

      this.updateArea(markerGroup);
    });
  }

  addMarkerToMap(markerData) {
    const { coords, groupName } = markerData;
    const markerLeafletElement = L.marker(coords, { icon: this.iconFunc(markerData) })
      .addTo(this.map)
      .on('contextmenu', (ev) => {
        L
          .popup()
          .setLatLng(ev.latlng)
          .setContent('<pre>Hello</pre>')
          .addTo(this.map)
          .openOn(this.map);
      })
      // .on('contextmenu', () => this.options.onPointClick(markerData))
      .on('click', () => this.options.onPointClick(markerData));

    this.addMarkerLeafletElement(markerLeafletElement, groupName);
  }

  addMarkerLeafletElement(markerLeafletElement, groupName) {
    if (!this.markersLeafletElements[groupName]) {
      this.markersLeafletElements[groupName] = [];
    }

    this.markersLeafletElements[groupName].push(markerLeafletElement);
  }

  getMarkerGroup(markerGroupName) {
    const { markerGroups } = this;
    let result = null;

    if (!markerGroups) {
      return result;
    }

    markerGroups.forEach((group) => {
      if (group.name === markerGroupName) {
        result = group;
      }
    });

    return result;
  }

  isAreaSet(areaName) {
    const areaPath = this.getAreaPath(areaName);

    return !!areaPath;
  }

  getAreaPath(markerGroupName) {
    return this.areasPathsLeafletElements[markerGroupName];
  }

  createAreaPath(markerGroupName) {
    const areaPath = L.SVG.create('path');
    this.areasPathsLeafletElements[markerGroupName] = areaPath;

    this.areasLayer._container.appendChild(areaPath);

    return areaPath;
  }

  updateArea(markerGroup) {
    const { markers, colors, name } = markerGroup;
    const color = colors[colors.length - 1];
    const markerWidth = 24;
    const markerHeight = 24;
    const markersRectangles = [];

    markers.forEach((markerItem) => {
      const { coords } = markerItem;
      if (!coords) {
        return;
      }

      const markerInPixel = this.latLngToLayerPoint(coords);
      markersRectangles.push(getRectangles(markerWidth, markerHeight, markerInPixel.x, markerInPixel.y));
    });

    const outline = getAreaOutline(markersRectangles);
    this.updateAreaPath(name, outline, color);
  }

  latLngToLayerPoint(coords) {
    return this.map.latLngToLayerPoint(coords);
  }

  updateAreaPath(markerGroupName, outline, color) {
    const path = this.getAreaPath(markerGroupName);

    path.setAttribute('d', outline);
    path.setAttribute('fill', color);
    path.setAttribute('opacity', 0.5);
    path.setAttribute('stroke', 'black');

    console.log('--- areas ---', this.areas);
    console.log('--- areasLayer ---', this.areasLayer);
    console.log('--- areasPaths ---', this.areasPathsLeafletElements);
    console.log('--- markersLeafletElements ---', this.markersLeafletElements);
  }

  reset() {
    // this.points.forEach(point => this.map.removeLayer(point));
    // this.points = [];
    this.areas = [];

    Object.values(this.markersLeafletElements)
      .forEach((markersLeafletElements) => {
        markersLeafletElements.forEach(marker => this.map.removeLayer(marker));
      });
    this.markersLeafletElements = {};

    this.map.removeLayer(this.areasLayer);
    this.removeAreasFromMap();
    this.areasLayer = null;
    this.markerGroups = null;
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
    this.renderAreas();
    this.setAreasEventHandlers();
  }

  // destroy() {
  //   this.reset();
  //   this.map.remove();
  // }
}

export default Map;
