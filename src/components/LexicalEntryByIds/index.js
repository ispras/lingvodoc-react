import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose, branch, renderComponent, pure } from 'recompose';
import Placeholder from 'components/Placeholder';
import { LexicalEntryByIds as LexicalEntryByIdsViewMode } from 'components/PerspectiveView/index';
import LexicalEntryByIdsAdvanced from './LexicalEntryByIdsAdvanced';
import { isOnlyViewModeAllowed } from './utils';

import './style.scss';

const PermissionLists = graphql(gql`
  query PermissionLists {
    permission_lists(proxy: false) {
      edit {
        id
        translation
      }
    }
  }
`);

const isAdminUser = user => user && parseInt(user.id, 10) === 1;

const LexicalEntryByIdsWrapper = ({ data, ...restProps }) => {
  const { permission_lists: permissionLists } = data;
  const { perspectiveId, onlyViewMode, user } = restProps;
  const onlyViewModeAllowed = isOnlyViewModeAllowed(permissionLists, perspectiveId);

  if (onlyViewMode) {
    return (
      <LexicalEntryByIdsViewMode {...restProps} mode={restProps.defaultMode} />
    );
  }

  return (
    <div>
      {onlyViewModeAllowed && !isAdminUser(user) ?
        <LexicalEntryByIdsViewMode {...restProps} mode={restProps.defaultMode} /> :
        <LexicalEntryByIdsAdvanced {...restProps} data={data} />
      }
    </div>
  );
};

LexicalEntryByIdsWrapper.propTypes = {
  data: PropTypes.object.isRequired,
};

const withConnect = connect(
  state => state.user,
);

export default compose(
  PermissionLists,
  branch(({ data }) => data.loading, renderComponent(Placeholder)),
  withConnect,
  pure
)(LexicalEntryByIdsWrapper);
