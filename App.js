import { StyleSheet, Text, View, Button, SafeAreaView, Image, TextInput } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { AutoFocus, Camera, CameraType } from 'expo-camera';
import { Video } from 'expo-av';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';



export default function App() {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState();
  const [number, onChangeNumber] = useState(null);

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [type, setType] = useState("back");
  const [sound, setSound] = useState();
  const [city,setCity] = useState();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude : location.coords.latitude,
        longitude : location.coords.longitude
    })
      setLocation(location);
      let city;
        geocode.find( p => {
          city = p.district
          setCity(p.district)
        })
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

      playSound();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMicrophonePermission(microphonePermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);
  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  if (hasCameraPermission === undefined || hasMicrophonePermission === undefined) {
    return <Text>Requestion permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted.</Text>
  }

  let recordVideo = () => {
    setIsRecording(true);
    let options = {
      quality: "1080p",
      maxDuration: 60,
      mute: false
    };

    cameraRef.current.recordAsync(options).then((recordedVideo) => {
      setVideo(recordedVideo);
      setIsRecording(false);
    });
  };

  let stopRecording = () => {
    setIsRecording(false);
    cameraRef.current.stopRecording();
  };

  let toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  async function playSound(){
    const { sound } = await Audio.Sound.createAsync( require('./assets/record.m4a')
    );
    setSound(sound);
    await sound.playAsync();
  }

  async function playSound2(){
    const { sound } = await Audio.Sound.createAsync( require('./assets/record2.m4a')
    );
    setSound(sound);
    await sound.playAsync();
  }

  if (video) {
    let shareVideo = () => {
      alert("Video sent!")
    };

    let saveVideo = () => {
      MediaLibrary.saveToLibraryAsync(video.uri).then(() => {
        setVideo(undefined);
      });
    };

    return (
      <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <Video
          style={styles.video}
          source={{uri: video.uri}}
          useNativeControls
          resizeMode='contain'
          isLooping = 'false'
        />
        </SafeAreaView>
        <TextInput
        style={styles.input}
        onChangeText={onChangeNumber}
        value={number}
        placeholder="Enter Phone-Number"
        keyboardType="numeric"
        />
        <View style={styles.buttonContainer2}>
          <TouchableOpacity style={[{ backgroundColor: '#00B53A'} ,styles.speakerButton]} onPress={() => {playSound2()}}>
          <Image source={require('./assets/speaker.png')} resizeMethod='resize' resizeMode='contain' style={styles.speakerImage}/>
          </TouchableOpacity>
          <TouchableOpacity style={[{ backgroundColor: "#207DC1"} ,styles.cameraButton]} onPress={shareVideo}>
          <Image source={require('./assets/send.png')} resizeMethod='resize' resizeMode='contain' style={styles.cameraImage}/>
          </TouchableOpacity>
          <TouchableOpacity style={[{ backgroundColor: '#DA1E05'} ,styles.cameraFlipButton]} onPress={() => setVideo(undefined)}>
          <Image source={require('./assets/trash.png')} resizeMethod='resize' resizeMode='contain' style={styles.cameraFlipImage}/>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View  style={styles.screen}>
    <Camera style={styles.container} ref={cameraRef} ratio='16:9' type={type}>
      <View style={styles.buttonContainer}>
          <TouchableOpacity style={[{ backgroundColor: '#00B53A'} ,styles.speakerButton]} onPress={() => {playSound()}}>
          <Image source={require('./assets/speaker.png')} resizeMethod='resize' resizeMode='contain' style={styles.speakerImage}/>
          </TouchableOpacity>
          <TouchableOpacity style={[{ backgroundColor: isRecording ? "#DA1E05" : "#207DC1"} ,styles.cameraButton]} onPress={isRecording ? stopRecording : recordVideo}>
          <Image source={require('./assets/camera.png')} resizeMethod='resize' resizeMode='contain' style={styles.cameraImage}/>
          </TouchableOpacity>
          <TouchableOpacity style={[{ backgroundColor: '#207DC1'} ,styles.speakerButton]} onPress={toggleCameraType}>
          <Image source={require('./assets/cameraFlip.png')} resizeMethod='resize' resizeMode='contain' style={styles.cameraFlipImage}/>
          </TouchableOpacity>
          
      </View>
    </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 'auto',
  },
  cameraButton:{
    marginLeft: '10%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  cameraFlipButton:{
    marginLeft: '10%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  speakerButton:{
    marginLeft: '5%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    height: '20%',
    alignItems: 'center',
    marginTop: '170%',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  buttonContainer2: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    width: '100%',
  },
  screen: {
    flex: 1,
    height: '100%',
  },
  cameraImage: {
    width: 100,
    height: 50,
    margin: 10, 
  },
  cameraFlipImage: {
    width: 50,
    height: 50,
    margin: 10, 
  },
  speakerImage: {
    width: 50,
    height: 50,
    margin: 10, 
  },
  video: {
    flex: 1,
    alignSelf: "stretch"
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});