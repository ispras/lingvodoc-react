import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, pure } from 'recompose';
import Immutable from 'immutable';
import { Container } from 'semantic-ui-react';
import Labels from 'components/Search/Labels';
import ResultsMap from 'components/Search/ResultsMap';
import IntersectionControl from 'components/Search/IntersectionControl';
import QueryBuilder from 'components/Search/QueryBuilder';
import LanguageTree from 'components/Search/LanguageTree';

const adder = i => v => v.add(`search_${i}`);

const results = require('./results.json').reduce(
  (ac, vals, i) => vals.reduce((iac, val) => iac.update(Immutable.fromJS(val), new Immutable.Set(), adder(i)), ac),
  new Immutable.Map()
);

const mdColors = new Immutable.List([
  '#E53935',
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#039BE5',
  '#00ACC1',
  '#00897B',
  '#43A047',
  '#7CB342',
  '#C0CA33',
  '#FDD835',
  '#FFB300',
  '#FB8C00',
  '#F4511E',
  '#6D4C41',
]).sortBy(Math.random);

const COLORS = Immutable.fromJS({
  search_0: mdColors.get(0),
  search_1: mdColors.get(1),
  search_2: mdColors.get(2),
  search_3: mdColors.get(3),
});

class Info extends React.PureComponent {
  constructor(props) {
    super(props);

    this.labels = this.labels.bind(this);
    this.clickLabel = this.clickLabel.bind(this);

    this.state = {
      actives: Immutable.fromJS({
        search_0: true,
        search_1: true,
        search_2: true,
        search_3: true,
      }),
      intersec: 0,
    };
  }

  labels() {
    return COLORS.map((color, text) => ({ text, color, isActive: this.state.actives.get(text) }))
      .valueSeq()
      .toJS();
  }

  clickLabel(name) {
    this.setState({
      actives: this.state.actives.update(name, v => !v),
    });
  }

  render() {
    const { query } = this.props;

    // remove empty strings
    const cleanQuery = query.map(q => q.filter(p => p.search_string.length > 0 && p.matching_type.length > 0));

    return (
      <Container>
        <h3>Поиск</h3>
        <QueryBuilder />
        {cleanQuery.length > 0 && <LanguageTree query={cleanQuery} />}
        <Labels data={this.labels()} onClick={this.clickLabel} />
        <IntersectionControl
          max={this.state.actives.filter(f => f).size}
          value={this.state.intersec}
          onChange={e => this.setState({ intersec: e.target.value })}
        />
        <ResultsMap data={results} colors={COLORS} actives={this.state.actives} intersect={this.state.intersec} />
      </Container>
    );
  }
}

Info.propTypes = {
  query: PropTypes.array.isRequired,
};

export default compose(
  connect(state => state.search),
  pure,
)(Info);
