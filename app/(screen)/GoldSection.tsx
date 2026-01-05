import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing,
  FadeInDown,
  withSpring,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Responsive utility
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;
const isLargeDevice = width >= 414;
const isTablet = width >= 768;

// Glitter particle component - appears once then fades out
const GlitterParticle = ({ delay, angle, radius, size }: any) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const startX = 0;
    const startY = 0;
    const endX = Math.cos(angle) * radius;
    const endY = Math.sin(angle) * radius;

    // Burst out from center
    translateX.value = withDelay(
      delay,
      withTiming(endX, { duration: 800, easing: Easing.out(Easing.cubic) })
    );

    translateY.value = withDelay(
      delay,
      withTiming(endY, { duration: 800, easing: Easing.out(Easing.cubic) })
    );

    // Fade in then fade out
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.8, { duration: 500 }),
        withTiming(0, { duration: 600 })
      )
    );

    // Scale up then disappear
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.5, { duration: 400 }),
        withTiming(0, { duration: 800 })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#fbbf24',
          shadowColor: '#fbbf24',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 5,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function GoldSection() {
  const router = useRouter();
  
  const glowOpacity = useSharedValue(0.6);
  const scale = useSharedValue(1);
  
  // Enhanced entrance animation values
  const progress = useSharedValue(0);
  const floatY = useSharedValue(0);
  
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'BOOKKIT REWARDS';

  // Generate glitter particles in a circle around the coin
  const gifSize = isTablet 
    ? width * 0.4 
    : isLargeDevice 
      ? width * 0.55 
      : isMediumDevice 
        ? width * 0.6 
        : width * 0.65;

  const glitterRadius = gifSize * 0.6;

  const glitterParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: (i * 20) % 400,
    angle: (i / 50) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
    radius: glitterRadius + (Math.random() - 0.5) * 60,
    size: 3 + Math.random() * 5,
  }));

  useEffect(() => {
    StatusBar.setHidden(true);
    
    progress.value = withSpring(1, {
      damping: 20,
      stiffness: 50,
      mass: 1,
    });
    
    setTimeout(() => {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setShowCursor(false);
        }
      }, 130);

      return () => clearInterval(typingInterval);
    }, 1500);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    setTimeout(() => {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.6, { duration: 1500 })
        ),
        -1,
        true
      );
      
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      floatY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 1500);

    return () => {
      StatusBar.setHidden(false);
      clearInterval(cursorInterval);
    };
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const animatedCoinStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      progress.value,
      [0, 1],
      [0.1, 1]
    );
    
    const opacityValue = interpolate(
      progress.value,
      [0, 0.3, 1],
      [0, 0.5, 1]
    );

    return {
      opacity: opacityValue,
      transform: [
        { perspective: 1000 },
        { translateY: floatY.value },
        { scale: scaleValue * scale.value },
      ],
    };
  });

  const backgroundBlurStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [1, 0]),
    };
  });

  // Responsive sizing
  const glowSize = isTablet ? 600 : 500;
  
  const titleSize = isTablet 
    ? 64 
    : isLargeDevice 
      ? 40 
      : isMediumDevice 
        ? 36 
        : 32;

  const descriptionSize = isTablet 
    ? 20 
    : isLargeDevice 
      ? 17 
      : isMediumDevice 
        ? 16 
        : 14;

  const badgeFontSize = isTablet 
    ? 15 
    : isLargeDevice 
      ? 13 
      : isMediumDevice 
        ? 12 
        : 10;

  const badgePaddingH = isTablet 
    ? 28 
    : isLargeDevice 
      ? 22 
      : isMediumDevice 
        ? 18 
        : 16;

  const badgePaddingV = isTablet ? 10 : 8;
  
  const badgeMarginBottom = isTablet 
    ? 60 
    : isLargeDevice 
      ? 50 
      : isMediumDevice 
        ? 45 
        : 40;

  const maxContentWidth = isTablet ? 700 : width * 0.95;

  return (
    <View style={styles.container}>
      {/* Premium Gold-to-Dark Gradient Background */}
      <LinearGradient
        colors={['#0a0a0a', '#1a0f00', '#2d1a00', '#1a0f00', '#0a0a0a']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated depth fog overlay */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          backgroundBlurStyle
        ]} 
      />

      {/* Radial Glow Effects */}
      <LinearGradient
        colors={['rgba(251, 191, 36, 0.2)', 'transparent']}
        style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize / 2,
        }}
      />
      
      <LinearGradient
        colors={['rgba(217, 119, 6, 0.15)', 'transparent']}
        style={{
          position: 'absolute',
          bottom: -250,
          right: -250,
          width: glowSize + 200,
          height: glowSize + 200,
          borderRadius: (glowSize + 200) / 2,
        }}
      />

      {/* Center glow for depth */}
      <LinearGradient
        colors={['transparent', 'rgba(251, 191, 36, 0.08)', 'transparent']}
        style={{
          position: 'absolute',
          top: height * 0.3,
          left: 0,
          right: 0,
          height: height * 0.4,
        }}
      />

      {/* Accent Lines */}
      <LinearGradient
        colors={['transparent', 'rgba(251, 191, 36, 0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          top: height * 0.35,
          width: '100%',
          height: 1,
        }}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(251, 191, 36, 0.2)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          top: height * 0.65,
          width: '100%',
          height: 1,
        }}
      />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <View style={{ width: '100%', maxWidth: maxContentWidth, alignItems: 'center' }}>
          
          {/* Main Coin Section with One-Time Glitter Burst */}
          <Animated.View 
            style={[
              animatedGlowStyle, 
              { 
                position: 'relative', 
                marginBottom: isTablet ? 30 : isSmallDevice ? 15 : 20 
              }
            ]}
          >
            {/* Golden Glitter Burst - Appears once on load */}
            <View 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 1,
                height: 1,
              }}
              pointerEvents="none"
            >
              {glitterParticles.map((particle) => (
                <GlitterParticle
                  key={particle.id}
                  delay={1200 + particle.delay}
                  angle={particle.angle}
                  radius={particle.radius}
                  size={particle.size}
                />
              ))}
            </View>

            {/* Multiple Glow Rings for depth */}
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.5)', 'rgba(217, 119, 6, 0.3)', 'transparent']}
              style={{
                position: 'absolute',
                top: isTablet ? -50 : -40,
                left: isTablet ? -50 : -40,
                right: isTablet ? -50 : -40,
                bottom: isTablet ? -50 : -40,
                borderRadius: 999,
              }}
            />
            
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.3)', 'transparent']}
              style={{
                position: 'absolute',
                top: isTablet ? -80 : -60,
                left: isTablet ? -80 : -60,
                right: isTablet ? -80 : -60,
                bottom: isTablet ? -80 : -60,
                borderRadius: 999,
              }}
            />
            
            {/* Animated Coin */}
            <Animated.Image
              source={require('../../assets/images/Gold-icon.png')}
              style={[
                { 
                  width: gifSize, 
                  height: gifSize,
                  zIndex: 10,
                },
                animatedCoinStyle
              ]}
              resizeMode="contain"
            />
          </Animated.View>

          {/* BookKit Rewards Pill */}
          <Animated.View entering={FadeInDown.delay(1500).springify()}>
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.25)', 'rgba(217, 119, 6, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                borderWidth: 1.5,
                borderColor: 'rgba(251, 191, 36, 0.4)',
                paddingHorizontal: badgePaddingH,
                paddingVertical: badgePaddingV,
                marginBottom: badgeMarginBottom,
                minWidth: isTablet ? 280 : isLargeDevice ? 240 : 200,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#fbbf24',
                  fontSize: badgeFontSize,
                  fontWeight: '800',
                  letterSpacing: isSmallDevice ? 2 : 3,
                }}
              >
                {displayedText}
                {displayedText.length < fullText.length && showCursor && (
                  <Text style={{ color: '#fbbf24' }}>|</Text>
                )}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Text Section */}
          <Animated.View 
            entering={FadeInDown.delay(3000).springify()} 
            style={{ 
              alignItems: 'center', 
              width: '100%',
              paddingHorizontal: isSmallDevice ? 16 : 24,
            }}
          >
            <Text 
              style={{
                color: '#fbbf24',
                fontSize: titleSize,
                fontWeight: '900',
                textAlign: 'center',
                marginBottom: isSmallDevice ? 8 : 12,
                lineHeight: titleSize * 1.2,
                letterSpacing: 0.5,
              }}
            >
              Something{' '}
              <Text 
                style={{
                  color: '#f59e0b',
                  textShadowColor: 'rgba(245, 158, 11, 0.7)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 30,
                }}
              >
                Golden
              </Text>
            </Text>
            <Text 
              style={{
                color: '#fbbf24',
                fontSize: titleSize,
                fontWeight: '900',
                textAlign: 'center',
                marginBottom: isTablet ? 40 : isLargeDevice ? 30 : isMediumDevice ? 25 : 20,
                lineHeight: titleSize * 1.2,
                letterSpacing: 0.5,
              }}
            >
              Is Coming Soon
            </Text>
            
            <Text 
              style={{
                color: '#d97706',
                textAlign: 'center',
                fontSize: descriptionSize,
                lineHeight: descriptionSize * 1.6,
                marginBottom: isTablet ? 70 : isLargeDevice ? 60 : isMediumDevice ? 50 : 45,
                paddingHorizontal: isSmallDevice ? 12 : isTablet ? 80 : 20,
                fontWeight: '500',
              }}
            >
              Get ready to earn rewards while you read.{'\n'}
              Your reading journey is about to get richer.
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            entering={FadeInDown.delay(3200).springify()} 
            style={{ 
              width: '100%', 
              maxWidth: isTablet ? 500 : '92%',
              paddingHorizontal: isSmallDevice ? 0 : 8,
            }}
          >
            {/* Stay Tuned Button - Routes to Profile */}
            <LinearGradient
              colors={['#fbbf24', '#f59e0b', '#d97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                shadowColor: '#fbbf24',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <TouchableOpacity 
                style={{
                  width: '100%',
                  paddingVertical: isTablet ? 20 : isLargeDevice ? 18 : 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.85}
                
              >
                <Text 
                  style={{
                    color: '#0f172a',
                    fontWeight: '800',
                    fontSize: isTablet ? 22 : isLargeDevice ? 19 : isMediumDevice ? 18 : 17,
                    marginRight: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  Stay Tuned
                </Text>
                <Ionicons 
                  name="notifications-outline" 
                  size={isTablet ? 26 : isLargeDevice ? 22 : 20} 
                  color="#0f172a" 
                />
              </TouchableOpacity>
            </LinearGradient>
            
            {/* Go Back Home Button */}
            <TouchableOpacity 
              style={{ marginTop: isTablet ? 24 : 20 }}
              onPress={() => router.back()}
            >
              <Text 
                style={{
                  color: '#92400e',
                  fontSize: isTablet ? 17 : isLargeDevice ? 15 : 14,
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: 0.3,
                }}
              >
                Go Back Home
              </Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});