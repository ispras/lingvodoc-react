import React, { PureComponent } from 'react';
import { Segment } from 'semantic-ui-react';
import 'leaflet/dist/leaflet.css';
import L, { point } from 'leaflet';
import initializeContextMenu from '../../components/MapAreas/leaflet.contextmenu';
import '../../components/MapAreas/leaflet.contextmenu.scss';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
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


class MapAreas extends PureComponent {
  constructor(props) {
    super();
    initializeContextMenu(L);

    this.map = null;
    this.coors = []
    this.state = {
      point: []
    }
  }
  componentDidMount() {
    this.map = initMap(this.mapContainer);
  }




  render() {
    const allDicts = () => {
      const { data: { dictionaries: allDictionary, loading } } = this.props
      if (!loading) {
        allDictionary.map(dict => {
          if (dict.additional_metadata.location) {
            const coorX=Math.trunc(+dict.additional_metadata.location.lng)
            const coorY = Math.trunc(+dict.additional_metadata.location.lat )
            this.coors.push({ x: coorX, y: coorY})
          }
        }
        )
        this.setState({point:this.coors})
      }
    }

    console.log(this.state.point)

    return (
      <Segment>
        <div className="leaflet">
          <button onClick={allDicts}> загрузить точки</button>
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