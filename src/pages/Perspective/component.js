import React from 'react';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { Container, Menu, Dropdown, Icon } from 'semantic-ui-react';

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

const Filter = () =>
  <div className="ui right aligned category search item">
    <div className="ui transparent icon input">
      <input className="prompt" type="text" placeholder="Filter" />
      <i className="search link icon" />
    </div>
  </div>;

const ModeSelector = ({ mode, baseUrl }) =>
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

    <Menu.Menu position='right'>
      <Filter />
    </Menu.Menu>
  </Menu>;

const Perspective = ({ match, perspective, storage }) => {
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
      <h4>{baseUrl} {perspective.loading && <Icon loading name="spinner" />}</h4>
      <ModeSelector
        mode={mode}
        baseUrl={baseUrl}
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
                  storage={storage}
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
};

export default onlyUpdateForKeys(['match', 'perspective'])(Perspective);
