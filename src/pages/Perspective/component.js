import React from 'react';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys, withHandlers, withState, compose } from 'recompose';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { Container, Menu, Dropdown } from 'semantic-ui-react';

import PerspectiveView from 'components/PerspectiveView';
import NotFound from 'pages/NotFound';

import './style.scss';

const MODES = {
  edit: {
    text: 'Edit',
    component: PerspectiveView,
  },
  publish: {
    text: 'Publish',
    component: PerspectiveView,
  },
  view: {
    text: 'View published',
    component: PerspectiveView,
  },
  contributions: {
    text: 'View contributions',
    component() {
      return <h4>No contributions tab yet</h4>;
    },
  },
  merge: {
    text: 'Merge suggestions',
    component() {
      return <h4>No merge tab yet</h4>;
    },
  },
};

const TOOLS = {
  phonology: {
    text: 'Phonology',
  },
  statistics: {
    text: 'Statistics',
  },
};

const handlers = compose(
  withState('value', 'updateValue', ''),
  withHandlers({
    onChange(props) {
      return event => props.updateValue(event.target.value);
    },
    onSubmit(props) {
      return (event) => {
        event.preventDefault();
        props.submitFilter(props.value);
      };
    },
  })
);

const Filter = handlers(({ value, onChange, onSubmit }) =>
  <div className="ui right aligned category search item">
    <form className="ui transparent icon input" onSubmit={onSubmit}>
      <input type="text" placeholder="Filter" value={value} onChange={onChange} />
      <button type="submit">
        <i className="search link icon" />
      </button>
    </form>
  </div>
);

const ModeSelector = onlyUpdateForKeys(['mode', 'baseUrl'])(({ mode, baseUrl, submitFilter }) =>
  <Menu tabular>
    {
      map(MODES, (info, stub) =>
        <Menu.Item key={stub} as={Link} to={`${baseUrl}/${stub}`} active={mode === stub}>
          {info.text}
        </Menu.Item>
      )
    }
    <Dropdown item text="Tools">
      <Dropdown.Menu>
        {
          map(TOOLS, (info, stub) =>
            <Dropdown.Item key={stub}>
              {info.text}
            </Dropdown.Item>
          )
        }
      </Dropdown.Menu>
    </Dropdown>

    <Menu.Menu position="right">
      <Filter submitFilter={submitFilter}/>
    </Menu.Menu>
  </Menu>);

const Perspective = onlyUpdateForKeys(['match', 'perspective'])(({ match, perspective, submitFilter }) => {
  const {
    cid,
    oid,
    pcid,
    poid,
    mode,
  } = match.params;
  const baseUrl = `/dictionary/${pcid}/${poid}/perspective/${cid}/${oid}`;

  return (
    <Container fluid className="perspective">
      <h4>{baseUrl}</h4>
      <ModeSelector
        mode={mode}
        baseUrl={baseUrl}
        submitFilter={submitFilter}
      />
      <Switch>
        <Redirect exact from={baseUrl} to={`${baseUrl}/view`} />
        {
          map(MODES, (info, stub) =>
            <Route
              key={stub}
              path={`${baseUrl}/${stub}`}
              render={() =>
                <info.component
                  {...perspective}
                  className="content"
                  mode={mode}
                />
              }
            />
          )
        }
        <Route component={NotFound} />
      </Switch>
    </Container>
  );
});

export default Perspective;
