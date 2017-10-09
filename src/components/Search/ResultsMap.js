import React from 'react';
import styled from 'styled-components';

import Leaflet from 'components/Map';

const Wrapper = styled.div`
  width: 100%;
  height: 600px;

  .leaflet {
    width: 100%;
    height: 100%;

    .point {
      display: flex;
      flex-direction: column;
      height: 2em !important;
      width: 2em !important;
      border-radius: 0.2em;
      border: 1px solid black;

      span {
        flex: 1 1 auto;
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

function extractPoints({ data, colors, actives, intersect }) {
  const labelSet = actives
    .filter(isActive => isActive)
    .keySeq()
    .toSet();
  return data
    .map(values => values.intersect(labelSet))
    .filter(values => values.size > intersect)
    .map((values, coords) => ({
      coords: [coords.get('lat'), coords.get('lng')],
      colors: values.map(v => colors.get(v)).sort().toJS(),
      values: values.toJS(),
    }))
    .valueSeq()
    .toJS();
}

class Map extends React.Component {
  componentDidMount() {
    this.leaflet = new Leaflet(this.map, {
      icon: pointIcon,
      onPointClick: console.log.bind(console)
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

  render() {
    return (
      <Wrapper>
        <div ref={ref => this.map = ref} className="leaflet" />
      </Wrapper>
    );
  }
}

export default Map;
