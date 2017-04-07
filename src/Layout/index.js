import 'Styles/main.scss';
import React from 'react';
import { Layout, Panel, Sidebar } from 'react-toolbox';
import NavBar from './NavBar';

function App() {
  return (
    <Layout>
      <Panel>
        <NavBar />
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.8rem' }}>
          <h1>Main Content</h1>
          <p>Main content goes here.</p>
        </div>
      </Panel>
      <Sidebar width={5}>
        <p>Supplemental content goes here.</p>
      </Sidebar>
    </Layout>
  );
}

export default App;
