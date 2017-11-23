import React from 'react';
import { pure, withReducer } from 'recompose';
import { OrderedMap, Map, Set, fromJS, is } from 'immutable';

import { Button, Step } from 'semantic-ui-react';

import Linker from './Linker';

const blobs = fromJS(require('./blobs.json')).map(v => v.set('values', new Map()));

const linking = new OrderedMap();
const spreads = new Map();

const initial = new Map({
  step: 'LINKING',
  blobs,
  linking,
  spreads,
});

function replaceSelect(state, payload) {
  const id = fromJS(payload);
  const blob = state.get('blobs').find(x => is(x.get('id'), id));
  return state.set('linking', new OrderedMap([[id, blob]]));
}

function addBlobSelect(state, payload) {
  const id = fromJS(payload);
  const blob = state.get('blobs').find(x => is(x.get('id'), id));
  return state.setIn(['linking', id], blob);
}

function setColumn(state, { id, column, value }) {
  let subState = state;

  if (value && value.includes('/')) {
    subState = addBlobSelect(state, value.split('/').map(x => parseInt(x, 10)));
  }
  return subState.setIn(['linking', id, 'values', column], value);
}

function updateSingleSpread(result, blob) {
  const spreadColumns = blob
    .get('values')
    .filter(value => value === 'spread')
    .keySeq()
    .map(column => new Map({
      from: blob.get('id'),
      column,
    }));
  const spreadTo = blob
    .get('values')
    .filter(value => value && value.includes('/'))
    .valueSeq()
    .map(value => fromJS([
      parseInt(value.split('/')[0], 10),
      parseInt(value.split('/')[1], 10),
    ]));

  return result.withMutations((map) => {
    spreadTo.forEach((id) => {
      if (!map.get(id, false)) {
        map.set(id, new Set());
      }
      map.update(
        id,
        v => v.withMutations(set => spreadColumns.forEach(col => set.add(col)))
      );
    });
  });
}

function cleanLinking(state, linkedTo) {
  const first = state.get('linking').first();

  return state.update(
    'linking',
    v => v.filter((blob, id) => is(blob, first) || linkedTo.includes(id))
  );
}

function updateSpread(state) {
  const extractedSpreads = state.get('linking').reduce(
    (acc, blob) => updateSingleSpread(acc, blob),
    new Map()
  );

  return cleanLinking(
    state.set('spreads', extractedSpreads),
    extractedSpreads.keySeq().toSet()
  );
}

const reducer = (state, { type, payload }) => {
  let newState = state;
  switch (type) {
    case 'LINKING/SELECT':
      newState = replaceSelect(state, payload);
      break;
    case 'LINKING/SET_COLUMN':
      newState = setColumn(state, payload);
      break;
    default:
      newState = state;
  }

  return updateSpread(newState);
};

class Info extends React.Component {
  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onUpdateColumn = this.onUpdateColumn.bind(this);
    this.renderStep = this.renderStep.bind(this);
  }

  onSelect(payload) {
    this.props.dispatch({ type: 'LINKING/SELECT', payload });
  }

  onUpdateColumn(id) {
    return (column, value, oldValue) =>
      this.props.dispatch({
        type: 'LINKING/SET_COLUMN',
        payload: {
          id, column, value, oldValue,
        },
      });
  }

  renderStep() {
    const { state } = this.props;
    const step = state.get('step');

    switch (step) {
      case 'LINKING':
        return (
          <Linker
            blobs={state.get('blobs')}
            state={state.get('linking')}
            spreads={state.get('spreads')}
            onSelect={this.onSelect}
            onUpdateColumn={this.onUpdateColumn}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { state } = this.props;
    const step = state.get('step');

    return (
      <div>
        <Step.Group widths={3}>
          <Step active={step === 'LINKING'}>
            <Step.Content>
              <Step.Title>Linking</Step.Title>
              <Step.Description>Link columns from files with each other</Step.Description>
            </Step.Content>
          </Step>

          <Step active={step === 'COLUMNS'}>
            <Step.Content>
              <Step.Title>Columns Mapping</Step.Title>
              <Step.Description>Map linked columns to LingvoDoc types</Step.Description>
            </Step.Content>
          </Step>

          <Step active={step === 'LANGUAGES'}>
            <Step.Content>
              <Step.Title>Language Selection</Step.Title>
              <Step.Description>Map dictionaries to LingvoDoc languages</Step.Description>
            </Step.Content>
          </Step>
        </Step.Group>

        <div style={{ minHeight: '400px' }}>
          {this.renderStep()}
        </div>

        <Button fluid inverted color="blue">Next Step</Button>
      </div>
    );
  }
}

export default withReducer('state', 'dispatch', reducer, initial)(Info);
