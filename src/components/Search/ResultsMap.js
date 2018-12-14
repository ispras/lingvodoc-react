import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import styled from 'styled-components';
import { Segment } from 'semantic-ui-react';

import Leaflet from 'components/MapAreas';
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

class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onPointClick = this.onPointClick.bind(this);
  }

  componentDidMount() {
    const {
      data, meta, intersect, areaGroups, areasMode, markersHandlers,
    } = this.props;

    this.leaflet = new Leaflet(this.map, {
      icon: pointIcon,
      onPointClick: this.onPointClick,
    }, markersHandlers);

    const points = this.getExtractedPoints(data, meta, intersect);
    const markersGroups = meta;
    let resultAreaGroups = areaGroups;

    if (!areasMode) {
      resultAreaGroups = [];
    }

    this.leaflet.load(points, resultAreaGroups, areasMode, markersGroups);
  }

  componentWillReceiveProps(nextProps) {
    const {
      data, meta, intersect, areaGroups, areasMode,
    } = nextProps;

    const points = this.getExtractedPoints(data, meta, intersect);
    const markersGroups = meta;
    let resultAreaGroups = areaGroups;

    if (!areasMode) {
      resultAreaGroups = [];
    }

    this.leaflet.load(points, resultAreaGroups, areasMode, markersGroups);
  }

  onPointClick({ dictionary }) {
    const { actions } = this.props;
    const blobs = dictionary.getIn(['additional_metadata', 'blobs']);
    actions.openBlobsModal(dictionary.toJS(), blobs ? blobs.toJS() : []);
  }

  getExtractedPoints = (data, meta, intersect) => {
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
  };

  render() {
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
  markersHandlers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

export default compose(connect(null, dispatch => ({
  actions: bindActionCreators({ openBlobsModal }, dispatch),
})))(Map);
