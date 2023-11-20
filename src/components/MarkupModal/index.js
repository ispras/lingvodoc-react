import React, { useContext } from "react";
import { connect } from "react-redux";
import { Button, Icon, Message, Modal } from "semantic-ui-react";
import { gql, useQuery } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import MarkupViewer from "components/MarkupViewer";
import { closeViewer, openConvert } from "ducks/markup";
import TranslationContext from "Layout/TranslationContext";

const q = gql`
  query convertMarkup($id: LingvodocID!) {
    convert_markup(id: $id)
  }
`;

export const validateQuery = gql`
  query validate($idList: [LingvodocID]!) {
    convert_five_tiers_validate(markup_id_list: $idList)
  }
`;

const MarkupEntity = graphql(q)(props => {
  const getTranslation = useContext(TranslationContext);
  const { data, file } = props;
  if (data.loading) {
    return (
      <span>
        {getTranslation("Loading markup data")}... <Icon name="spinner" loading />
      </span>
    );
  }
  if (data.error) {
    return (
      <Message negative compact>
        <Message.Header>{getTranslation("Markup data loading error")}</Message.Header>
        <div style={{ marginTop: "0.25em" }}>
          {getTranslation("Try reloading the page; if the error persists, please contact administrators.")}
        </div>
      </Message>
    );
  }
  return <MarkupViewer file={file} markup={data.convert_markup} />;
});

const MarkupModal = props => {
  const { visible, data, actions } = props;
  const {
    audio,
    markup: { id },
    columns,
    allEntriesGenerator
  } = data;
  const audioUrl = audio ? audio.content : null;

  const getTranslation = useContext(TranslationContext);

  const { loading, error, data: { convert_five_tiers_validate: isValidList }} = useQuery(validateQuery, {
    variables: {
      idList: [props.id]
    }
  });

  return (
    <Modal closeIcon onClose={actions.closeViewer} open={visible} dimmer size="large" className="lingvo-modal2">
      <Modal.Content>
        <MarkupEntity file={audioUrl} id={id} />
      </Modal.Content>
      <Modal.Actions>
        { (loading || error) && (
          <span>
            {this.context("Loading markup data")}... <Icon name="spinner" loading />
          </span>
        ) || isValidList[0] && (
          <>
            <Button
              content={getTranslation("Convert morphology concordance...")}
              onClick={() => actions.openConvert(audio, data.markup, columns, allEntriesGenerator, morphology=true, preview=isValidList[0])}
              id={data.markup.id}
              className="lingvo-button-lite-violet"
            />
            <Button
              content={getTranslation("Convert to dictionary...")}
              onClick={() => actions.openConvert(audio, data.markup, columns, allEntriesGenerator, morphology=false, preview=isValidList[0])}
              id={data.markup.id}
              className="lingvo-button-violet"
            />
          </>
        )}
        <Button content={getTranslation("Close")} onClick={actions.closeViewer} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

MarkupModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    audio: PropTypes.object,
    markup: PropTypes.object.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    closeViewer: PropTypes.func.isRequired,
    openConvert: PropTypes.func.isRequired
  }).isRequired
};

const mapStateToProps = state => state.markup;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openConvert, closeViewer }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(MarkupModal);
