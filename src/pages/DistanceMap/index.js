import React, { PureComponent } from 'react';
import { Segment } from 'semantic-ui-react';
import 'leaflet/dist/leaflet.css';
import L, { point, Point } from 'leaflet';
import initializeContextMenu from '../../components/MapAreas/leaflet.contextmenu';
import '../../components/MapAreas/leaflet.contextmenu.scss';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Immutable, { fromJS } from 'immutable';
import getAreaOutline from '../../components/MapAreas/areas'
const dicrionary = gql`query dict { 
  dictionaries(published: true) {
  id
  parent_id
  translation
  additional_metadata {
    blobs
    location
  }
}
}`


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
  console.log('4654', colors)
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
    this.areasPathsLeafletElements = {}
    this.iconFunc = wrapDivIcon(pointIcon);
    this.map = null;
    this.coors = []
    this.state = {
      arrPoint: null,
      test: [], 
      outline: null,
      color:'#5E35B1'
    }
  }
  componentDidMount() {
    this.map = initMap(this.mapContainer);
    this.areasLayer = L.svg({ padding: 0 }).addTo(this.map);

  }
  componentDidUpdate() {
    this.checkArea()
  }

  latLngToLayerPoint(coords) {
    return this.map.latLngToLayerPoint(coords);
  }
  getAreaPath(areaId) {
    const areaPath = L.SVG.create('path');
    this.areasPathsLeafletElements[areaId] = areaPath;
    this.areasLayer._container.appendChild(areaPath);

    return areaPath;
  }
  removeAreasFromMap() {
    Object.values(this.areasPathsLeafletElements)
      .forEach((path) => {
        path.parentNode.removeChild(path);
      });

    this.areasPathsLeafletElements = {};
  }
  checkArea() {
    this.map.on('zoomstart', () => {
      console.log('zoomstart')
      this.removeAreasFromMap()
      this.updateAreaPath(1, this.state.outline, this.state.color);
    });
    this.map.on('zoomend', () => {
      console.log('zoomend')
      this.removeAreasFromMap()
      this.updateAreaPath(1, this.state.outline, this.state.color);
    });

  }
  updateAreaPath(areaId, outline, color) {
    const path = this.getAreaPath(areaId);
    path.setAttribute('fill', color);
    path.setAttribute('opacity', 0.5);
    path.setAttribute('stroke', 'black');
    path.setAttribute('d', outline);
  }
  render() {

    const { data: { dictionaries: allDictionary, loading } } = this.props
    const allDicts = () => {
      if (!loading) {
        const searchResults = Immutable.fromJS(allDictionary)
        const resultsCount = searchResults.filter(d => (d.getIn(['additional_metadata', 'location']) !== null));

        const test = resultsCount.map((searches, dictionary) => {
          const location = searches.getIn(['additional_metadata', 'location']);
          return {
            coords: [parseFloat(location.get('lat')), parseFloat(location.get('lng'))],
            colors: "#5E35B1",
            values: [dictionary],
            dictionary: searches,
          };

        }).toJS()

        const pointsInPixel = test.map(point => this.latLngToLayerPoint(point.coords));
        test.forEach(point => { L.marker(point.coords, { icon: this.iconFunc(point.colors) }).addTo(this.map) })
        const outline = getAreaOutline(pointsInPixel, 24, 24)
        this.setState({ outline: outline })
        this.updateAreaPath(1, outline, this.state.color);
      }
    }
    return (
      <Segment>
        <div className="leaflet">
          <button onClick={allDicts} > загрузить точки</button>
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


export default graphql(dicrionary)(MapAreas) 