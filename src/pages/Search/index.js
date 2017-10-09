import React from 'react';
import Immutable from 'immutable';
import { pure } from 'recompose';
import { Container } from 'semantic-ui-react';

import Labels from 'components/Search/Labels';
import ResultsMap from 'components/Search/ResultsMap';
import IntersectionControl from 'components/Search/IntersectionControl';

const adder = i => v => v.add(`search_${i}`);

const data = require('./results.json').reduce(
  (ac, vals, i) =>
    vals.reduce(
      (iac, val) => iac.update(Immutable.fromJS(val), new Immutable.Set(), adder(i)),
      ac
    ),
  new Immutable.Map()
);

const COLORS = Immutable.fromJS({
  search_0: '#D32F2F',
  search_1: '#512DA8',
  search_2: '#0097A7',
  search_3: '#F57C00',
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
    return COLORS
      .map((color, text) => ({ text, color, isActive: this.state.actives.get(text) }))
      .valueSeq()
      .toJS();
  }

  clickLabel(name) {
    this.setState({
      actives: this.state.actives.update(name, v => !v)
    });
  }

  render() {
    return (
      <Container>
        <h3>Поиск</h3>
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
