import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import styled from 'styled-components';

import Leaflet from 'components/Map';
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

function extractPoints({
  data, colors, actives, intersect,
}) {
  const labelSet = actives
    .filter(isActive => isActive)
    .keySeq()
    .toSet();
  return data
    .map(values => values.intersect(labelSet))
    .filter(values => values.size > intersect)
    .map((values, dictionary) => {
      const location = dictionary.getIn(['additional_metadata', 'location']);

      return {
        coords: [location.get('lat'), location.get('lng')],
        colors: values
          .map(v => colors.get(v))
          .sort()
          .toJS(),
        values: values.toJS(),
        dictionary,
      };
    })
    .valueSeq()
    .toJS();
}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.onPointClick = this.onPointClick.bind(this);
  }

  componentDidMount() {
    this.leaflet = new Leaflet(this.map, {
      icon: pointIcon,
      onPointClick: this.onPointClick,
    });
    this.leaflet.load(extractPoints(this.props));
  }

  componentWillReceiveProps(nextProps) {
    this.leaflet.reset();
    this.leaflet.load(extractPoints(nextProps));
  }

  shouldComponentUpdate() {
    return true;
  }

  onPointClick({ dictionary }) {
    const { actions } = this.props;
    const blobs = dictionary.getIn(['additional_metadata', 'blobs']);
    // FIXME: backend returns empty list instead of null sometimes.
    if (blobs && blobs.length > 0) {
      actions.openBlobsModal(blobs.toJS());
    }
  }

  render() {
    return (
      <Wrapper>
        <div
          ref={(ref) => {
            this.map = ref;
          }}
          className="leaflet"
        />
      </Wrapper>
    );
  }
}

export default compose(connect(null, dispatch => ({
  actions: bindActionCreators({ openBlobsModal }, dispatch),
})))(Map);
