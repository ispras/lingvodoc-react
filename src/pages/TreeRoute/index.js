import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';


class TreeRoute extends React.Component {
    constructor(props) {
      super(props);
  
    }
  
    render() {
      return (
    <div className="qwe">Переходная компонента</div>
      )
    }
  
}
//const mapStateToProps = state => state.treeRoute;

//export default connect(state => state.treeRoute)(TreeRoute) ;
export default TreeRoute;