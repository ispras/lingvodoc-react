import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { gql, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { Button, Modal } from 'semantic-ui-react';
import { openViewer, closeViewer } from 'ducks/markup';
import MarkupViewer from 'components/MarkupViewer';


const q = gql`
  query convertMarkup($id: LingvodocID!) {
    convert_markup(id: $id)
  }
`;

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
    <Modal open={visible} dimmer size="small">
      <Modal.Content>
        <MarkupEntity file={audioUrl} id={id} />
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content="Close" onClick={actions.closeViewer} />
      </Modal.Actions>
    </Modal>
  );
};

MarkupModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    audio: PropTypes.object.isRequired,
    markup: PropTypes.object.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    openViewer: PropTypes.func.isRequired,
    closeViewer: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = state => state.markup;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openViewer, closeViewer }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MarkupModal);



