import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import { Header, Breadcrumb, Dropdown } from 'semantic-ui-react';
import { openRoles } from 'ducks/roles';
import { openPerspectivePropertiesModal } from 'ducks/perspectiveProperties';
import { openStatistics } from 'ducks/statistics';
import { getTranslation } from 'api/i18n';

const queryPerspectivePath = gql`
  query queryPerspectivePath($id: LingvodocID!) {
    perspective(id: $id) {
      tree {
        id
        translation
      }
    }
  }
`;

const queryAvailablePerspectives = gql`
  query availablePerspectives($dictionary_id: LingvodocID!) {
    dictionary(id: $dictionary_id) {
      perspectives {
        id
        parent_id
        translation
      }
    }
  }
`;

/**
 * Perspective breadcrumb component.
 */
class PerspectivePath extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { id, dictionary_id, queryPerspectivePath, queryAvailablePerspectives, mode, className, actions } = this.props;

    if (queryPerspectivePath.loading || queryPerspectivePath.error || queryAvailablePerspectives.loading || queryAvailablePerspectives.error) {
      return null;
    }

    const { perspective: { tree } } = queryPerspectivePath;
    const { perspectives } = queryAvailablePerspectives.dictionary;
 
    return (
      <Header as="h2" className={className}>
        <Breadcrumb
          icon="right angle"
          sections={tree.slice().reverse().map((e, index) => {
            return {
              key: e.id,
              content: perspectives.length > 1 && index == tree.length - 1 ?

                <Dropdown inline text={e.translation}>
                  <Dropdown.Menu>
                    {perspectives.filter(pers => pers.id != tree[0].id).map(pers => (
                      <Dropdown.Item
                        key={pers.id}
                        as="a"
                        href={window.location.protocol + '//' + window.location.host + `/dictionary/${pers.parent_id.join('/')}/perspective/${pers.id.join('/')}/${mode}`}
                        icon="chevron right"
                        text={pers.translation}
                      />))
                    }

                    <Dropdown.Divider />

                    <Dropdown.Item
                      icon="users"
                      text={getTranslation(`'${e.translation}' roles...`)}
                      onClick={() => actions.openRoles(id, 'perspective')}
                    />
                    <Dropdown.Item
                      icon="setting"
                      text={getTranslation(`'${e.translation}' properties...`)}
                      onClick={() =>
                        actions.openPerspectivePropertiesModal(id, dictionary_id)}
                    />
                    <Dropdown.Item
                      icon="percent"
                      text={getTranslation(`'${e.translation}' statistics...`)}
                      onClick={() => actions.openStatistics(id, 'perspective')}
                    />

                  </Dropdown.Menu>
                </Dropdown> :
              
                e.translation,

              link: false
            };
          })}
        />
      </Header>
    );
  }
}

PerspectivePath.propTypes = {
  className: PropTypes.string,
};

PerspectivePath.defaultProps = {
  className: 'white',
};

export default compose(
  connect(
    null,
    dispatch => ({
      actions: bindActionCreators({ openRoles, openPerspectivePropertiesModal, openStatistics }, dispatch),
    })
  ),
  graphql(queryPerspectivePath, {
      name: 'queryPerspectivePath',
      options: (props) => ({ variables: { id: props.id } })
    }
  ),
  graphql(queryAvailablePerspectives, {
      name: 'queryAvailablePerspectives',
      options: (props) => ({ variables: { dictionary_id: props.dictionary_id } })
    }
  )
)
(PerspectivePath);
