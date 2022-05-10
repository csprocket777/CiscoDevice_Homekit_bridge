# CiscoDevice_Homekit_bridge

# Features
This plugin allows your Cisco Collaboration Device to surface some of it's internal sensors in Homekit for use in home automation. *(Only on devices that have these sensors to be exposed, such as the DeskPro)*

# What is "Homekit"?
Homekit is the name for Apple's home automation ecosystem. It's used to control various "homekit enabled" (important note, more on that in a moment) devices to control your home environment and facilitate some automation.

Devices that are "homekit enabled" have software built into them from the manufacturer and certified by Apple that connect to the homekit home network and communicate with other homekit enabled devices.

Devices that are **NOT** natively homekit enabled can be added to a homekit network through the means of a 3rd party "bridge" solution, one such solution is called ["Homebridge.io"](https://homebridge.io/). Plugins can be written to enable devices to join a homekit network, this is one of those plugins.

Homebridge is a platform that is typically "headless" (meaning "no interface") and requires the installation of other additional interfaces in order to manage it. As a platform and a software that needs to constantly be running, running a homebridge installation on your computer isn't always the best choice.

In order to satisfy both the need for a friendly interface and a means to keep things running, other providers create interfaces and deployment hardware to make this whole process even easier. One example is [Hoobs (**H**omebridge **O**ut **O**f the **B**ox)](https://hoobs.com/). Interfaces like this typically have plugin library viewers and installers. This plugin will appear in those plugin libraries, ready to be installed and configured.

# Why would I want to do this?
Your Cisco device sits on your desk in your office. Depending on the device, there are environmental sensors in it that can be useful in the home automation space. 

**Use case examples:**
- Temperature too high in the office? Automatically turn on a fan.
- Humidity too high? Automatically turn on a dehumidifier.
- Want the lights to turn on and off when you enter or leave the room? Yup, this can do that.


## Available Sensors:
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
