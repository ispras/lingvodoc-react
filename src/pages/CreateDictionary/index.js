import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import Immutable from 'immutable';
import { Divider, Message, Button, Step, Header } from 'semantic-ui-react';
import {
  nextStep,
  goToStep,
  setParentLanguage,
  setTranslations,
  createPerspective,
  setPerspectives,
  selectors,
} from 'ducks/createDictionary';
import Languages from 'components/Languages';
import Translations from 'components/Translation';
import Perspectives from './Perspectives';
import { createDictionaryMutation } from './graphql';

class CreateLanguageWizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.onNextClick = this.onNextClick.bind(this);
    this.onStepClick = this.onStepClick.bind(this);
    this.selectParent = this.selectParent.bind(this);
    this.onCreateDictionary = this.onCreateDictionary.bind(this);
  }

  onNextClick() {
    this.props.nextStep();
  }

  onStepClick(name) {
    return () => this.props.goToStep(name);
  }

  onCreateDictionary() {
    const {
      parentLanguage, translations, perspectives: p, createDictionary,
    } = this.props;
    const parentId = parentLanguage.id;
    const dictionaryTranslations = translations
      .map(t => ({ locale_id: t.get('localeId'), content: t.get('content') }))
      .toJS();
    const perspectives = p
      .map(ps => ({
        translation_atoms: ps.get('translations').map(t => ({ locale_id: t.get('localeId'), content: t.get('content') })),
      }))
      .toJS();

    createDictionary({
      variables: {
        parentId,
        dictionaryTranslations,
        perspectives,
      },
    }).then(() => this.props.goToStep('FINISH'));
  }

  selectParent(parent) {
    this.props.setParentLanguage(parent);
  }

  render() {
    const {
      step, isNextStep, parentLanguage, translations, perspectives,
    } = this.props;
    return (
      <div>
        <Step.Group widths={4}>
          <Step link active={step === 'PARENT_LANGUAGE'} onClick={this.onStepClick('PARENT_LANGUAGE')}>
            <Step.Content>
              <Step.Title>Parent language</Step.Title>
              <Step.Description>Select language</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'TRANSLATIONS'} onClick={this.onStepClick('TRANSLATIONS')}>
            <Step.Content>
              <Step.Title>Dictionary names</Step.Title>
              <Step.Description>Set dictionary name and its translations</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'PERSPECTIVES'} onClick={this.onStepClick('PERSPECTIVES')}>
            <Step.Content>
              <Step.Title>Perspectives</Step.Title>
              <Step.Description>Create one or more perspectives</Step.Description>
            </Step.Content>
          </Step>

          {/* <Step link active={step === 'FIELDS'} onClick={this.onStepClick('FIELDS')}>
            <Step.Content>
              <Step.Title>Language Selection</Step.Title>
              <Step.Description>Map dictionaries to LingvoDoc languages</Step.Description>
            </Step.Content>
          </Step> */}

          <Step link active={step === 'FINISH'}>
            <Step.Content>
              <Step.Title>Finish</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>

        <div style={{ minHeight: '500px' }}>
          {step === 'PARENT_LANGUAGE' && (
            <div style={{ height: '400px' }}>
              {!parentLanguage && <Header>Please, select the parent language</Header>}
              {parentLanguage && (
                <Header>
                  You have selected: <b>{parentLanguage.translation}</b>
                </Header>
              )}
              <Languages onSelect={this.selectParent} />
            </div>
          )}
          {step === 'TRANSLATIONS' && (
            <div>
              <Header>Add one or more translations</Header>
              <Translations translations={translations.toJS()} onChange={t => this.props.setTranslations(t)} />
            </div>
          )}

          {step === 'PERSPECTIVES' && (
            <div>
              <Header>Add one or perspectve</Header>
              <Perspectives perspectives={perspectives} onChange={p => this.props.setPerspectives(p)} />
              <Button fluid positive onClick={this.props.createPerspective}>Add perspective</Button>
            </div>
          )}

          {/* {step === 'FIELDS' && <div />} */}
          {step === 'FINISH' && (
            <Message>
              <Message.Header>Dictionary created</Message.Header>
              <Message.Content>Your dictionary is created, click here to view.</Message.Content>
            </Message>
          )}
        </div>
        <Divider />
        {isNextStep && step === 'PERSPECTIVES' && (
          <Button fluid inverted color="red" onClick={this.onCreateDictionary}>
            Create dictionary
          </Button>
        )}
        {isNextStep &&
          (step !== 'PERSPECTIVES' && step !== 'FINISH') && (
            <Button fluid inverted color="blue" onClick={this.onNextClick}>
              Next Step
            </Button>
          )}
      </div>
    );
  }
}

CreateLanguageWizard.propTypes = {
  step: PropTypes.string.isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  translations: PropTypes.instanceOf(Immutable.List).isRequired,
  isNextStep: PropTypes.bool.isRequired,
  nextStep: PropTypes.func.isRequired,
  goToStep: PropTypes.func.isRequired,
  setParentLanguage: PropTypes.func.isRequired,
  setTranslations: PropTypes.func.isRequired,
  createPerspective: PropTypes.func.isRequired,
  setPerspectives: PropTypes.func.isRequired,
  createDictionary: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    step: selectors.getStep(state),
    isNextStep: selectors.getNextStep(state),
    parentLanguage: selectors.getParentLanguage(state),
    translations: selectors.getTranslations(state),
    perspectives: selectors.getPerspectives(state),
  };
}

const mapDispatchToProps = {
  nextStep,
  goToStep,
  setParentLanguage,
  setTranslations,
  createPerspective,
  setPerspectives,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(createDictionaryMutation, { name: 'createDictionary' })
)(CreateLanguageWizard);
