#!/bin/bash

#npm install -g browserify

error() {
  echo "ERROR: $1" 1>&2
  exit 1
}

# ensure browserify
browserify --version || error "npm install -g browserify"

npm install --save react react-dom babelify babel-preset-react
npm install --save react-dnd react-dnd-html5-backend react-dnd-touch-backend
npm install --save jquery

#browserify -t [ babelify --presets [ react ] ] index.js -o bundle.js
time ./compile.sh

