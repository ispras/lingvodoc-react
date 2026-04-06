import React, { useContext } from "react";
import { useSelector, connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Menu } from "semantic-ui-react";
import SyncModal from "components/SyncModal";
import { openModal } from "ducks/modals";
import { bindActionCreators } from "redux";

import { synchronizeMutation } from "backend";
// eslint-disable-next-line import/no-unresolved
import config from "config";
import { useMutation } from "hooks";
import TranslationContext from "Layout/TranslationContext";

import Locale from "./Locale";
import Tasks from "./Tasks";
import User from "./User";

import "./style.scss";

const SyncButton = ({ openModal }) => {
  const [synchronize] = useMutation(synchronizeMutation);

  const getTranslation = useContext(TranslationContext);

  const confirm_sync = () => {
    openModal(
      SyncModal,
      {
        perspectiveId: [1,1],
        columns: [],
        applySync: synchronize
      }
    );
  }

  return (
    <Menu.Item>
      <Button color="purple" onClick={confirm_sync}>
        {getTranslation("Sync")}
      </Button>
    </Menu.Item>
  );
};

const NavBar = ({ openModal }) => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <Menu fixed="top" className="top_menu" borderless>
      <div className="top-wrapper">
        <Menu.Item as={Link} to={config.homePath} className="top_menu top_menu__logo">
          <span className="lingvodoc-logo">Lingvodoc 3.0</span>
        </Menu.Item>

        <Menu.Menu position="right">
          {/* This button went from old realization and not actual now */
          /*
          { isAuthenticated && config.buildType !== "server" &&
            <SyncButton
              openModal={openModal}
            />
          }
          */}
          <User />
          <Tasks />
          <Locale />
        </Menu.Menu>
      </div>
    </Menu>
  );
};

export default connect(null, dispatch => bindActionCreators({ openModal }, dispatch)) (NavBar);
