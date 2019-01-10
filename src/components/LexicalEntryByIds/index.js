import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose, branch, renderComponent } from 'recompose';
import Placeholder from 'components/Placeholder';
import { LexicalEntryByIds as LexicalEntryByIdsViewMode } from 'components/PerspectiveView/index';
import { isOnlyViewModeAllowed } from './helpers';

// const PerspectiveRoles = graphql(
//   gql`
//     query PerspectiveRoles($id: LingvodocID!) {
//       perspective(id: $id) {
//         id
//         roles {
//           roles_users
//         }
//       }
//     }
//   `,
//   {
//     options: props => ({
//       variables: {
//         id: props.perspectiveId,
//       },
//     }),
//   }
// );

const PermissionLists = graphql(
  gql`
    query PermissionLists {
      permission_lists(proxy: false) {
        edit {
          id
          translation
        }
      }
    }
  `
);

class LexicalEntryByIds extends PureComponent {
  constructor() {
    super();

    // const { perspectiveId, entriesIds } = props;

    this.state = {
      entriesIds: [],
    };
  }

  render() {
    // const {
    //   className, perspectiveId, entriesIds, defaultMode, entitiesMode, actions,
    // } = this.props;
    return (
      <div>
        Продвинутый компонент
      </div>
    );
  }
}

LexicalEntryByIds.propTypes = {
  className: PropTypes.string.isRequired,
  perspectiveId: PropTypes.array.isRequired,
  entriesIds: PropTypes.array.isRequired,
  defaultMode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  actions: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,
};

const LexicalEntryByIdsWrapper = ({ data, ...restProps }) => {
  const { permission_lists: permissionLists } = data;
  const { perspectiveId } = restProps;
  const onlyViewModeAllowed = isOnlyViewModeAllowed(permissionLists, perspectiveId);

  return (
    <div>
      {onlyViewModeAllowed ?
        <LexicalEntryByIdsViewMode {...restProps} mode={restProps.defaultMode} /> :
        <LexicalEntryByIds {...restProps} data={data} />
      }
    </div>
  );
};

LexicalEntryByIdsWrapper.propTypes = {
  data: PropTypes.object.isRequired,
};

export default compose(
  PermissionLists,
  branch(({ data }) => data.loading, renderComponent(Placeholder))
)(LexicalEntryByIdsWrapper);
