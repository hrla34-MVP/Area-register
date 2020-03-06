/*
## TO START
  - npm install
  - expo start
*/

import React from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { StyleSheet, Text, View, Dimensions, TextInput, Button, ScrollView, KeyboardAvoidingView, StatusBar, Modal, TouchableHighlight } from 'react-native';
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

      //states for event handling
        //  enter_noti : true(on) / false(off)
        //  exit_noti : true(on)/ false(off)
        //  notification : true/ false
        //  title
        //  body

      // ------states for modal

      modalVisible: false


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
  setModalVisible(){
    this.setState({modalVisible: !this.state.modalVisible})
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
    console.log(addressObj)
    var name = addressObj.name;
    var street = addressObj.street;
    var city = addressObj.city;
    var state =addressObj.region;// state
    var postalcode = addressObj.postalCode;
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

    if(this.state.radius > 0 && this.state.radius < 10001){
      var mapCircle = this.state.radius;
    } else if (this.state.radius > 10000){
      var mapCircle = 10000
    } else {
      var mapCircle = 100
    }

// ------------------------------------------------------HTML
    return (
      <ScrollView>
      <StatusBar barStyle="dark-content"/>
      <View style={{marginTop: 22}}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View style={{marginTop: 22}}>
            <Text>Hello World!</Text>
            <TouchableHighlight
              onPress={()=>{
                this.setModalVisible()
              }}>
                <Text>Hide Modal</Text>
            </TouchableHighlight>

          </View>
        </Modal>
      </View>
      <View style={styles.conOne}>
        <View style={styles.conTwo1}>
          <View style={styles.conThree1}>
            <MapView region={this.state.mapRegion}
            onRegionChange={this._handleMapRegionChange} style={styles.mapStyle}>
              <Circle center={{latitude: this.state.mapRegion.latitude, longitude: this.state.mapRegion.longitude}} radius={mapCircle} fillColor="rgba(0,0,255,0.6)" zIndex={2} strokeWidth={0.001}/>
            </MapView>
            <View style={styles.current}>
              <Text>hello</Text>
            </View>
          </View>
          <View style={styles.conThree2}>
            <Text style={{width: 300}}> :: AREA ADDRESS ::</Text>
            <Text style={{width: 300}}> {myadd}</Text>
          </View>
          <View style={styles.conThree3}>
            <View style={styles.conFour1}>
              <TextInput
                placeholder="Area Name"
                onChangeText={(text) => this.setState({
                  areaName: text
                })}
              />
            </View>
            <View style={styles.conFour2}>
              <TextInput
                placeholder="Radius 100m, 200m..."
                onChangeText={(text) => {
                  if(Number(text) > 10000){
                    this.setState({
                      radius: 10000
                    },() => console.log(this.state.radius))
                  } else {
                    this.setState({
                      radius: Number(text)
                    },() => console.log(this.state.radius))
                  }
                  }}
              />
            </View>
          </View>
        </View>
        <View style={styles.conTwo2}>
          <View style={styles.conThree4}>
            <View style={styles.conFourhold}>
              <View style={styles.conFour3}>
                <Button
                onPress={this._getLocationAsync}
                title="use my location"
                color="white"
                />
              </View>
              <View style={styles.conFour4}>
                <Text style={{color: 'white'}}>hello</Text>
                <TouchableHighlight
                  onPress={() => {
                    this.setModalVisible()
                  }}>
                  <Text>Show Modal</Text>
                </TouchableHighlight>
              </View>
            </View>
            <View style={styles.conFive}>
              <View style={styles.inputBox}>
                  <View style={styles.input1}>
                    <TextInput
                      placeholder="Street Address"
                      onChangeText={(text) => this.setState({
                        street: text
                      })}
                    />
                  </View>
                  <View style={styles.input2}>
                    <TextInput
                      placeholder="City"
                      onChangeText={(text) => this.setState({
                        city: text
                      })}
                    />
                  </View>
                  <View style={styles.input3}>
                    <View style={styles.input4}>
                      <TextInput
                        placeholder="State"
                        onChangeText={(text) => this.setState({
                          region: text
                        })}
                      />
                    </View>
                    <View style={styles.input5}>
                      <TextInput
                        placeholder="Zip Code"
                        onChangeText={(text) => this.setState({
                          zip: text
                        })}
                      />
                    </View>
                  </View>
                  <View style={styles.input6}>
                    <View style={styles.save}>
                      <Button
                        onPress={this._saveAddress}
                        title="save"
                        color="white"
                      />
                    </View>
                  </View>
              </View>
            </View>
          </View>
          <View style={styles.conThree5}>
            <View style={styles.conFour5}>
              <Text style={{color: 'white'}}>hello</Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>
    )
  };
}
// ------------------------------------------------------STYLING
const styles = StyleSheet.create({
  conOne:{
    height: Dimensions.get('window').height,
    justifyContent: 'flex-start',
  },
  conTwo1:{
    flex: 3,
  },
  conTwo2:{
    flex: 3
  },
  conThree1:{
    height: '100%',
    flex: 6,
    backgroundColor: 'yellow'
  },
  mapStyle: {
    height: '100%',
    width: Dimensions.get('window').width
  },
  conThree2:{
    flex: 1,
    width: '100%',
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conThree3:{
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  conThree4:{
    flex: 3,
    backgroundColor: 'yellow',
  },
  conThree5:{
    flex: 1,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
  },
  conFour1:{
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  conFour2:{
    height: '100%',
    backgroundColor: 'pink',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  conFourhold:{
    flexDirection: 'row',
    height: 50
  },
  conFour3:{
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  conFour4:{
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue'
  },
  conFour5:{
    height: 50,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  conFive:{
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow',
  },
  inputBox:{
    backgroundColor: 'blue',
    height: 250,
    width: 300,
    justifyContent: 'space-around'
  },
  input1:{
    height: 50,
    width: 300,
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center'
  },
  input2:{
    height: 50,
    width: 300,
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center'
  },
  input3:{
    height: 50,
    width: 300,
    backgroundColor: 'pink',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  input4:{
    flex: 1,
    height: 50,
    width: '50%',
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center'
  },
  input5:{
    flex: 1,
    height: 50,
    width: '50%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  input6: {
    height: 50,
    width: 300,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  save :{
    width: '50%',
    height: 50,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center'
  },
  current :{
    width: 50,
    height: 50,
    position: 'absolute',
    top: '80%',
    bottom: '5%',
    zIndex: 2
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