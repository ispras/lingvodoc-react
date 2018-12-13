import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BubbleSet, ShapeSimplifier, BSplineShapeGenerator, PointPath } from 'bubblesets-js';
import initializeContextMenu from './leaflet.contextmenu';
import './leaflet.contextmenu.scss';

function initMap(mountPoint) {
  const map = L.map(mountPoint, {
    contextmenu: true,
    contextmenuWidth: 270,
  }).setView([62.8818649, 117.4730521], 4);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

function wrapDivIcon(func) {
  return options => L.divIcon(func(options));
}

function getRectangles(width, height, pointX, pointY) {
  return {
    width,
    height,
    x: pointX,
    y: pointY,
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

class MapAreas {
  constructor(mountPoint, options, markersHandlers) {
    initializeContextMenu(L);

    this.options = options;
    this.map = initMap(mountPoint);
    this.markersHandlers = markersHandlers;

    this.markersLeafletElements = new Map();
    this.iconFunc = wrapDivIcon(options.icon);

    this.points = [];
    this.areas = [];
    this.areasMode = false;

    this.areasLayer = null;
    this.areasPathsLeafletElements = {};

    this.onZoomStartEventHandler = this.onZoomStartEventHandler.bind(this);
    this.onZoomEndEventHandler = this.onZoomEndEventHandler.bind(this);
  }

  load(points, areas, areasMode, markersGroups) {
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

  createAreasLayer() {
    this.areasLayer = L.svg({ padding: 0 }).addTo(this.map);

    return this.areasLayer;
  }

  setAreasEventHandlers() {
    this.map.on('zoomstart', this.onZoomStartEventHandler);
    this.map.on('zoomend', this.onZoomEndEventHandler);
  }

  setMarkerEventHandlers(markerData) {
    const marker = this.markersLeafletElements.get(markerData);

    if (marker) {
      marker
        // .on('contextmenu', (ev) => {
        //   L
        //     .popup()
        //     .setLatLng(ev.latlng)
        //     .setContent('<pre>Hello</pre>')
        //     .addTo(this.map)
        //     .openOn(this.map);
        // })
        // .on('contextmenu', () => this.options.onPointClick(markerData))
        .on('click', () => this.options.onPointClick(markerData));
    }
  }

  updatePoints(points) {
    if (!points) {
      return;
    }

    this.points = points;
  }

  renderMarkers() {
    const { points } = this;

    points.forEach(point => this.addMarkerToMap(point));
  }

  updateAreas(areas) {
    if (!areas) {
      return;
    }

    this.areas = areas;
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

  getGroupItemsAddMarkerToGroup(markerData) {
    const groups = Object.values(this.markersGroups)
      .filter(group => markerData.values.indexOf(group.id) === -1);

    return groups.map((group) => {
      return {
        text: group.text,
        callback: () => { this.markersHandlers.addMarkerToGroup(markerData, group); },
      };
    });
  }

  getGroupItemsAddAllMarkersToGroup(markerData) {
    // const groups = Object.values(this.markersGroups)
    //   .filter(group => markerData.values.indexOf(group.id) === -1);
    const groups = Object.values(this.markersGroups);

    return groups.map((group) => {
      return {
        text: group.text,
        callback: () => { this.markersHandlers.addAllMarkersToGroup(markerData, group); },
      };
    });
  }

  getGroupItemsMoveMarkerToGroup(markerData) {
    let groups = [];

    if (markerData.values.length === 1) {
      groups = Object.values(this.markersGroups)
        .filter(group => markerData.values.indexOf(group.id) === -1);
    } else {
      groups = Object.values(this.markersGroups);
    }

    return groups.map((group) => {
      return {
        text: group.text,
        callback: () => { this.markersHandlers.moveMarkerToGroup(markerData, group); },
      };
    });
  }

  addMarkerToMap(markerData) {
    const { coords } = markerData;
    let markerLeafletElement = null;

    if (this.areasMode) {
      markerLeafletElement = L.marker(coords, { icon: this.iconFunc(markerData) })
        .addTo(this.map);
    } else {
      markerLeafletElement = L.marker(coords, { 
        icon: this.iconFunc(markerData),
        contextmenu: true,
        contextmenuItems: [{
          text: 'Отключить маркер',
          callback: () => { this.markersHandlers.deleteDictFromSearches(markerData); },
        },
        {
          text: 'Отключить все маркеры групп, к которым относится данный маркер',
          callback: () => { this.markersHandlers.deleteAllDictsOfGroups(markerData.values); },
        }, {
          separator: true,
        }, {
          text: 'Добавить маркер в группу',
          contextmenuItems: this.getGroupItemsAddMarkerToGroup(markerData),
        },
        {
          text: 'Добавить все маркеры групп, к которым относится данный маркер, в группу',
          contextmenuItems: this.getGroupItemsAddAllMarkersToGroup(markerData),
        }, {
          text: 'Перенести маркер в группу',
          contextmenuItems: this.getGroupItemsMoveMarkerToGroup(markerData),
        },
        // {
        //   text: 'Добавить все маркеры, не вошедшие в результат поиска на карту в группу',
        //   contextmenuItems: [{
        //     text: 'Search 1',
        //     callback: () => { console.log('Add markers to the Search 1'); },
        //   }, {
        //     text: 'Search 2',
        //     callback: () => { console.log('Add markers to the Search 2'); },
        //   }],
        // }
        ],
      })
        .addTo(this.map);
    }

    this.addMarkerLeafletElement(markerData, markerLeafletElement);

    if (!this.areasMode) {
      this.setMarkerEventHandlers(markerData);
    }
  }

  addMarkerLeafletElement(markerData, markerLeafletElement) {
    this.markersLeafletElements.set(markerData, markerLeafletElement);
  }

  getAreaPoints({ color }) {
    return this.points.filter(point => point.colors.indexOf(color) !== -1);
  }

  isAreaSet(areaName) {
    const areaPath = this.getAreaPath(areaName);

    return !!areaPath;
  }

  getAreaPath(areaId) {
    return this.areasPathsLeafletElements[areaId];
  }

  createAreaPath(areaId) {
    const areaPath = L.SVG.create('path');
    this.areasPathsLeafletElements[areaId] = areaPath;

    this.areasLayer._container.appendChild(areaPath);

    return areaPath;
  }

  updateArea(areaPoints, areaId, color) {
    const markerWidth = 24;
    const markerHeight = 24;
    const pointsRectangles = [];

    areaPoints.forEach((point) => {
      const { coords } = point;
      if (!coords) {
        return;
      }

      const pointInPixel = this.latLngToLayerPoint(coords);
      pointsRectangles.push(getRectangles(markerWidth, markerHeight, pointInPixel.x, pointInPixel.y));
    });

    const outline = getAreaOutline(pointsRectangles);
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

    // console.log('--- areas ---', this.areas);
    // console.log('--- areasLayer ---', this.areasLayer);
    // console.log('--- areasPaths ---', this.areasPathsLeafletElements);
    // console.log('--- markersLeafletElements ---', this.markersLeafletElements);
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
}

export default MapAreas;
