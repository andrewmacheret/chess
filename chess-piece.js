"use strict";

var React = require('react');
var ReactDOM = require('react-dom');

var DragSource = require('react-dnd').DragSource;

var ChessPiece = React.createClass({
  propTypes: {
    connectDragSource: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired,
    canDrag: React.PropTypes.bool.isRequired,

    canMove: React.PropTypes.func,

    pieceLetter: React.PropTypes.string.isRequired,
    originSquare: React.PropTypes.string,
    move: React.PropTypes.shape({
      source: React.PropTypes.shape({rowNumber: React.PropTypes.number.isRequired}, {columnNumber: React.PropTypes.number.isRequired}).isRequired,
      target: React.PropTypes.shape({rowNumber: React.PropTypes.number.isRequired}, {columnNumber: React.PropTypes.number.isRequired}).isRequired
    }),
    capture: React.PropTypes.bool,
    animate: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      animating: this.props.animate && (this.props.move != null || this.props.capture != null),
      mounted: false
    };
  },

  componentDidMount: function() {
    if (this.state.animating) {
      window.setTimeout(function() {
        this.setState({
          animating: false,
          mounted: true
        });
      }.bind(this), 1);
    }
  },

  render: function() {
    var connectDragSource = this.props.connectDragSource;
    var isDragging = this.props.isDragging;
    var canDrag = this.props.canDrag;

    var classNames = 'piece piece-' + this.props.pieceLetter;
    if (isDragging) {
      classNames += ' piece-dragging';
    }
    if (canDrag) {
      classNames += ' piece-draggable';
    }

    var styles = {};
    var move = this.props.move;
    if (move) {
      classNames += ' last-move';

      if (this.state.animating) {
        var dx = (move.source.columnNumber - move.target.columnNumber) * 100;
        var dy = (move.source.rowNumber - move.target.rowNumber) * 100;
        styles.left = dx + '%';
        styles.top = dy + '%';
        classNames += ' animation-started';
      } else {
        classNames += ' animation-ended';
      }
    }
    var capture = this.props.capture;
    if (capture) {
      classNames += ' capture';

      if (this.state.animating) {
        classNames += ' animation-started';
      } else {
        classNames += ' animation-ended';
      }
    }

    return connectDragSource((
      <div style={styles} className={classNames} />
    ));
  }
});

var dragSourceSpec = {
  beginDrag: function (props, monitor, component) {
    return {
      originSquare: props.originSquare,
      pieceLetter: props.pieceLetter
    };
  },
  canDrag: function (props, monitor, component) {
    return props.canMove ? props.canMove(props.originSquare) : false;
  }
  // endDrag, isDragging
};

var dragSourceCollect = function(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    canDrag: monitor.canDrag()
  };
};

module.exports = DragSource('ChessPiece', dragSourceSpec, dragSourceCollect)(ChessPiece);
