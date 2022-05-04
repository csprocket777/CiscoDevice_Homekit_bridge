#!/bin/bash

filename="package.json"
SEDOPTION=
if [[ "$OSTYPE" == "darwin"* ]]; then
  SEDOPTION="-i ''"
fi
# if [[ "$OSTYPE" == "darwin"* ]]; then 
#     SEDOPTION='-i \x27\x27'; 
# else 
#     SEDOPTION='-i'; 
# fi;

search="https:\/\/hr-tm-cms-git.cisco.com\/collaboration_device_macros\/ciscodevice_homekit_bridge.git"
replace="https:\/\/github.com\/csprocket777\/CiscoDevice_Homekit_bridge.git"
sed $SEDOPTION "s/$search/$replace/g" $filename


search="@collaboration_device_macros:registry"
replace="registry"
sed $SEDOPTION "s/$search/$replace/g" $filename


search="https:\/\/hr-tm-cms-git.cisco.com\/api\/v4\/projects\/122\/packages\/npm\/"
replace="https:\/\/registry.npmjs.org\/"
sed $SEDOPTION "s/$search/$replace/g" $filename


search="@collaboration_device_macros\/homebridge-cisco-collaboration-devices"
replace="homebridge-cisco-collaboration-devices"
sed $SEDOPTION "s/$search/$replace/g" $filename