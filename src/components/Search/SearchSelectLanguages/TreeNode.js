import React, { PureComponent } from 'react';

class TreeNode extends PureComponent {
  constructor() {
    super();

    this.state = {
      collapsed: true,
    };
  }

  render() {
    console.log(this.state.collapsed);
    return (
      <div>Узел</div>
    );
  }
}

export default TreeNode;
