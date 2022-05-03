import http, {IncomingMessage, Server, ServerResponse} from "http";
import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  APIEvent,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from "homebridge";
import { Float32 } from "hap-nodejs";

const jsxapi = require('jsxapi');

const PLUGIN_NAME = "homebridge-cisco-collaboration-devices";
const PLATFORM_NAME = "CiscoCollabDeviceHomekitBridge";
const FRIENDLY_NAME = "Cisco Collaboration Devices Homekit bridge";

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerAccessory(PLUGIN_NAME, CiscoCollabDeviceHomekitAccessory);
};


class CiscoCollabDeviceHomekitAccessory implements AccessoryPlugin {

  private readonly log: Logging;
  private readonly name: string;
  private readonly informationService: Service;
  private readonly temperatureService: Service;
  private readonly humidityService: Service;
  private readonly occupancyService: Service;
  private readonly motionService: Service;
  private readonly microphoneService: Service;
  private readonly accessoryConfig: CiscoDevicePluginConfig;
  private currentDeviceMuteStatus: string | void = undefined;
  private currentReportedAmbientTemperature: number | void = 0;
  private currentReportedRelativeHumidity: number | void = 0;

  constructor(log: Logging, config: CiscoDevicePluginConfig, api: API) {
    this.log = log;
    this.name = config.name;
    this.accessoryConfig = config;

    this.informationService = new hap.Service.AccessoryInformation().setCharacteristic( hap.Characteristic.Manufacturer, "Cisco Systems, Inc.")
    this.informationService.getCharacteristic( hap.Characteristic.Model ).on('get', this.getDeviceModel.bind(this));
    this.informationService.getCharacteristic( hap.Characteristic.FirmwareRevision ).on('get', this.getDeviceFirmware.bind(this));
    this.informationService.getCharacteristic( hap.Characteristic.SerialNumber ).on('get', this.getDeviceSerialNumber.bind(this));
    // this.informationService.getCharacteristic( hap.Characteristic.SoftwareRevision ).on('get', this.getDeviceSerialNumber.bind(this));

    this.temperatureService = new hap.Service.TemperatureSensor("Temperature");
    this.temperatureService.getCharacteristic(hap.Characteristic.CurrentTemperature).on('get', this.handleCurrentTemperatureGet.bind(this));

    this.humidityService = new hap.Service.HumiditySensor("Humidity");
    this.humidityService.getCharacteristic(hap.Characteristic.CurrentRelativeHumidity).on('get', this.handleCurrentHumidityGet.bind(this));

    this.occupancyService = new hap.Service.OccupancySensor("Occupancy");
    this.occupancyService.getCharacteristic(hap.Characteristic.OccupancyDetected).on('get', this.handleCurrentOccupancyGet.bind(this));

    this.motionService = new hap.Service.MotionSensor("Motion");
    this.motionService.getCharacteristic(hap.Characteristic.MotionDetected).on('get', this.handleCurrentMotionGet.bind(this));

    this.microphoneService = new hap.Service.Microphone("Microphone");
    this.microphoneService.getCharacteristic(hap.Characteristic.Mute)
                            .on('get', this.handleCurrentMicrophoneMuteGet.bind(this))
                            .on('set', this.handleCurrentMicrophoneMuteSet.bind(this));

    this.log.info(`Finished initializing`)
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  handleCurrentTemperatureGet(callback:any) {    
    this.getValueFromDevice('RoomAnalytics.AmbientTemperature').then(result=>{
      callback(null, result)
    });
  }

  handleCurrentHumidityGet(callback:any) {    
    this.getValueFromDevice('RoomAnalytics.RelativeHumidity').then(result=>{
      callback(null, result)
    });
  }

  handleCurrentOccupancyGet(callback:any) {    
    this.getValueFromDevice('RoomAnalytics.PeoplePresence').then(result=>{
      callback(null, result === 'Yes' ? hap.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED : hap.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED)
    });
  }

  handleCurrentMotionGet(callback:any) {    
    this.getValueFromDevice('RoomAnalytics.PeoplePresence').then(result=>{
      callback(null, result === 'Yes' ? 1:0)
    });
  }

  handleCurrentMicrophoneMuteGet(callback:any) {    
    this.getValueFromDevice('Microphone.Mute').then(result=>{
      callback(null, result === 'On' ? 1:0)
      this.currentDeviceMuteStatus = result;
    });
  }

  handleCurrentMicrophoneMuteSet(callback:any) {   
    let muteValueToSet = this.currentDeviceMuteStatus === 'On' ? 'Off' : 'On'; 
    this.setValueOnDevice('Microphone.Mute', muteValueToSet).then(result=>{
      callback(null, result === 'On' ? 1:0)
      this.currentDeviceMuteStatus = result;
    });
  }

  getValueFromDevice(xapiPath:string){
    return new Promise<string | void>((resolve:any) =>{
      let result:any;
      jsxapi.connect(`wss://${this.accessoryConfig.deviceIP}`, {
        username: this.accessoryConfig.deviceUsername,
        password: this.accessoryConfig.devicePassword
      })
      .on('error', async (error:any)=>{
        // this.log.error("JSXAPI ERROR: ", xapiPath, error);
        switch(xapiPath){
          case "Microphone.Mute":
            result = 'Off';
            break;
          case "RoomAnalytics.PeoplePresence":
            result = 'No';
            break;
          case "RoomAnalytics.RelativeHumidity":
            result = this.currentReportedRelativeHumidity;
            break;
          case "RoomAnalytics.AmbientTemperature":
            result = this.currentReportedAmbientTemperature;
            break;
          case "SystemUnit.Hardware.Module.SerialNumber":
          case "SystemUnit.ProductId":
          case "SystemUnit.Software.Version":
            result = "Not available";
            break;
        }
        resolve(result);
      })
      .on('ready', async (xapi:any)=>{
        switch(xapiPath){
          case "Microphone.Mute":
            result = await xapi.Status.Audio.Microphones.Mute.get();
            this.log.info(`Microphone result: ${result}`)
            break;
          case "RoomAnalytics.PeoplePresence":
            result = await xapi.Status.RoomAnalytics.PeoplePresence.get();
            break;
          case "RoomAnalytics.RelativeHumidity":
            result = await xapi.Status.RoomAnalytics.RelativeHumidity.get();
            this.currentReportedRelativeHumidity = result;
            this.log.info(`Humidity: ${result}`)
            break;
          case "RoomAnalytics.AmbientTemperature":
            result = await xapi.Status.RoomAnalytics.AmbientTemperature.get();
            this.currentReportedAmbientTemperature = result;
            this.log.info(`Temperature result: ${result}`)
            break;
          case "SystemUnit.Software.Version":
            result = await xapi.Status.SystemUnit.Software.Version.get();
            result = result.toString();
            this.log.info(`Firmware version result: ${result}`)
            break;
          case "SystemUnit.Hardware.Module.SerialNumber":
            result = await xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get();
            this.log.info(`Serial number result: ${result}`)
            break;
          case "SystemUnit.ProductId":
            result = await xapi.Status.SystemUnit.ProductId.get();
            this.log.info(`Device Model result: ${result}`)
            break;
        }

        xapi.close();
        resolve(result)
      })
    })
  }

  setValueOnDevice(xapiPath:string, value:any){
    return new Promise<string | void>((resolve:any) =>{
      jsxapi.connect(`wss://${this.accessoryConfig.deviceIP}`, {
        username: this.accessoryConfig.deviceUsername,
        password: this.accessoryConfig.devicePassword
      })
      .on('error', (error:any)=>{
        this.log.error(error);
        resolve();
      })
      .on('ready', async (xapi:any)=>{
        switch(xapiPath){
          case "Microphone.Mute":
            value === 'Off' ? xapi.Command.Audio.Microphones.Mute(): xapi.Command.Audio.Microphones.Unmute();
            break;
        }
        xapi.close();
        resolve()
      })
    })
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log("Identify!");
  }

  getDeviceModel(callback:any): any {
    this.getValueFromDevice('SystemUnit.ProductId').then(result=>{
      callback(null, result)
    });
  }

  getDeviceFirmware(callback:any): any {
    this.getValueFromDevice('SystemUnit.Software.Version').then(result=>{
      callback(null, result)
    });
  }

  getDeviceSerialNumber(callback:any): any {
    this.getValueFromDevice('SystemUnit.Hardware.Module.SerialNumber').then(result=>{
      callback(null, result)
    });
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.humidityService,
      this.informationService,
      // this.microphoneService,
      this.motionService,
      this.occupancyService,
      this.temperatureService,
    ];
  }
    
}



interface CiscoDevicePluginConfig extends AccessoryConfig {
  deviceIP?: string;
  deviceUsername?: string;
  devicePassword?: string;
}