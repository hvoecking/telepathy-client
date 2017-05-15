#!/bin/bash -eu

echo Install global npm packages
npm install -g ionic cordova

echo Install local npm packages
npm install

echo Setup ionic
ionic platform add --save browser
ionic platform add --save ios
ionic platform add --save android

ionic plugin add --save phonegap-plugin-barcodescanner

echo Link font awesome
mkdir src/theme/font-awesome/
ln -s $PWD/node_modules/font-awesome/scss/ src/theme/font-awesome/scss
ln -s $PWD/node_modules/font-awesome/fonts src/assets/fonts

echo Generate Icons
ionic resources --icon
sed -i -e '$a\' config.xml
