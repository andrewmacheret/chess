#!/bin/bash

browserify -t [ babelify --presets [ react ] ] index.js -o bundle.js

