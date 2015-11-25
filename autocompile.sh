#!/bin/bash

dir=.

echo "[$(date)] Watching directory $dir"

inotifywait -m -r -q -e create,modify "$dir" | while read path action file; do
  if [[ "$file" =~ \.js$ ]] && [[ "$file" != "bundle.js" ]]; then
    echo "[$(date)] $path $action $file"
    echo "[$(date)] compilation started"
    ./compile.sh
    echo "[$(date)] compilation complete"
  fi
done

