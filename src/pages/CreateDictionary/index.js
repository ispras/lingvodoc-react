import React, { useContext, useState } from "react";
import { connect, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Divider, Header, Message, Segment, Step } from "semantic-ui-react";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose, withProps } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import EditCorpusMetadata from "components/EditCorpusMetadata";
import EditDictionaryMetadata from "components/EditDictionaryMetadata";
import Languages from "components/Languages";
import Translations from "components/Translation";
import {
  createPerspective,
  goToStep,
  nextStep,
  selectors,
  setMetadata,
  setParentLanguage,
  setPerspectives,
  setTranslations
} from "ducks/createDictionary";
import TranslationContext from "Layout/TranslationContext";
import { query as dashboardQuery } from "pages/Dashboard";

import { createDictionaryMutation } from "./graphql";
import Perspectives from "./Perspectives";

const TabParentLanguage = ({ onSelect }) => {
  const parentLanguage = useSelector(selectors.getParentLanguage);
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="inverted" style={{ height: "550px" }}>
      {!parentLanguage && <Header className="inverted">{getTranslation("Please, select the parent language")}</Header>}
      {parentLanguage && (
        <Header className="inverted">
          {getTranslation("You have selected:")} <b>{T(parentLanguage.translations)}</b>
        </Header>
      )}
      <Languages expanded={false} selected={parentLanguage} onSelect={onSelect} />
    </div>
  );
};

const TabTranslations = ({ setTranslations, setMetadata, mode }) => {
  const translations = useSelector(selectors.getTranslations);
  const metadata = useSelector(selectors.getMetadata);
  const getTranslation = useContext(TranslationContext);

  return (
    <div>
      <Header inverted>{getTranslation("Add one or more translations")}</Header>
      <Segment>
        <Translations translations={translations.toJS()} onChange={setTranslations} />
      </Segment>
      <Divider />
      <Header inverted>{getTranslation("Fill metadata information")}</Header>
      {mode === "dictionary" && (
        <EditDictionaryMetadata mode="create" metadata={metadata ? metadata.toJS() : metadata} onChange={setMetadata} />
      )}
      {mode === "corpus" && (
        <EditCorpusMetadata mode="create" metadata={metadata ? metadata.toJS() : metadata} onChange={setMetadata} />
      )}
    </div>
  );
};

const TabPerspectives = ({ setPerspectives, createPerspective, mode }) => {
  const perspectives = useSelector(selectors.getPerspectives);
  const getTranslation = useContext(TranslationContext);

  return (
    <div>
      <Header className="inverted">{getTranslation("Add one or more perspectives")}</Header>
      <Perspectives perspectives={perspectives} onChange={setPerspectives} mode={mode} />
      <Button fluid positive onClick={createPerspective}>
        {getTranslation("Add perspective")}
      </Button>
    </div>
  );
};

const StepButton = ({ step, onCreateDictionary, onNextClick }) => {
  const isNextStep = useSelector(selectors.getNextStep);
  const getTranslation = useContext(TranslationContext);

  const create = isNextStep && step === "PERSPECTIVES";
  const next_step = isNextStep && step !== "PERSPECTIVES" && step !== "FINISH";

  return (
    <div className="lingvo-create-dict-button">
      {(create || next_step) && <Divider />}
      {create && <CreateButton onCreateDictionary={onCreateDictionary} />}
      {next_step && (
        <Button fluid className="lingvo-button-lite-violet" onClick={onNextClick}>
          {getTranslation("Next Step")}
        </Button>
      )}
    </div>
  );
};

const CreateButton = ({ onCreateDictionary }) => {
  const parentLanguage = useSelector(selectors.getParentLanguage);
  const translations = useSelector(selectors.getTranslations);
  const metadata = useSelector(selectors.getMetadata);
  const perspectives = useSelector(selectors.getPerspectives);

  const getTranslation = useContext(TranslationContext);

  return (
    <Button
      fluid
      className="lingvo-button-lite-violet"
      onClick={() => onCreateDictionary(parentLanguage, translations, metadata, perspectives)}
    >
      {getTranslation("Create")}
    </Button>
  );
};

