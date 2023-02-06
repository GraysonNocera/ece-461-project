#!/bin/bash

# get the path to the file as the first argument
file_path=$1

# check if a path was provided
if [ -z "$file_path" ]; then
  echo "Error: No file path provided."
  exit 1
fi

# check if the file exists
if [ ! -f "$file_path" ]; then
  echo "Error: File not found at path: $file_path"
  exit 1
fi

# read file line by line
while read url; do
  # call main.js with each url as argument
  node main.js "$url"
done < "$file_path"
