import 'leaflet/dist/leaflet.css';
// import 'styles/cameramap.scss'
import L from 'leaflet';
// import chroma from 'chroma-js';

function initMap(mountPoint) {
  const map = L.map(mountPoint, {}).setView([61.32, 60.82], 4);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // L.tileLayer('http://vec{s}.maps.yandex.net/tiles?l=map&z={z}&x={x}&y={y}&scale=1', {
  //   subdomains: ['01', '02', '03', '04'],
  //   attribution: '<a http="yandex.ru" target="_blank">Яндекс</a>',
  //   reuseTiles: true,
  //   updateWhenIdle: false,
  // }).addTo(map);

  return map;
}

function wrapDivIcon(func) {
  return options => L.divIcon(func(options));
}

class Map {
  constructor(mountPoint, options) {
    this.options = options;
    this.map = initMap(mountPoint);
    this.points = [];
    this.iconFunc = wrapDivIcon(options.icon);
  }

  addPoint(point) {
    const { coords } = point;
    const marker = L.marker(coords, { icon: this.iconFunc(point) })
      .addTo(this.map)
      .on('contextmenu', () => this.options.onPointClick(point))
      .on('click', () => this.options.onPointClick(point));
    this.points.push(marker);
  }

  load(data) {
    data.forEach(point => this.addPoint(point));
  }

  reset() {
    this.points.forEach(point => this.map.removeLayer(point));
    this.points = [];
  }

  destroy() {
    this.reset();
    this.map.remove();
  }
}

export default Map;
