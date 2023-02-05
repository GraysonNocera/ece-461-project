#!/bin/bash

# read file line by line
while read url; do
  # call main.js with each url as argument
  node main.js "$url"
done < path/to/file.txt
