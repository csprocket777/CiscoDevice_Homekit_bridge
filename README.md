# CiscoDevice_Homekit_bridge

# Features
This plugin allows your Cisco Collaboration Device to surface some of it's internal sensors in Homekit for use in home automation. *(Only on devices that have these sensors to be exposed, such as the DeskPro)*

**Available Sensors:**
- Temperature
- Humidity
- Motion
- Occupancy

## Configuration
In order for this plugin to connect with your Cisco Webex Collaboration device, you need to have it in "Personal Mode", see instructions [here](https://roomos.cisco.com/docs/LocalAdminUser.md).

Once the above is done, this plugin needs the device's IP, admin username and password in order to make calls to the internal API on the device. That configuration looks like this:
```json
"accessories": [
    {
        "accessory": "homebridge-cisco-collaboration-devices",
        "name": "Cisco Collaboration Device Bridge",
        "deviceIP": "yourDeviceIPAddress",
        "deviceUsername": "yourDeviceLocalUsername",
        "devicePassword": "yourDeviceLocalPassword"
    }
],
```