const CreateDictionaryWizard = ({
  nextStep,
  goToStep,
  mode,
  createDictionary,
  setParentLanguage,
  step,
  setPerspectives,
  createPerspective,
  setMetadata,
  setTranslations
}) => {
  const getTranslation = useContext(TranslationContext);
  const [createdDictionary, setCreatedDictionary] = useState(undefined);

  const onNextClick = () => {
    nextStep();
  };

  const onStepClick = name => {
    return () => goToStep(name);
  };

  const onCreateDictionary = (parentLanguage, translations, metadata, p) => {
    const parentId = parentLanguage.id;
    const dictionaryTranslations = translations
      .map(t => ({ locale_id: t.get("localeId"), content: t.get("content") }))
      .toJS();
    const perspectives = p
      .map(ps => ({
        fake_id: ps.get("index"),
        translation_atoms: ps
          .get("translations")
          .map(t => ({ locale_id: t.get("localeId"), content: t.get("content") })),
        fields: ps.get("fields").map(f => ({
          fake_id: f.get("id"),
          self_id: f.get("self_id"),
          link_id: f.get("link_id"),
          field_id: f.get("field_id")
        }))
      }))
      .toJS();

    const variables = {
      category: mode === "dictionary" ? 0 : 1,
      parentId,
      dictionaryTranslations,
      perspectives
    };
    if (metadata) {
      variables.metadata = metadata.toJS();
    }
    createDictionary({
      variables,
      refetchQueries: [
        {
          query: dashboardQuery,
          variables: {
            mode: mode === "dictionary" ? 0 : 1,
            category: 0
          }
        }
      ]
    }).then(result => {
      const dictionary = result.data.create_dictionary.dictionary;
      setCreatedDictionary({ id: dictionary.id, perspective_id: dictionary.perspectives[0].id });
      goToStep("FINISH");
    });
  };

  const selectParent = parent => {
    setParentLanguage(parent);
  };

  return (
    <div className="background-content">
      <Step.Group widths={4}>
        <Step link active={step === "PARENT_LANGUAGE"} onClick={onStepClick("PARENT_LANGUAGE")}>
          <Step.Content>
            <Step.Title>{getTranslation("Parent language")}</Step.Title>
            <Step.Description>{getTranslation("Select language")}</Step.Description>
          </Step.Content>
        </Step>

        <Step link active={step === "TRANSLATIONS"} onClick={onStepClick("TRANSLATIONS")}>
          <Step.Content>
            <Step.Title>{getTranslation(`${mode.replace(/^\w/, c => c.toUpperCase())} names and metadata`)}</Step.Title>
            <Step.Description>{getTranslation(`Set ${mode} name, translations and metadata`)}</Step.Description>
          </Step.Content>
        </Step>

        <Step link active={step === "PERSPECTIVES"} onClick={onStepClick("PERSPECTIVES")}>
          <Step.Content>
            <Step.Title>{getTranslation("Perspectives")}</Step.Title>
            <Step.Description>{getTranslation("Create one or more perspectives")}</Step.Description>
          </Step.Content>
        </Step>

        <Step
          link
          active={step === "FINISH"}
          onClick={() => {
            if (createdDictionary) {
              goToStep("FINISH");
            }
          }}
        >
          <Step.Content>
            <Step.Title>{getTranslation("Finish")}</Step.Title>
          </Step.Content>
        </Step>
      </Step.Group>
      <div style={{ minHeight: "calc(100vh - 303px)" }}>
        {step === "PARENT_LANGUAGE" && <TabParentLanguage onSelect={selectParent} />}
        {step === "TRANSLATIONS" && (
          <TabTranslations
            setTranslations={translations => setTranslations(translations)}
            setMetadata={metadata => setMetadata(metadata)}
            mode={mode}
          />
        )}

        {step === "PERSPECTIVES" && (
          <TabPerspectives
            setPerspectives={perspectives => setPerspectives(perspectives)}
            createPerspective={createPerspective}
            mode={mode}
          />
        )}

        {step === "FINISH" && createdDictionary && (
          <Message>
            <Message.Header>{getTranslation(`${mode.replace(/^\w/, c => c.toUpperCase())} created`)}</Message.Header>
            <Message.Content>
              {`${getTranslation(`Your ${mode} is created, click`)} `}
              <Link
                to={`/dictionary/${createdDictionary.id.join("/")}/perspective/${createdDictionary.perspective_id.join(
                  "/"
                )}/edit`}
              >
                {getTranslation("here")}
              </Link>
              {` ${getTranslation("to view.")}`}
            </Message.Content>
          </Message>
        )}
      </div>
      <StepButton step={step} onCreateDictionary={onCreateDictionary} onNextClick={onNextClick} />
    </div>
  );
};

CreateDictionaryWizard.propTypes = {
  step: PropTypes.string.isRequired,
  nextStep: PropTypes.func.isRequired,
  goToStep: PropTypes.func.isRequired,
  setParentLanguage: PropTypes.func.isRequired,
  setTranslations: PropTypes.func.isRequired,
  setMetadata: PropTypes.func.isRequired,
  createPerspective: PropTypes.func.isRequired,
  setPerspectives: PropTypes.func.isRequired,
  createDictionary: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired
};

function mapStateToProps(state) {
  return {
    step: selectors.getStep(state)
  };
}

const mapDispatchToProps = {
  nextStep,
  goToStep,
  setParentLanguage,
  setTranslations,
  setMetadata,
  createPerspective,
  setPerspectives
};

export const CreateDictionary = compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(createDictionaryMutation, { name: "createDictionary" }),
  withProps(() => ({ mode: "dictionary" }))
)(CreateDictionaryWizard);

export const CreateCorpus = compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(createDictionaryMutation, { name: "createDictionary" }),
  withProps(() => ({ mode: "corpus" }))
)(CreateDictionaryWizard);
