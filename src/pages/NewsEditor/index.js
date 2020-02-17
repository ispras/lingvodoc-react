
/* import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';

const test =()=>{
  return(
    <div>
   <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={this.onEditorStateChange}
        />
        
    </div>
  )
}

export default test;   */

import React, { Component } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Button } from 'semantic-ui-react';
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import "./styles.scss"
import { getTranslation } from 'api/i18n';
class EditorConvertToHTML extends Component {
  state = {
    editorState: EditorState.createEmpty(),
  }

  onEditorStateChange: Function = (editorState) => {
    this.setState({
      editorState,
    });
  };

  render() {
    const { editorState } = this.state;
    return (
      <div className='editor'>
        <h1>{getTranslation("News editor")}</h1>
        <h2>{getTranslation("Preview")}</h2>
        <textarea className="preview"></textarea>
        <h2>{getTranslation("Text news")}</h2>
        <Editor
          editorState={editorState}
          onEditorStateChange={this.onEditorStateChange}
          wrapperClassName="my-wrapper"
          editorClassName="my-editor-class"
        />
        <div className="date">
          <div className="input-date" >
            <h3>{getTranslation("Publication date")}</h3>
            <input type="date"></input>
          </div>
          <div className="input-date" >
            <h3>{getTranslation("Removal date")}</h3>
            <input type="date"></input>
          </div>



        </div>

        <Button color="green" className="button-send">{getTranslation("Add news")}</Button>
      </div>
    );
  }
}
export default EditorConvertToHTML