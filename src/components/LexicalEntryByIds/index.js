import React from "react";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import { Dimmer, Header, Icon } from "semantic-ui-react";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { branch, compose, pure, renderComponent } from "recompose";
import styled from "styled-components";

import { LexicalEntryByIds as LexicalEntryByIdsViewMode } from "components/PerspectiveView/index";
import Placeholder from "components/Placeholder";

import LexicalEntryByIdsAdvanced from "./LexicalEntryByIdsAdvanced";
import { isOnlyViewModeAllowed } from "./utils";

import "./style.scss";

const ModalContentWrapper = styled("div")`
  min-height: 15vh;
`;

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

  if (data.loading) {
    return (
      <ModalContentWrapper>
        <Dimmer active style={{ minHeight: "15vh", background: "none" }}>
          <Header as="h2" icon>
            <Icon name="spinner" loading />
          </Header>
        </Dimmer>
      </ModalContentWrapper>
    );
  }

  if (onlyViewMode) {
    return <LexicalEntryByIdsViewMode {...restProps} mode={restProps.defaultMode} />;
  }

  return (
    <div>
      {onlyViewModeAllowed && !isAdminUser(user) ? (
        <LexicalEntryByIdsViewMode {...restProps} mode={restProps.defaultMode} />
      ) : (
        <LexicalEntryByIdsAdvanced {...restProps} data={data} />
      )}
    </div>
  );
};

LexicalEntryByIdsWrapper.propTypes = {
  data: PropTypes.object.isRequired
};

const withConnect = connect(state => state.user);

export default compose(PermissionLists, withConnect, pure)(LexicalEntryByIdsWrapper);
