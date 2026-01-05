import React from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  useWindowDimensions, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ComingSoon = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const handleBack = () => {
    router.push('/(screen)/Profile');
  };

  // Responsive GIF sizing
  const getGifSize = () => {
    const isSmallScreen = width < 360;
    const isMediumScreen = width >= 360 && width < 400;
    
    if (isSmallScreen) {
      return {
        width: width * 1,
        height: height * 0.9,
      };
    }
    
    if (isMediumScreen) {
      return {
        width: width * 1,
        height: height * 1,
      };
    }
    
    return {
      width: width,
      height: height * 1,
    };
  };

  const gifSize = getGifSize();

  return (
    <>
      <StatusBar style="dark" />
      <LinearGradient 
        colors={["#ffffffff", "#aff6f6ff"]} 
        style={styles.container}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Image
            source={require('../../assets/images/Comingsoon.gif')}
            style={[
              styles.gif,
              {
                width: Math.min(gifSize.width, 800),
                height: Math.min(gifSize.height, 800),
              }
            ]}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
   
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  gif: {
    maxWidth: 800,
    maxHeight: 800,
  },
});

export default ComingSoon;