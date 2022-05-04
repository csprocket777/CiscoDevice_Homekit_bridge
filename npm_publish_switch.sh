#!/bin/bash

filename="package.json"


search="https:\/\/hr-tm-cms-git.cisco.com\/collaboration_device_macros\/ciscodevice_homekit_bridge.git"
replace="https:\/\/github.com\/csprocket777\/CiscoDevice_Homekit_bridge.git"
sed -i "" "s/$search/$replace/g" $filename


search="@collaboration_device_macros:registry"
replace="registry"
sed -i "" "s/$search/$replace/g" $filename


search="https:\/\/hr-tm-cms-git.cisco.com\/api\/v4\/projects\/122\/packages\/npm\/"
replace="https:\/\/registry.npmjs.org\/"
sed -i "" "s/$search/$replace/g" $filename


search="@collaboration_device_macros\/homebridge-cisco-collaboration-devices"
replace="homebridge-cisco-collaboration-devices"
sed -i "" "s/$search/$replace/g" $filename