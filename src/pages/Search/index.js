import React from 'react';
import Immutable from 'immutable';
import { Container } from 'semantic-ui-react';

import Labels from 'components/Search/Labels';
import ResultsMap from 'components/Search/ResultsMap';
import IntersectionControl from 'components/Search/IntersectionControl';
import QueryBuilder from 'components/Search/QueryBuilder';
import LanguageTree from 'components/Search/LanguageTree';
import { buildLanguageTree, buildSearchResultsTree } from './treeBuilder';

const adder = i => v => v.add(`search_${i}`);

const data = require('./results.json').reduce(
  (ac, vals, i) =>
    vals.reduce(
      (iac, val) => iac.update(Immutable.fromJS(val), new Immutable.Set(), adder(i)),
      ac
    ),
  new Immutable.Map()
);

const searchResults = Immutable.fromJS(require('./search_results.json').data.advanced_search);
const languages = Immutable.fromJS(require('./languages.json').data.language_tree);

export const languagesTree = buildLanguageTree(languages);
const searchResultsTree = buildSearchResultsTree(searchResults, languagesTree);

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

const searchStrings = [
  [
    { search_string: 'бабушка', matching_type: 'full_string' },
  ],
];

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
    return COLORS
      .map((color, text) => ({ text, color, isActive: this.state.actives.get(text) }))
      .valueSeq()
      .toJS();
  }

  clickLabel(name) {
    this.setState({
      actives: this.state.actives.update(name, v => !v),
    });
  }

  render() {
    return (
      <Container>
        <h3>Поиск</h3>
        <QueryBuilder data={searchStrings} />
        <LanguageTree data={searchResultsTree} />
        <Labels
          data={this.labels()}
          onClick={this.clickLabel}
        />
        <IntersectionControl
          max={this.state.actives.filter(f => f).size}
          value={this.state.intersec}
          onChange={e => this.setState({ intersec: e.target.value })}
        />
        <ResultsMap
          data={data}
          colors={COLORS}
          actives={this.state.actives}
          intersect={this.state.intersec}
        />
      </Container>
    );
  }
}

export default Info;
