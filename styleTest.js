import React from 'react';

import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import { StyleSheet, Text, View, Dimensions, TextInput, Button } from 'react-native';
import MapView, {Circle} from 'react-native-maps';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: null, // error message holder
      mapRegion: {}, // Delta numbers determine zoom

      myAddress: '', //  current set address ; chg by "_saveAddress" or "_getLocationAsync"
      mylocation: null, // current location coords

      newAddress: '', // new address properties
      newcoors: {}, // coordinates corresponding to a new address => Database _ coords
      street: '',
      city:'',
      region:'',
      zip: '',

      areaName:'', // NAME of the defined area => Database _ name
      radius: 100, // RADIUS of the defined area => Database _ radius ; default of 100m
    }
  }

  // - when you first load the page, it will get the current location's coordinates by calling _getLocationAsync method
  componentDidMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
      // this._getCoors();
    }
  }
// ------------------------------------------------------
  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };
// ------------------------------------------------------
  //get my current location and chg myaddress in the state
    //this will set mylocation to current location
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let mylocation = await Location.getCurrentPositionAsync({});
    let myAddress = await Location.reverseGeocodeAsync({
      latitude: mylocation.coords.latitude,
      longitude: mylocation.coords.longitude
    })
    let AddressStr = this._getAddress(myAddress[0])

    this.setState({
      myAddress: AddressStr,
      mylocation,
      mapRegion: {
      latitude: mylocation.coords.latitude,
      longitude: mylocation.coords.longitude,
      latitudeDelta: 0.005, // Delta numbers determine zoom
      longitudeDelta: 0.005 // Delta numbers determine zoom
      }
    }, () => console.log(this.state))
  };
// ------------------------------------------------------
    //this method will convert an full address object to a full address string
  _getAddress = (addressObj) => {

    var name = addressObj.name;
    var street = addressObj.street;
    var city = addressObj.city;
    var state =addressObj.region;// state
    var postalcode = addressObj.postalcode;
    var country = addressObj.country;
    var result = `${name} ${street}, ${city}, ${state} ${postalcode}, ${country}`;
    return result;
  }
// ------------------------------------------------------
  // pass down a string of address or location info as an argument
  _getCoors = async (newAddress) => { //
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

      //calling geocodeAsync with argument of a address will give you an object containing ladtitude and longitude
    var coorsObj = await Location.geocodeAsync(newAddress)

      //reassign newcoors
    this.setState({
      newcoors: coorsObj
    },console.log(this.state.newcoors))
  }
// ------------------------------------------------------
  _saveAddress = async () => {
    var newAddress = `${this.state.street}, ${this.state.city}, ${this.state.region} ${this.state.zip}, United States`
      // create a address string that is made with input feilds and pass it down to get_Coors to get coordinate of it
    await this._getCoors(newAddress)
      // new coords will be saved in "state.newcoors"

    // if coords does not exist -> give it an error msg and ask to chg address input

      //get the latitude and longitude from newcoors
    var newLad = this.state.newcoors[0].latitude;
    var newLng = this.state.newcoors[0].longitude;

      //using the newcoors's lad and lng, get the correct address by passing it down to reverseGeocodeAsync
    let myAddress = await Location.reverseGeocodeAsync({
      latitude: newLad,
      longitude: newLng
    })

      //"myAddress[0]" will be an obj consisted with properties (name,street,city,region,postalcode,country)
        //so pass it down to getAddress to get the full address in one string
    let AddressStr = this._getAddress(myAddress[0])

      // reassign states ;
        //myAddress -> new full address in one string searched by input
        //newAddress -> incomplete addresss which is a combination of inputs
        //mapRegion.newLad , mapRegion.newLgn are from "this.state.newcoors" which is a new coordinate

    this.setState({
      myAddress: AddressStr,
      mapRegion: {
        latitude: newLad,
        longitude: newLng,
        latitudeDelta: 0.005, // Delta numbers determine zoom
        longitudeDelta: 0.005 // Delta numbers determine zoom
      },
      newAddress
    }, console.log(this.state))
  }
// ------------------------------------------------------RENDERING
  render(){
    let text = 'Waiting..';
    let myadd = 'Waiting..';
    let newadd = 'Waiting..';
    let newcoors = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.mylocation) {
      text = JSON.stringify(this.state.mylocation);
      myadd = this.state.myAddress; // this will be the address show up below the map
      newcoors = JSON.stringify(this.state.newcoors);
      newadd = this.state.newAddress;
    }
// ------------------------------------------------------HTML
    return (
      <View style={styles.container1}>
        <View style={styles.container2}>
          <MapView region={this.state.mapRegion}
          onRegionChange={this._handleMapRegionChange} style={styles.mapStyle}>
            <Circle center={{latitude: this.state.mapRegion.latitude, longitude: this.state.mapRegion.longitude}} radius={this.state.radius} fillColor="rgba(0,0,255,0.6)" zIndex={2} strokeWidth={0.001}/>
          </MapView>
        </View>
        <View style={styles.inputContainer}>
          <View style={{width: '100%', height: 25}}>
            <Text>{myadd}</Text>
          </View>
          <View style={{width: '100%', height: 25}}>
              <TextInput
                placeholder="Area Name"
                onChangeText={(text) => this.setState({
                  areaName: text
                })}
              />
            </View>
            <View style={{width: '100%', height: 25}}>
              <TextInput
                placeholder="Radius 100m, 200m..."
                onChangeText={(text) => this.setState({
                  radius: Number(text)
                },() => console.log(this.state.radius))}
              />
            </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={{width: '100%', height: 25}}>
            <TextInput
              placeholder="Street Address"
              onChangeText={(text) => this.setState({
                street: text
              })}
            />
          </View>
          <View style={{width: '100%', height: 25}}>
            <TextInput
              placeholder="City"
              onChangeText={(text) => this.setState({
                city: text
              })}
            />
          </View>
          <View style={{width: '100%', height: 25}}>
            <TextInput
              placeholder="State"
              onChangeText={(text) => this.setState({
                region: text
              })}
            />
          </View>
          <View style={{width: '100%', height: 25}}>
            <TextInput
              placeholder="Zip Code"
              onChangeText={(text) => this.setState({
                zip: text
              })}
            />
          </View>
          </View>
          <View style={styles.btnStyle}>
            <Button
              onPress={this._saveAddress}
              title="save"
              // color="#841584"
            />
            <Button
              onPress={this._getLocationAsync}
              title="use my location"
              // color="#841584"
              />
          </View>
        <View style={styles.container1}>
          {/* <Text>My Address</Text>
          <Text>{myadd}</Text>
          <Text>COORS : {text}</Text>
          <Text>New Coors : {newcoors}</Text>
          <Text>New address : {newadd}</Text> */}
        </View>
      </View>
    )
  };
}
// ------------------------------------------------------STYLING
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  container1: {
    flex: 1,
    backgroundColor: '#ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container2: {
    flex: 1,
    backgroundColor: '#ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    // width: 300,
    height: 250,
    width: Dimensions.get('window').width
    // height: Dimensions.get('window').height,
  },
  btnStyle:{
    flexDirection: 'row'
  },
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

/*
# Resoureces

react-native-maps // MapView
  url : https://docs.expo.io/versions/latest/sdk/map-view/

expo-location // converting coors/addresses
  url : https://docs.expo.io/versions/latest/sdk/location/#locationgeocodeasyncaddress

test address :
  6060 Center Dr, Los Angeles, CA 9004
*/