import 'semantic-ui-css/semantic.css';
import 'styles/main.scss';

import React from 'react';
import styled from 'styled-components';
import { Sidebar, Menu, Icon } from 'semantic-ui-react';

import GroupingTagModal from 'components/LexicalEntry/GroupingTagModal';

import NavBar from './NavBar';
import TasksSidebar from './TasksSidebar';
import Snackbar from './Snackbar';
import Routes from './Routes';

const Content = styled.div`
  padding: 5em 20px;
  height: 100vh !important;
  overflow-y: auto !important;
`;

const Layout = () => (
  <div>
    <NavBar />
    <Snackbar />
    <Sidebar.Pushable as="div">
      <TasksSidebar />
      <Sidebar.Pusher as={Content}>
        <Routes />
      </Sidebar.Pusher>
    </Sidebar.Pushable>
    <GroupingTagModal />
  </div>
);

export default Layout;
