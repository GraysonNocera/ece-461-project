#!/bin/bash

# Prompt the user for a link to a GitHub repository
read -p "Enter a link to a GitHub repository: " link

# Extract the repository name and owner from the link
IFS='/' read -ra arr <<< "$link"
owner=${arr[3]}
repo=$(echo $link | awk -F/ '{print $NF}' | sed 's/.git$//')

# Clone, tell us our variables, and nav to the repository
git clone $link
echo $owner
echo $repo
cd $repo

# Pass into using_apis
#ts-node using_apis $owner $repo

# Nav out and delete
cd ..
rm -rf $repo