import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Immutable, { fromJS } from 'immutable';
import { gql, graphql } from 'react-apollo';
import { Message, Button, Step, Header, Segment } from 'semantic-ui-react';
import Languages from 'components/Languages';
import Translations from 'components/Translation';
import Fields from './Fields';

const Perspective = (props) => {
  const { perspective, perspectives } = props;
  const translations = perspective.get('translations').toJS();

  function updateTranslations(updatedTranslations) {
    props.onChange(perspective.set('translations', fromJS(updatedTranslations)));
  }

  function updateFields(updatedFields) {
    props.onChange(perspective.set('fields', fromJS(updatedFields)));
  }

  return (
    <Segment>
      <Header>Perspective {perspective.get('index') + 1}</Header>
      <Segment>
        <Header>Perspective names</Header>
        <Translations translations={translations} onChange={u => updateTranslations(u)} />
      </Segment>

      {/* <Segment>
        <Header>Fields</Header>
        <Fields perspective={perspective} perspectives={perspectives} onChange={f => updateFields(f)} />
      </Segment> */}
    </Segment>
  );
};

Perspective.propTypes = {
  perspective: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  onChange: PropTypes.func.isRequired,
};

const Perspectives = (props) => {
  const { perspectives } = props;
  function updatePerspective(perspective) {
    props.onChange(perspectives.set(perspectives.findIndex(p => p.get('index') === perspective.get('index')), perspective));
  }

  return (
    <div>
      {perspectives.map(p => (
        <Perspective key={p.get('index')} perspective={p} perspectives={perspectives} onChange={np => updatePerspective(np)} />
      ))}
    </div>
  );
};

Perspectives.propTypes = {
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Perspectives;
