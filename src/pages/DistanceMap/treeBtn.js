/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Checkbox } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';
import './styles.scss';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { setMainGroupLanguages } from 'ducks/distanceMap';
const classNames = {
  leaf: 'leaf btn',
  group: 'group btn',
  node: 'node btn',
  dict: 'dict'
};

let mainGroupDict = []
let mainGroupDictLocal
class TreeBtn extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      childrensStates: props.treeBtnState && props.treeBtnState.childrensStates ? props.treeBtnState.childrensStates : {},
      childrensShowed: props.treeBtnState && props.treeBtnState.childrensShowed ? props.treeBtnState.childrensShowed : false,
      childrenChecked: []
    }

    this.treeBtnRefs = []
    this.title = props.title

    this.toggle = this.toggle.bind(this)
    this.showChildrens = this.showChildrens.bind(this)
    this.hideChildrens = this.hideChildrens.bind(this)
    this.checkValue = this.checkValue.bind(this)

    this.setTextInputRef = (element) => {
      if (element && !this.treeBtnRefs.some(ref => ref.props.title === element.props.title)) {
        this.treeBtnRefs.push(element)
      }
    }
  }

  showChildrens() {
    this.setState({ childrensShowed: true })
  }

  hideChildrens() {
    const childrensStates = {}
    const stat = {
      childrensStates: {},
      childrensShowed: this.state.childrensShowed
    }

    this.treeBtnRefs.forEach((ref) => {
      childrensStates[ref.title] = JSON.parse(JSON.stringify(ref.hideChildrens()))
    })

    stat.childrensStates = JSON.parse(JSON.stringify(childrensStates))

    this.setState({ childrensShowed: false, childrensStates },)

    // console.log( this.state )
    return stat
  }

  toggle() {

    if (this.state.childrensShowed) {
      this.hideChildrens()
    } else {
      this.showChildrens()
    }
  }
  checkValue(check, data) {
    const { actions, mainGroupDict } = this.props
    if (data.type !== "dictionary") {
   
      data.children.forEach((dict) => {
        this.checkValue(check, dict)
      })
    }
    mainGroupDictLocal = mainGroupDict
    if (check.checked) {
      mainGroupDictLocal.push(data)
    } else {
      mainGroupDictLocal = mainGroupDict.filter((dict) => {
        if (compositeIdToString(dict.id) === compositeIdToString(data.id)) {
          return false
        }
        return true
      })
      
    }
    actions.setMainGroupLanguages([...mainGroupDictLocal])
     
  }

  setClassName() {
    const parent = this.props.parent

    if (!parent) {
      return classNames.node
    }
    if (parent && parent.parent_id === null) {
      return classNames.group
    }
    if (parent && parent.parent_id !== null && parent.type === 'language') {
      return classNames.leaf
    }

    return ''
  }

  render() {
    const {
      title,
      data,
      dataLang,
      actions,
      mainGroupDict
    } = this.props;

    /* console.log(mainGroupDict) */
    return (
      <span className={'treeBtn'}>
        <span>
          {(dataLang.type !== 'dictionary') && (<button
            className={this.setClassName()}
            active={this.state.childrensShowed}
            onClick={() => this.toggle()}
          />)}
          <Checkbox
            className="checkBox"
            onClick={(element, check, e) => { this.checkValue(check, dataLang) }}
            label={title}
           // defaultChecked={mainGroupDict.some(element => compositeIdToString(element.id) === compositeIdToString(dataLang.id))}
            checked={mainGroupDict.some(element => compositeIdToString(element.id) === compositeIdToString(dataLang.id))}
          >
          </Checkbox>
        </span>


        {(this.state.childrensShowed) && (data.map(item => <TreeBtn
          ref={this.setTextInputRef}
          key={item.id.join('_')}
          title={item.translation}
          data={item.children}
          dataLang={item}
          treeBtnState={this.state.childrensStates[item.translation]}
          parent={dataLang}
          actions={actions}
          mainGroupDict={mainGroupDict}
        />))}


      </span>
    );
  }
}

export default TreeBtn
