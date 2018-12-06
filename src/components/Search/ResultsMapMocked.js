import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import styled from 'styled-components';
import { Button, Segment } from 'semantic-ui-react';

import Leaflet from 'components/Map/MapAreas';
import { openBlobsModal } from 'ducks/blobs';

const Wrapper = styled.div`
  width: 100%;
  height: 600px;
  border: 1px solid grey;
  border-radius: 2px;

  .leaflet {
    width: 100%;
    height: 100%;

    .point {
      display: flex;
      flex-direction: column;
      height: 2em !important;
      width: 2em !important;
      border-radius: 2px;
      border: 1px solid black;

      span {
        flex: 1 1 auto;

        &:not(:last-child) {
          border-bottom: 1px solid black;
        }
      }
    }
  }
`;

function pointIcon({ colors }) {
  const html = colors.map(c => `<span style="background-color: ${c};"></span>`).join('');
  return {
    className: 'point',
    html,
  };
}

function extractPoints({ data, meta, intersect }) {
  const labels = meta
    .filter(v => v.get('isActive'))
    .keySeq()
    .toSet();

  return data
    .map(searches => searches.intersect(labels))
    .filter(searches => searches.size > intersect)
    .map((searches, dictionary) => {
      const location = dictionary.getIn(['additional_metadata', 'location']);
      return {
        coords: [parseFloat(location.get('lat')), parseFloat(location.get('lng'))],
        colors: searches
          .map(id => meta.getIn([id, 'color']))
          .sort()
          .toJS(),
        values: searches.toJS(),
        dictionary,
      };
    })
    .valueSeq()
    .toJS();
}

const data = [
  {
    name: 'Search 1',
    colors: ['#5E35B1'],
    markers: [
      {
        coords: [51.34605424944661, 93.7847900390625],
      },
      {
        coords: [70.7403390289637, 136.2054491043091],
      },
      {
        coords: [62.8818649, 117.4730521],
      },
    ],
  },
  {
    name: 'Search 2',
    colors: ['#C0CA33'],
    markers: [
      {
        coords: [62.18657453545535, 133.22828292846683],
      },
      {
        coords: [62.18585366149508, 133.2262229919434],
      },
      {
        coords: [63.740255621885964, 121.61834716389423],
      },
    ],
  },
];

const areas = ['Search 1', 'Search 2'];

// const data2 = [
//   {
//     name: 'Search 2',
//     colors: ['#C0CA33'],
//     markers: [
//       {
//         coords: [51.34605424944661, 93.7847900390625],
//       },
//       {
//         coords: [70.7403390289637, 136.2054491043091],
//       },
//       {
//         coords: [62.8818649, 117.4730521],
//       },
//       {
//         coords: [63.740255621885964, 121.61834716389423],
//       },
//     ],
//   },
// ];

// const areas2 = ['Search 2'];

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.onPointClick = this.onPointClick.bind(this);
    this.showAreas = this.showAreas.bind(this);
    this.hideAreas = this.hideAreas.bind(this);
  }

  componentDidMount() {
    this.leaflet = new Leaflet(this.map, {
      icon: pointIcon,
      onPointClick: this.onPointClick,
    });
    // this.leaflet.load(extractPoints(this.props));
    this.leaflet.load(data, areas);
  }

  // componentWillReceiveProps(nextProps) {
  //   this.leaflet.reset();
  //   this.leaflet.load(extractPoints(nextProps));
  // }

  shouldComponentUpdate() {
    return true;
  }

  onPointClick({ dictionary }) {
    const { actions } = this.props;
    const blobs = dictionary.getIn(['additional_metadata', 'blobs']);
    actions.openBlobsModal(dictionary.toJS(), blobs ? blobs.toJS() : []);
  }

  showAreas() {
    this.leaflet.showAreas();
  }

  hideAreas() {
    this.leaflet.hideAreas();
  }

  render() {
    const { areasMode, areaGroups } = this.props;
    console.log(areaGroups);
    return (
      <Segment>
        <Wrapper>
          <div
            ref={(ref) => {
              this.map = ref;
            }}
            className="leaflet"
          />
        </Wrapper>
      </Segment>
    );
  }
}

Map.propTypes = {
  data: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  intersect: PropTypes.number.isRequired,
  areasMode: PropTypes.bool.isRequired,
  areaGroups: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
};

export default compose(connect(null, dispatch => ({
  actions: bindActionCreators({ openBlobsModal }, dispatch),
})))(Map);
