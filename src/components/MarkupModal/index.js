import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { compose, branch, renderNothing } from 'recompose';
import { gql, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { Button, Modal } from 'semantic-ui-react';
import { openConvert, closeViewer } from 'ducks/markup';
import MarkupViewer from 'components/MarkupViewer';

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

const MarkupEntity = graphql(q)((props) => {
  const { data, file } = props;
  if (data.loading) {
    return null;
  }
  return <MarkupViewer file={file} markup={data.convert_markup} />;
});

const MarkupModal = (props) => {
  const { visible, data, actions } = props;
  const { audio, markup: { id } } = data;
  const audioUrl = audio ? audio.content : null;

  return (
    <Modal open={visible} dimmer size="large">
      <Modal.Content>
        <MarkupEntity file={audioUrl} id={id} />
      </Modal.Content>
      <Modal.Actions>
        <ConvertButton positive content="Convert to dictionary..." onClick={() => actions.openConvert(audio, data.markup)} id={data.markup.id} />
        <Button icon="minus" content="Close" onClick={actions.closeViewer} />
      </Modal.Actions>
    </Modal>
  );
};

MarkupModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    audio: PropTypes.object,
    markup: PropTypes.object.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    closeViewer: PropTypes.func.isRequired,
    openConvert: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = state => state.markup;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openConvert, closeViewer }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MarkupModal);
