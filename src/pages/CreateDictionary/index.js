import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { gql, graphql } from 'react-apollo';
import { Message, Button, Step, Header } from 'semantic-ui-react';
import { nextStep, goToStep, setParentLanguage, selectors } from 'ducks/createDictionary';
import Languages from 'components/Languages';

class CreateLanguageWizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.onNextClick = this.onNextClick.bind(this);
    this.onStepClick = this.onStepClick.bind(this);
    this.selectParent = this.selectParent.bind(this);
  }

  onNextClick() {
    this.props.nextStep();
  }

  onStepClick(name) {
    return () => this.props.goToStep(name);
  }

  selectParent(parent) {
    this.props.setParentLanguage(parent);
  }

  render() {
    const { step, isNextStep, parentLanguage } = this.props;
    return (
      <div>
        <Step.Group widths={5}>
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

          <Step link active={step === 'FIELDS'} onClick={this.onStepClick('FIELDS')}>
            <Step.Content>
              <Step.Title>Language Selection</Step.Title>
              <Step.Description>Map dictionaries to LingvoDoc languages</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'FINISH'}>
            <Step.Content>
              <Step.Title>Finish</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>

        <div style={{ minHeight: '500px'}}>
          {step === 'PARENT_LANGUAGE' && (
            <div style={{ height: '400px' }}>
              {!parentLanguage && <Header>Please, select the parent language</Header>}
              {parentLanguage && <Header>You have selected: <b>{parentLanguage.translation}</b> </Header>}
              <Languages onSelect={this.selectParent} />
            </div>
          )}
          {step === 'TRANSLATIONS' && <div />}
          {step === 'FIELDS' && <div />}
          {step === 'FINISH' && (
            <Message>
              <Message.Header>Dictionary created</Message.Header>
              <Message.Content>Your dictionary is created, click here to view.</Message.Content>
            </Message>
          )}
        </div>
        {step === 'FIELDS' && (
          <Button fluid inverted color="blue" onClick={this.onSubmit}>
            Create dictionary
          </Button>
        )}
        {isNextStep &&
          (step !== 'FIELDS' && step !== 'FINISH') && (
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
  isNextStep: PropTypes.bool.isRequired,
  nextStep: PropTypes.func.isRequired,
  goToStep: PropTypes.func.isRequired,
  setParentLanguage: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    step: selectors.getStep(state),
    isNextStep: selectors.getNextStep(state),
    parentLanguage: selectors.getParentLanguage(state),
  };
}

const mapDispatchToProps = {
  nextStep,
  goToStep,
  setParentLanguage,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(CreateLanguageWizard);
