import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import MapAreas from 'components/MapAreas/index';
import { openBlobsModal } from 'ducks/blobs';

function pointIcon({ colors }) {
  const html = colors.map(c => `<span style="background-color: ${c};"></span>`).join('');
  return {
    className: 'point',
    html,
  };
}

class ResultsMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onPointClick = this.onPointClick.bind(this);
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
    const {
      data, meta, intersect, areaGroups, areasMode, markersHandlers,
    } = this.props;

    const points = this.getExtractedPoints(data, meta, intersect);
    const markersGroups = meta;
    let resultAreaGroups = areaGroups;

    if (!areasMode) {
      resultAreaGroups = [];
    }
    return (
      <MapAreas
        pointIcon={pointIcon}
        onPointClick={this.onPointClick}
        points={points}
        areas={resultAreaGroups}
        areasMode={areasMode}
        markersGroups={markersGroups}
        markersHandlers={markersHandlers}
      />
    );
  }
}

ResultsMap.propTypes = {
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
})))(ResultsMap);

