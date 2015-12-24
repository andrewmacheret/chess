"use strict";

var React = require('react');
var ReactDOM = require('react-dom');

var DropTarget = require('react-dnd').DropTarget;

var ChessSquare = React.createClass({
  propTypes: {
    connectDropTarget: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired,
    canDrop: React.PropTypes.bool.isRequired,

    move: React.PropTypes.func.isRequired,
    canMove: React.PropTypes.func.isRequired,

    rowNumber: React.PropTypes.number.isRequired,
    columnNumber: React.PropTypes.number.isRequired,
    boardSize: React.PropTypes.shape({
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired
    }).isRequired,
    name: React.PropTypes.string.isRequired
  },

  render: function() {
    var connectDropTarget = this.props.connectDropTarget;
    var isOver = this.props.isOver;
    var canDrop = this.props.canDrop;

    var color = (this.props.rowNumber + this.props.columnNumber) % 2 == 0 ? 'white' : 'black';
    var classNames = 'square square-' + color + ' ' + this.props.name;
    if (isOver) {
      classNames += ' square-over';
    }
    if (canDrop) {
      classNames += ' square-droppable';
    }
    var widthPercent = 100 / this.props.boardSize.width;
    var heightPercent = 100 / this.props.boardSize.height;
    var style = {
      width: widthPercent + '%',
      height: heightPercent + '%',
      left: widthPercent * this.props.columnNumber + '%',
      top: heightPercent * this.props.rowNumber + '%'
    };

    return connectDropTarget(
      <div className={classNames} style={style}>
        {this.props.children}
      </div>
    );
  }
});

var dragTargetSpec = {
  drop: function (props, monitor, component) {
    // we need to set a timeout to finish dragging
    window.setTimeout(function() {
      props.move(monitor.getItem().originSquare, props.name);
    }, 1);
  },
  canDrop: function (props, monitor, component) {
    return props.canMove(monitor.getItem().originSquare, props.name);
  }
  // hover
};

var dragTargetCollect = function(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

module.exports = DropTarget('ChessPiece', dragTargetSpec, dragTargetCollect)(ChessSquare);
