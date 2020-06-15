import React, { Component } from 'react';
import './styles.scss';
import { getTranslation } from 'api/i18n';

class EditorConvertToHTML extends Component {
  render() {
    return (
      <div className="editor">
        <h1>{getTranslation('News editor')}</h1>
      </div>
    );
  }
}
export default EditorConvertToHTML;
