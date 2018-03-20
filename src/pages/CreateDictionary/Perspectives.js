import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS } from 'immutable';
import { Header, Segment } from 'semantic-ui-react';
import Translations from 'components/Translation';
import Fields from './Fields';

const Perspective = (props) => {
  const { perspective, perspectives, mode } = props;
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

      {mode === 'dictionary' && (
        <Segment>
          <Header>Fields</Header>
          <Fields perspective={perspective} perspectives={perspectives.toJS()} onChange={f => updateFields(f)} />
        </Segment>
      )}
    </Segment>
  );
};

Perspective.propTypes = {
  perspective: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  mode: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const Perspectives = (props) => {
  const { perspectives, mode } = props;
  function updatePerspective(perspective) {
    props.onChange(perspectives.set(perspectives.findIndex(p => p.get('index') === perspective.get('index')), perspective));
  }

  return (
    <div>
      {perspectives.map(p => (
        <Perspective
          key={p.get('index')}
          perspective={p}
          perspectives={perspectives}
          onChange={np => updatePerspective(np)}
          mode={mode}
        />
      ))}
    </div>
  );
};

Perspectives.propTypes = {
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  onChange: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,  
};

export default Perspectives;
