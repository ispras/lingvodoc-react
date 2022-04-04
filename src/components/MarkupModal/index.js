import React from "react";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import { Button, Modal } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import MarkupViewer from "components/MarkupViewer";
import { closeViewer, openConvert } from "ducks/markup";

const q = gql`
  query convertMarkup($id: LingvodocID!) {
    convert_markup(id: $id)
  }
`;

const validateQuery = gql`
  query validate($id: LingvodocID!) {
    convert_five_tiers_validate(markup_id: $id)
  }
`;

const ConvertButton = compose(
  graphql(validateQuery),
  branch(({ data }) => data.loading, renderNothing),
  branch(({ data: { convert_five_tiers_validate: isValid } }) => !isValid, renderNothing)
)(props => <Button {...props} />);

const MarkupEntity = graphql(q)(props => {
  const { data, file } = props;
  if (data.loading) {
    return null;
  }
  return <MarkupViewer file={file} markup={data.convert_markup} />;
});

const MarkupModal = props => {
  const { visible, data, actions } = props;
  const {
    audio,
    markup: { id }
  } = data;
  const audioUrl = audio ? audio.content : null;

  return (
    <Modal closeIcon onClose={actions.closeViewer} open={visible} dimmer size="large" className="lingvo-modal2">
      <Modal.Content>
        <MarkupEntity file={audioUrl} id={id} />
      </Modal.Content>
      <Modal.Actions>
        <ConvertButton
          content={getTranslation("Convert to dictionary...")}
          onClick={() => actions.openConvert(audio, data.markup)}
          id={data.markup.id}
          className="lingvo-button-violet"
        />
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
