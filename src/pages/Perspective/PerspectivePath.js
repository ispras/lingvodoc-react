import React from 'react';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import { Header, Breadcrumb, Dropdown } from 'semantic-ui-react';

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
    const { queryPerspectivePath, queryAvailablePerspectives, mode, className } = this.props;

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
                    {perspectives.filter(pers => pers.id != tree[0].id).map(pers =>
                      <Dropdown.Item
                        key={pers.id}
                        as="a"
                        href={window.location.protocol + '//' + window.location.host + `/dictionary/${pers.parent_id.join('/')}/perspective/${pers.id.join('/')}/${mode}`}
                      >
                      {pers.translation}
                      </Dropdown.Item>)
                    }
                  </Dropdown.Menu>
                </Dropdown>
                : e.translation,
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
