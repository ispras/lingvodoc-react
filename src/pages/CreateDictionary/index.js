import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
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
import { query as dashboardQuery } from 'pages/Dashboard';

class CreateDictionaryWizard extends React.Component {
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
      mode, parentLanguage, translations, perspectives: p, createDictionary,
    } = this.props;
    const parentId = parentLanguage.id;
    const dictionaryTranslations = translations
      .map(t => ({ locale_id: t.get('localeId'), content: t.get('content') }))
      .toJS();
    const perspectives = p
      .map(ps => ({
        fake_id: ps.get('index'),
        translation_atoms: ps
          .get('translations')
          .map(t => ({ locale_id: t.get('localeId'), content: t.get('content') })),
        fields: ps
          .get('fields')
          .map(f => ({
            fake_id: f.get('id'),
            self_id: f.get('self_id'),
            link_id: f.get('link_id'),
            field_id: f.get('field_id'),
          })),
      }))
      .toJS();

    createDictionary({
      variables: {
        category: mode == 'dictionary' ? 0 : 1,
        parentId,
        dictionaryTranslations,
        perspectives,
      },
      refetchQueries: [
        {
          query: dashboardQuery,
          variables: {
            mode: mode == 'dictionary' ? 0 : 1,
            category: 0,
          },
        },
      ],
    }).then(() => this.props.goToStep('FINISH'));
  }

  selectParent(parent) {
    this.props.setParentLanguage(parent);
  }

  render() {
    const {
      step, isNextStep, parentLanguage, translations, perspectives, mode,
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
              <Step.Title>{mode.replace(/^\w/, c => c.toUpperCase())} names</Step.Title>
              <Step.Description>Set {mode} name and its translations</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'PERSPECTIVES'} onClick={this.onStepClick('PERSPECTIVES')}>
            <Step.Content>
              <Step.Title>Perspectives</Step.Title>
              <Step.Description>Create one or more perspectives</Step.Description>
            </Step.Content>
          </Step>

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
              <Languages expanded={false} selected={parentLanguage} onSelect={this.selectParent} />
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
              <Header>Add one or more perspectives</Header>
              <Perspectives perspectives={perspectives} onChange={p => this.props.setPerspectives(p)} mode={mode} />
              <Button fluid positive onClick={this.props.createPerspective}>
                Add perspective
              </Button>
            </div>
          )}

          {step === 'FINISH' && (
            <Message>
              <Message.Header>{mode.replace(/^\w/, c => c.toUpperCase())} created</Message.Header>
              <Message.Content>Your {mode} is created, click here to view.</Message.Content>
            </Message>
          )}
        </div>
        <Divider />
        {isNextStep &&
          step === 'PERSPECTIVES' && (
            <Button fluid inverted color="red" onClick={this.onCreateDictionary}>
              Create
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

CreateDictionaryWizard.propTypes = {
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
  mode: PropTypes.string.isRequired,
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

export const CreateDictionary = compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(createDictionaryMutation, { name: 'createDictionary' }),
  withProps(() => ({ mode: 'dictionary' })),
)(CreateDictionaryWizard);


export const CreateCorpus = compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(createDictionaryMutation, { name: 'createDictionary' }),
  withProps(() => ({ mode: 'corpus' })),
)(CreateDictionaryWizard);
