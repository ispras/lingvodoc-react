import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Menu } from "semantic-ui-react";
import { useMutation } from "@apollo/client";

import { getTranslation } from "api/i18n";
import { synchronizeMutation } from "backend";
// eslint-disable-next-line import/no-unresolved
import config from "config";

import Locale from "./Locale";
import Tasks from "./Tasks";
import User from "./User";

import "./style.scss";

const SyncButton = () => {
  const [synchronize] = useMutation(synchronizeMutation);

  return (
    <Menu.Item>
      <Button color="purple" onClick={synchronize}>
        {getTranslation("Sync")}
      </Button>
    </Menu.Item>
  );
};

const NavBar = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <Menu fixed="top" className="top_menu" borderless>
      <div className="top-wrapper">
        <Menu.Item as={Link} to={config.homePath} className="top_menu top_menu__logo">
          <span className="lingvodoc-logo">Lingvodoc 3.0</span>
        </Menu.Item>

        <Menu.Menu position="right">
          {isAuthenticated && config.buildType !== "server" && <SyncButton />}
          <User />
          <Tasks />
          <Locale />
        </Menu.Menu>
      </div>
    </Menu>
  );
};

export default NavBar;
