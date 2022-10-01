import { StyleSheet, Text, View, Button, SafeAreaView, Image } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { AutoFocus, Camera, CameraType } from 'expo-camera';
import { Video } from 'expo-av';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { TouchableOpacity } from 'react-native';

export default function App() {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState();
  const [type, setType] = useState("back");
  

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMicrophonePermission(microphonePermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

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

  if (video) {
    let shareVideo = () => {
      shareAsync(video.uri).then(() => {
        setVideo(undefined);
      });
    };

    let saveVideo = () => {
      MediaLibrary.saveToLibraryAsync(video.uri).then(() => {
        setVideo(undefined);
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <Video
          style={styles.video}
          source={{uri: video.uri}}
          useNativeControls
          resizeMode='contain'
          isLooping
        />
        <Button title="Share" onPress={shareVideo} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={saveVideo} /> : undefined}
        <Button title="Discard" onPress={() => setVideo(undefined)} />
      </SafeAreaView>
    );
  }
  return (
    <Camera style={styles.container} ref={cameraRef} ratio='16:9' type={type}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[{ backgroundColor: isRecording ? "#DA1E05" : "#00B53A"} ,styles.cameraButton]} onPress={isRecording ? stopRecording : recordVideo}>
          <Image source={require('./assets/camera.png')} resizeMethod='resize' resizeMode='contain' style={styles.cameraImage}/>
          </TouchableOpacity>
          <TouchableOpacity style={[{ backgroundColor: isRecording ? "#DA1E05" : "#00B53A"} ,styles.cameraFlipButton]} onPress={toggleCameraType}>
          <Image source={require('./assets/cameraFlip.png')} resizeMethod='resize' resizeMode='contain' style={styles.cameraFlipImage}/>
          </TouchableOpacity>
      </View>
    </Camera>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height:'50%',
  },
  cameraButton:{
    marginLeft: '30%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  cameraFlipButton:{
    marginLeft: '10%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    marginTop: '170%',
    width: '100%',
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
  video: {
    flex: 1,
    alignSelf: "stretch"
  }
});