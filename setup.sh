#!/bin/bash -eu

echo Install global npm packages
npm install -g ionic cordova

echo Install npm packages
npm install

echo Link font awesome
mkdir src/theme/font-awesome/
ln -s $PWD/node_modules/font-awesome/scss/ src/theme/font-awesome/scss
ln -s $PWD/node_modules/font-awesome/fonts src/assets/fonts
