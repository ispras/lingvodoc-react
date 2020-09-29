/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Checkbox } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';
import './styles.scss';


const classNames = {
  leaf: 'leaf btn',
  group: 'group btn',
  node: 'node btn',
  dict: 'dict'
};


class TreeBtn extends React.Component {
    constructor( props ) {
        super( props )

        this.state = {
            childrensStates: props.treeBtnState && props.treeBtnState.childrensStates ? props.treeBtnState.childrensStates : {},
            childrensShowed: props.treeBtnState && props.treeBtnState.childrensShowed ? props.treeBtnState.childrensShowed : false
        }

        this.treeBtnRefs = []
        this.title = props.title

        this.toggle = this.toggle.bind( this )
        this.showChildrens = this.showChildrens.bind( this )
        this.hideChildrens = this.hideChildrens.bind( this )

        this.setTextInputRef = ( element ) => {
            if ( element && !this.treeBtnRefs.some( ref => ref.props.title === element.props.title ) ) {
                this.treeBtnRefs.push( element )
            }
        }
    }

    showChildrens () {
        this.setState({ childrensShowed: true })
    }
    
    hideChildrens () {
        const childrensStates = {}
        const stat = {
            childrensStates: {},
            childrensShowed: this.state.childrensShowed
        }

        this.treeBtnRefs.forEach( ( ref ) => {
            childrensStates[ ref.title ] = JSON.parse( JSON.stringify( ref.hideChildrens() ) )
        })

        stat.childrensStates = JSON.parse( JSON.stringify( childrensStates ) )

        this.setState({ childrensShowed: false, childrensStates }, )

        // console.log( this.state )
        return stat
    }

    toggle () {
        if ( this.state.childrensShowed ) {
            this.hideChildrens()
        } else {
            this.showChildrens()
        }
    }

//   saveStat() {
//     const asd = {};

//     for (const children of Object.values(this.treeBtnRefs)) {
//       children.saveStat();
//       asd[children.props.title] = children.state;
//     }

//     this.setState(oldState => ({ isPressed: !oldState.isPressed, childrens: asd }));
//   }

//   toggle(title, dataLang) {
//     if (this.state.isPressed) {
//       this.saveStat();
//       this.treeBtnRefs = [];
//     } else {
//       for (const children of Object.values(this.treeBtnRefs)) {
//         children.toggle();
//       }
//       this.setState(oldState => ({ isPressed: !oldState.isPressed }));
//       console.log(this.state);
//     }
//   }

    setClassName () {
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
      consoleLOG
    } = this.props;
    return (
      <span className={dataLang.type === 'dictionary' ? 'dict' : 'treeBtn'}>
        <span>
          {(dataLang.type !== 'dictionary') && (<button
            // className={this.state.colorDict}
            className={this.setClassName()}
            active={this.state.childrensShowed}
            onClick={() => this.toggle()}
          />)}
          <label>
            <input type="checkbox" className="checkBox" value={title} />
            {title}
          </label>
        </span>


        {(this.state.childrensShowed) && (data.map(item => <TreeBtn
          ref={this.setTextInputRef}
          key={item.id.join('_')}
          title={item.translation}
          data={item.children}
          dataLang={item}
          treeBtnState={ this.state.childrensStates[ item.translation ] }
          parent={dataLang}
        />))}


      </span>
    );
  }
}

export default TreeBtn;
