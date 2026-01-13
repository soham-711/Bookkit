import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpload } from "../../Context/UploadContext";
import { supabase } from "../../Utils/supabase";

// Enhanced scaling functions with better device support
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number, width: number) =>
  (width / guidelineBaseWidth) * size;
const verticalScale = (size: number, height: number) =>
  (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, width: number, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

// Improved normalize function for better pixel density handling
const normalize = (size: number, width: number) => {
  const newSize = moderateScale(size, width);
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

interface AddressType {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  icon: string;
  isDefault?: boolean;
}

const UploadScreen3 = () => {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);
  const { state, dispatch } = useUpload();

  const [photos, setPhotos] = useState<(string | null)[]>(Array(8).fill(null));
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isLocationSaved, setIsLocationSaved] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true); // Add this line
  // Initialize photos from context and fetch addresses

  useEffect(() => {
    // Initialize photos from context
    if (state.images.length > 0) {
      const newPhotos = [...Array(8).fill(null)];
      state.images.forEach((img, index) => {
        if (index < 8) {
          newPhotos[index] = img;
        }
      });
      setPhotos(newPhotos);
    }

    // Initialize location from context
    if (state.pickupAddressText) {
      setSelectedLocation(state.pickupAddressText);
      setIsLocationSaved(true);
    }

    // Fetch addresses from database
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true); // Add this
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          Alert.alert("Error", "User not logged in");
          setIsLoadingAddresses(false); // Add this
          return;
        }

        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching addresses:", error);
          // Use default addresses if database fetch fails
          setAddresses([
            {
              id: "1",
              name: "Home",
              address: "Sample Address",
              latitude: null,
              longitude: null,
              icon: "home",
            },
          ]);
          return;
        }

        const formattedAddresses: AddressType[] = data.map((addr) => ({
          id: addr.id,
          name: addr.address_type ?? "Home",
          address: addr.full_address,
          latitude: addr.latitude,
          longitude: addr.longitude,
          icon:
            addr.address_type === "work"
              ? "briefcase"
              : addr.address_type === "other"
              ? "location"
              : "home",
          isDefault: addr.is_default,
        }));

        setAddresses(formattedAddresses);

        // Set default address if available and not already set
        const defaultAddress = formattedAddresses.find(
          (addr) => addr.isDefault
        );
        if (defaultAddress && !state.pickupAddressId) {
          setSelectedLocation(defaultAddress.address);

          dispatch({
            type: "SET_FIELD",
            field: "pickupAddressText",
            value: defaultAddress.address,
          });
          dispatch({
            type: "SET_FIELD",
            field: "pickupAddressId",
            value: defaultAddress.id,
          });
          dispatch({
            type: "SET_FIELD",
            field: "pickupLatitude",
            value: defaultAddress.latitude,
          });
          dispatch({
            type: "SET_FIELD",
            field: "pickupLongitude",
            value: defaultAddress.longitude,
          });

          setIsLocationSaved(true);
        }
      } catch (error) {
        console.error("Error in fetchAddresses:", error);
        // Use default addresses on error
        setAddresses([
          {
            id: "1",
            name: "Home",
            address: "Sample Address",
            latitude: null,
            longitude: null,
            icon: "home",
          },
        ]);
        setIsLoadingAddresses(false); // Add this
      } finally {
        setIsLoadingAddresses(false); // Add this
      }
    };

    fetchAddresses();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (cameraStatus !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permission to take photos."
      );
      return false;
    }
    return true;
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const photoCount = photos.filter((p) => p !== null).length;

    if (photoCount >= 8) {
      Alert.alert("Limit Reached", "You can only upload up to 8 photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      await simulateUpload();

      setPhotos((prev) => {
        const newPhotos = [...prev];
        const firstEmptyIndex = newPhotos.findIndex((p) => p === null);
        if (firstEmptyIndex !== -1) {
          newPhotos[firstEmptyIndex] = result.assets[0].uri;
        }
        return newPhotos;
      });

      // Update context
      dispatch({ type: "ADD_IMAGES", images: [result.assets[0].uri] });

      // Check if first 3 required photos are complete
      const newPhotos = [...photos];
      const firstEmptyIndex = newPhotos.findIndex((p) => p === null);
      if (firstEmptyIndex !== -1) {
        newPhotos[firstEmptyIndex] = result.assets[0].uri;
      }
      const requiredPhotosComplete =
        newPhotos[0] !== null && newPhotos[1] !== null && newPhotos[2] !== null;
      if (requiredPhotosComplete) {
        setShowPhotoModal(false);
      }
    }
  };

  // Enhanced removePhoto function for required photos
  const removePhoto = (index: number) => {
    // Special handling for first 3 photos (required photos)
    if (index < 3) {
      const photoNames = ["front cover", "back cover", "index/first page"];
      Alert.alert(
        "Remove Required Photo?",
        `This is the ${photoNames[index]} photo. You must re-upload this photo before proceeding to the next page. The position will remain empty until you upload a new photo.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              const photoToRemove = photos[index];
              if (!photoToRemove) return;

              setPhotos((prev) => {
                const newPhotos = [...prev];
                newPhotos[index] = null;
                return newPhotos;
              });

              // Update context by removing the specific image
              dispatch({ type: "REMOVE_IMAGE", uri: photoToRemove });

              // Show alert to re-upload after a short delay
              setTimeout(() => {
                Alert.alert(
                  "Photo Required",
                  `Please upload the ${photoNames[index]} photo to complete your listing.`,
                  [
                    {
                      text: "Upload Now",
                      onPress: () => setShowPhotoModal(true),
                    },
                  ]
                );
              }, 500);
            },
          },
        ]
      );
    } else {
      // Regular removal for optional photos (4-8)
      const photoToRemove = photos[index];
      if (!photoToRemove) return;

      setPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[index] = null;
        return newPhotos;
      });

      // Update context by removing the specific image
      dispatch({ type: "REMOVE_IMAGE", uri: photoToRemove });
    }
  };

  const handleUploadPress = () => {
    setShowPhotoModal(true);
  };

  const handleLocationSave = () => {
    if (selectedLocation.trim() === "") {
      Alert.alert("Error", "Please select a location");
      return;
    }
    setIsLocationSaved(true);
    dispatch({
      type: "SET_FIELD",
      field: "pickupAddressText",
      value: selectedLocation,
    });
  };

  const handleChangeLocation = () => {
    setIsLocationSaved(false);
    setShowLocationModal(true);
  };

  const handleSelectLocation = (selectedAddress: AddressType) => {
    setIsLoadingAddresses(false); // Add this line
    setSelectedLocation(selectedAddress.address);
    setShowLocationModal(false);
    setIsLocationSaved(false);

    // Update context with selected address
    dispatch({
      type: "SET_FIELD",
      field: "pickupAddressText",
      value: selectedAddress.address,
    });

    dispatch({
      type: "SET_FIELD",
      field: "pickupAddressId",
      value: selectedAddress.id,
    });

    dispatch({
      type: "SET_FIELD",
      field: "pickupLatitude",
      value: selectedAddress.latitude,
    });

    dispatch({
      type: "SET_FIELD",
      field: "pickupLongitude",
      value: selectedAddress.longitude,
    });
  };

  const handleOpenMap = () => {
    setIsLoadingAddresses(false);
    setShowLocationModal(false);
    router.push({
      pathname: "/(screen)/UserCurrentLocation",
      params: {
        returnTo: "UploadScreen3",
      },
    });
  };

  // Check if first 3 required photos are uploaded
  const requiredPhotosUploaded =
    photos[0] !== null && photos[1] !== null && photos[2] !== null;
  const requiredPhotoCount = [photos[0], photos[1], photos[2]].filter(
    (p) => p !== null
  ).length;
  const optionalPhotoCount = photos.slice(3).filter((p) => p !== null).length;
  const isFormValid = requiredPhotosUploaded && isLocationSaved;

  // Enhanced handleNext function
  const handleNext = () => {
    if (!requiredPhotosUploaded) {
      const missingPhotos = [];
      if (!photos[0]) missingPhotos.push("front cover");
      if (!photos[1]) missingPhotos.push("back cover");
      if (!photos[2]) missingPhotos.push("index/first page");

      Alert.alert(
        "Required Photos Missing",
        `Please upload the following photos: ${missingPhotos.join(", ")}.`,
        [{ text: "Upload Now", onPress: () => setShowPhotoModal(true) }]
      );
      return;
    }

    if (!isLocationSaved) {
      Alert.alert("Location Required", "Please save your pickup location.");
      return;
    }

    if (isFormValid) {
      const validPhotos = photos.filter((p) => p !== null) as string[];

      // Navigate to next screen
      router.push("/(screen)/Preview");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;

  const renderLocationItem = ({ item }: { item: AddressType }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleSelectLocation(item)}
      activeOpacity={0.7}
    >
      <View style={styles.locationItemIcon}>
        <Ionicons
          name={item.icon as any}
          size={moderateScale(22, width)}
          color="#0891B2"
        />
      </View>
      <View style={styles.locationItemContent}>
        <Text style={styles.locationItemName}>{item.name}</Text>
        <Text style={styles.locationItemAddress} numberOfLines={2}>
          {item.address}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={moderateScale(20, width)}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#ffffff", "#f2fbfbff"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* ---------- FIXED HEADER ---------- */}
              <View style={styles.header}>
                <Ionicons
                  name="arrow-back-outline"
                  size={24}
                  color="#131E1E"
                  onPress={handleBack}
                />
                <Text style={styles.headerTitle}>Shear Books</Text>
              </View>

              {/* ---------- FIXED BANNER ---------- */}
              <View style={styles.bannerWrapper}>
                <Image
                  source={require("../../assets/images/donate-book3.png")}
                  style={[styles.bannerImage, { width: width - 32 }]}
                  resizeMode="stretch"
                />
              </View>

              {/* ---------- SCROLLABLE FORM ---------- */}
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scrollView}
              >
                {/* ---------- FORM CARD ---------- */}
                <View style={styles.formCard}>
                  <Text style={styles.sectionTitle}>D. Upload Photos</Text>

                  <Text style={styles.noteText}>
                    <Text style={styles.noteBold}>Note:</Text> Please upload
                    photos of the front cover, back cover, and index page. If
                    there are any torn or damaged pages, upload clear photos of
                    the defects.
                  </Text>

                  {/* Photo Grid with Empty Placeholders */}
                  <View style={styles.photoGrid}>
                    {/* Always show first 3 required photo slots */}
                    {photos.slice(0, 3).map((photo, index) => (
                      <View
                        key={`required-${index}`}
                        style={styles.photoContainer}
                      >
                        {photo ? (
                          <>
                            <Image
                              source={{ uri: photo }}
                              style={styles.photoThumbnail}
                            />
                            <View style={styles.photoLabel}>
                              <Text style={styles.photoLabelText}>
                                {index === 0
                                  ? "Cover"
                                  : index === 1
                                  ? "Back"
                                  : "Index"}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.removePhotoButton}
                              onPress={() => removePhoto(index)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons
                                name="close-circle"
                                size={normalize(24, width)}
                                color="#EF4444"
                              />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View style={styles.emptyPhotoSlot}>
                            <Ionicons
                              name={
                                index === 0
                                  ? "book"
                                  : index === 1
                                  ? "book-outline"
                                  : "document-text"
                              }
                              size={normalize(32, width)}
                              color="#9CA3AF"
                            />
                            <Text style={styles.emptyPhotoText}>
                              {index === 0
                                ? "Front"
                                : index === 1
                                ? "Back"
                                : "Index"}
                            </Text>
                            <TouchableOpacity
                              style={styles.uploadEmptySlot}
                              onPress={() => setShowPhotoModal(true)}
                            >
                              <Text style={styles.uploadEmptySlotText}>
                                Upload
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}

                    {/* Show uploaded optional photos (4-8) */}
                    {photos.slice(3).map((photo, index) => {
                      if (!photo) return null;
                      const actualIndex = index + 3;

                      return (
                        <View
                          key={`optional-${actualIndex}`}
                          style={styles.photoContainer}
                        >
                          <Image
                            source={{ uri: photo }}
                            style={styles.photoThumbnail}
                          />
                          <View style={styles.photoLabel}>
                            <Text style={styles.photoLabelText}>
                              Page {index + 1}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={() => removePhoto(actualIndex)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name="close-circle"
                              size={normalize(24, width)}
                              color="#EF4444"
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.uploadArea}
                    onPress={handleUploadPress}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={normalize(48, width)}
                      color="#374151"
                    />
                    <Text style={styles.uploadText}>
                      Take photos of your book
                    </Text>
                    <Text style={styles.uploadSubtext}>
                      Minimum 3 photos required
                    </Text>
                    <TouchableOpacity
                      style={styles.browseButton}
                      onPress={handleUploadPress}
                    >
                      <Text style={styles.browseButtonText}>Start Camera</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Photo Counter */}
                  <Text style={styles.photoCounter}>
                    {requiredPhotosUploaded ? "✓ " : ""}
                    Required photos: {requiredPhotoCount} / 3
                    {optionalPhotoCount > 0 &&
                      ` (+${optionalPhotoCount} optional)`}
                  </Text>

                  {/* Divider */}
                  <View style={styles.sectionDivider} />

                  {/* Pickup Location Section */}
                  {/* Pickup Location Section */}
                  <Text style={styles.sectionTitle}>E. Pickup Location</Text>

                  {isLoadingAddresses ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons
                        name="time-outline"
                        size={moderateScale(24, width)}
                        color="#003EF9"
                      />
                      <Text style={styles.loadingText}>
                        Loading addresses...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.locationDisplayBox}>
                        <View style={styles.locationIconWrapper}>
                          <Ionicons
                            name="location"
                            size={moderateScale(24, width)}
                            color="#000"
                          />
                        </View>
                        <Text style={styles.locationText} numberOfLines={3}>
                          {selectedLocation || "No address selected"}
                        </Text>
                      </View>

                      <View style={styles.dividerLine} />

                      {!isLocationSaved ? (
                        <View style={styles.locationButtons}>
                          <TouchableOpacity
                            style={styles.changeLocationButton}
                            onPress={handleChangeLocation}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.changeLocationText}>
                              Change Location
                            </Text>
                          </TouchableOpacity>

                          <View style={styles.verticalDivider} />

                          <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleLocationSave}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.saveButtonText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.savedButton}
                          onPress={handleChangeLocation}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.savedButtonText}>Saved</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>

                {/* ---------- NEXT BUTTON ---------- */}
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !isFormValid && styles.nextButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={!isFormValid}
                >
                  <Text
                    style={[
                      styles.nextText,
                      !isFormValid && styles.nextTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
                <View style={styles.buttonSpacer} />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>

          {/* ---------- PHOTO UPLOAD MODAL ---------- */}
          <Modal
            visible={showPhotoModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
              if (requiredPhotosUploaded) {
                setShowPhotoModal(false);
              } else {
                Alert.alert(
                  "Minimum Required",
                  "Please upload at least 3 photos before closing."
                );
              }
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.locationModalTitle}>Upload Photos</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (requiredPhotosUploaded) {
                        setShowPhotoModal(false);
                      } else {
                        Alert.alert(
                          "Minimum Required",
                          "Please upload at least 3 photos before closing."
                        );
                      }
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close"
                      size={moderateScale(28, width)}
                      color="#374151"
                    />
                  </TouchableOpacity>
                </View>

                {/* Step Progress */}
                <View style={styles.stepProgressContainer}>
                  <View style={styles.stepProgressHeader}>
                    <Text style={styles.stepProgressTitle}>
                      {requiredPhotoCount === 0 && "Step 1: Upload Front Cover"}
                      {requiredPhotoCount === 1 && "Step 2: Upload Back Cover"}
                      {requiredPhotoCount === 2 &&
                        "Step 3: Upload Index/First Page"}
                      {requiredPhotoCount >= 3 && "✓ Required Photos Complete"}
                    </Text>
                    <Text style={styles.stepProgressCount}>
                      {requiredPhotoCount} / 3
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <Animated.View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(
                              (requiredPhotoCount / 3) * 100,
                              100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.stepIndicators}>
                    <View style={styles.stepIndicatorItem}>
                      <View
                        style={[
                          styles.stepDot,
                          photos[0] !== null && styles.stepDotComplete,
                          photos[0] === null && styles.stepDotActive,
                        ]}
                      >
                        {photos[0] !== null ? (
                          <Ionicons
                            name="checkmark"
                            size={moderateScale(14, width)}
                            color="#fff"
                          />
                        ) : (
                          <Text
                            style={[
                              styles.stepDotNumber,
                              photos[0] === null && styles.stepDotNumberActive,
                            ]}
                          >
                            1
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          photos[0] !== null && styles.stepLabelComplete,
                          photos[0] === null && styles.stepLabelActive,
                        ]}
                      >
                        Front
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.stepConnector,
                        photos[1] !== null && styles.stepConnectorComplete,
                      ]}
                    />

                    <View style={styles.stepIndicatorItem}>
                      <View
                        style={[
                          styles.stepDot,
                          photos[1] !== null && styles.stepDotComplete,
                          photos[0] !== null &&
                            photos[1] === null &&
                            styles.stepDotActive,
                        ]}
                      >
                        {photos[1] !== null ? (
                          <Ionicons
                            name="checkmark"
                            size={moderateScale(14, width)}
                            color="#fff"
                          />
                        ) : (
                          <Text
                            style={[
                              styles.stepDotNumber,
                              photos[0] !== null &&
                                photos[1] === null &&
                                styles.stepDotNumberActive,
                            ]}
                          >
                            2
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          photos[1] !== null && styles.stepLabelComplete,
                          photos[0] !== null &&
                            photos[1] === null &&
                            styles.stepLabelActive,
                        ]}
                      >
                        Back
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.stepConnector,
                        photos[2] !== null && styles.stepConnectorComplete,
                      ]}
                    />

                    <View style={styles.stepIndicatorItem}>
                      <View
                        style={[
                          styles.stepDot,
                          photos[2] !== null && styles.stepDotComplete,
                          photos[0] !== null &&
                            photos[1] !== null &&
                            photos[2] === null &&
                            styles.stepDotActive,
                        ]}
                      >
                        {photos[2] !== null ? (
                          <Ionicons
                            name="checkmark"
                            size={moderateScale(14, width)}
                            color="#fff"
                          />
                        ) : (
                          <Text
                            style={[
                              styles.stepDotNumber,
                              photos[0] !== null &&
                                photos[1] !== null &&
                                photos[2] === null &&
                                styles.stepDotNumberActive,
                            ]}
                          >
                            3
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          photos[2] !== null && styles.stepLabelComplete,
                          photos[0] !== null &&
                            photos[1] !== null &&
                            photos[2] === null &&
                            styles.stepLabelActive,
                        ]}
                      >
                        Index
                      </Text>
                    </View>
                  </View>
                </View>

                {isUploading && (
                  <View style={styles.uploadProgressContainer}>
                    <View style={styles.progressHeader}>
                      <Ionicons
                        name="cloud-upload-outline"
                        size={moderateScale(20, width)}
                        color="#0891B2"
                      />
                      <Text style={styles.progressText}>
                        Uploading... {uploadProgress}%
                      </Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${uploadProgress}%` },
                        ]}
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.mapOption,
                    isUploading && styles.mapOptionDisabled,
                  ]}
                  onPress={takePhoto}
                  activeOpacity={0.7}
                  disabled={isUploading}
                >
                  <View style={styles.mapIconWrapper}>
                    <Ionicons
                      name="camera"
                      size={moderateScale(24, width)}
                      color="#0891B2"
                    />
                  </View>
                  <View style={styles.mapOptionContent}>
                    <Text style={styles.mapOptionTitle}>Open Camera</Text>
                    <Text style={styles.mapOptionSubtitle}>
                      {requiredPhotoCount === 0 &&
                        "Take a clear photo of the front cover"}
                      {requiredPhotoCount === 1 &&
                        "Take a clear photo of the back cover"}
                      {requiredPhotoCount === 2 &&
                        "Take a clear photo of the index/first page"}
                      {requiredPhotoCount >= 3 &&
                        "Add more photos (optional - torn/damaged pages)"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(20, width)}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>

                <View style={styles.photoInfoSection}>
                  <View style={styles.photoInfoItem}>
                    <Ionicons
                      name="images-outline"
                      size={moderateScale(20, width)}
                      color="#6B7280"
                    />
                    <Text style={styles.photoInfoText}>
                      {requiredPhotoCount + optionalPhotoCount} / 8 photos
                      captured
                    </Text>
                  </View>
                  <View style={styles.photoInfoItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={moderateScale(20, width)}
                      color={requiredPhotosUploaded ? "#16A34A" : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.photoInfoText,
                        requiredPhotosUploaded && styles.photoInfoTextSuccess,
                      ]}
                    >
                      Minimum 3 photos{" "}
                      {requiredPhotosUploaded ? "completed" : "required"}
                    </Text>
                  </View>
                </View>

                <View style={styles.dividerWithText}>
                  <View style={styles.dividerLineShort} />
                  <Text style={styles.dividerText}>PHOTO REQUIREMENTS</Text>
                  <View style={styles.dividerLineShort} />
                </View>

                <ScrollView
                  style={styles.requirementsScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.requirementsList}>
                    <View style={styles.requirementItem}>
                      <View
                        style={[
                          styles.requirementIconCircle,
                          photos[0] !== null &&
                            styles.requirementIconCircleComplete,
                        ]}
                      >
                        <Ionicons
                          name={photos[0] !== null ? "checkmark" : "book"}
                          size={moderateScale(18, width)}
                          color={photos[0] !== null ? "#16A34A" : "#0891B2"}
                        />
                      </View>
                      <View style={styles.requirementContent}>
                        <Text style={styles.requirementTitle}>
                          Front Cover {photos[0] !== null && "✓"}
                        </Text>
                        <Text style={styles.requirementDescription}>
                          Clear photo of the front cover
                        </Text>
                      </View>
                    </View>

                    <View style={styles.requirementItem}>
                      <View
                        style={[
                          styles.requirementIconCircle,
                          photos[1] !== null &&
                            styles.requirementIconCircleComplete,
                        ]}
                      >
                        <Ionicons
                          name={
                            photos[1] !== null ? "checkmark" : "book-outline"
                          }
                          size={moderateScale(18, width)}
                          color={photos[1] !== null ? "#16A34A" : "#0891B2"}
                        />
                      </View>
                      <View style={styles.requirementContent}>
                        <Text style={styles.requirementTitle}>
                          Back Cover {photos[1] !== null && "✓"}
                        </Text>
                        <Text style={styles.requirementDescription}>
                          Clear photo of the back cover
                        </Text>
                      </View>
                    </View>

                    <View style={styles.requirementItem}>
                      <View
                        style={[
                          styles.requirementIconCircle,
                          photos[2] !== null &&
                            styles.requirementIconCircleComplete,
                        ]}
                      >
                        <Ionicons
                          name={
                            photos[2] !== null ? "checkmark" : "document-text"
                          }
                          size={moderateScale(18, width)}
                          color={photos[2] !== null ? "#16A34A" : "#0891B2"}
                        />
                      </View>
                      <View style={styles.requirementContent}>
                        <Text style={styles.requirementTitle}>
                          Index/First Page {photos[2] !== null && "✓"}
                        </Text>
                        <Text style={styles.requirementDescription}>
                          Photo of the first or index page
                        </Text>
                      </View>
                    </View>

                    <View style={styles.requirementItem}>
                      <View style={styles.requirementIconCircle}>
                        <Ionicons
                          name="albums"
                          size={moderateScale(18, width)}
                          color="#9CA3AF"
                        />
                      </View>
                      <View style={styles.requirementContent}>
                        <Text style={styles.requirementTitle}>
                          Additional Pages (Optional)
                        </Text>
                        <Text style={styles.requirementDescription}>
                          Photos of torn or damaged pages
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                {/* Next Button */}
                {requiredPhotosUploaded && (
                  <TouchableOpacity
                    style={styles.nextButtonModal}
                    onPress={() => setShowPhotoModal(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonModalText}>Next</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>

          {/* ---------- LOCATION SELECTION MODAL ---------- */}
          <Modal
            visible={showLocationModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowLocationModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.locationModalTitle}>Select Location</Text>
                  <TouchableOpacity
                    onPress={() => setShowLocationModal(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close"
                      size={moderateScale(28, width)}
                      color="#374151"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.mapOption}
                  onPress={handleOpenMap}
                  activeOpacity={0.7}
                >
                  <View style={styles.mapIconWrapper}>
                    <Ionicons
                      name="map"
                      size={moderateScale(24, width)}
                      color="#0891B2"
                    />
                  </View>
                  <View style={styles.mapOptionContent}>
                    <Text style={styles.mapOptionTitle}>Choose on Map</Text>
                    <Text style={styles.mapOptionSubtitle}>
                      Select your location by moving the map
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(20, width)}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>

                <View style={styles.dividerWithText}>
                  <View style={styles.dividerLineShort} />
                  <Text style={styles.dividerText}>OR SELECT FROM SAVED</Text>
                  <View style={styles.dividerLineShort} />
                </View>

                <FlatList
                  data={addresses}
                  renderItem={renderLocationItem}
                  keyExtractor={(item) => item.id}
                  style={styles.locationList}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.itemSeparator} />
                  )}
                />
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default UploadScreen3;

const makeStyles = (width: number, height: number) => {
  // Enhanced responsive breakpoints
  const isExtraSmall = width < 340;
  const isSmall = width >= 340 && width < 375;
  const isMedium = width >= 375 && width < 414;
  const isLarge = width >= 414 && width < 480;
  const isExtraLarge = width >= 480;

  const aspectRatio = height / width;
  const isNarrow = aspectRatio > 2.1;
  const isWide = aspectRatio < 1.8;

  // Adaptive padding
  const sidePad = isExtraSmall
    ? 10
    : isSmall
    ? 14
    : isMedium
    ? clamp(moderateScale(18, width), 16, 22)
    : isLarge
    ? clamp(moderateScale(22, width), 18, 26)
    : clamp(moderateScale(26, width), 22, 32);

  const cardPadding = isExtraSmall
    ? 14
    : isSmall
    ? 16
    : clamp(moderateScale(20, width), 16, 26);

  // Photo grid calculations
  const availableWidth = width - sidePad * 2 - cardPadding * 2;
  const photoGap = isExtraSmall
    ? 6
    : isSmall
    ? 8
    : clamp(moderateScale(12, width), 8, 16);
  const photosPerRow = isExtraSmall ? 2 : 3;
  const totalGaps = (photosPerRow - 1) * photoGap;
  const photoSize = Math.floor((availableWidth - totalGaps) / photosPerRow);

  const minTouchTarget = Platform.OS === "ios" ? 44 : 48;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: Platform.OS === "ios" ? 20 : 10,
    },

    /* Header - Same as UploadScreen2 */
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "transparent",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "400",
      marginLeft: 10,
    },

    /* Banner - Same as UploadScreen2 */
    bannerWrapper: {
      alignItems: "center",
      marginVertical: 8,
      backgroundColor: "transparent",
    },
    bannerImage: {
      height: 160,
      borderRadius: 9,
      elevation: 10,
    },

    /* Form Card - Same style as UploadScreen2 */
    formCard: {
      backgroundColor: "#a5f3fc99",
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: Platform.OS === "ios" ? 20 : 10,
      borderRadius: 14,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 20,
      color: "#000000E0",
    },

    /* Note Box - Same style as UploadScreen2 */
    noteText: {
      fontSize: 11,
      color: "#4b5563",
      lineHeight: 16,
      marginBottom: 4,
    },
    noteBold: {
      fontWeight: "700",
    },

    /* Photo Grid */
    photoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: photoGap,
      marginBottom: clamp(moderateScale(14, width), 12, 20),
    },
    photoContainer: {
      position: "relative",
      width: photoSize,
      height: photoSize,
    },
    photoThumbnail: {
      width: "100%",
      height: "100%",
      borderRadius: clamp(moderateScale(10, width), 6, 14),
      backgroundColor: "#f3f4f6",
    },
    emptyPhotoSlot: {
      width: "100%",
      height: "100%",
      borderRadius: clamp(moderateScale(10, width), 6, 14),
      backgroundColor: "#F3F4F6",
      borderWidth: 2,
      borderColor: "#E5E7EB",
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      padding: clamp(moderateScale(8, width), 6, 12),
    },
    emptyPhotoText: {
      fontSize: clamp(normalize(9, width), 8, 12),
      color: "#6B7280",
      fontWeight: "600",
      marginTop: clamp(moderateScale(4, width), 3, 6),
      textAlign: "center",
    },
    uploadEmptySlot: {
      marginTop: clamp(moderateScale(4, width), 3, 6),
      backgroundColor: "#0891B2",
      paddingHorizontal: clamp(moderateScale(8, width), 6, 12),
      paddingVertical: clamp(moderateScale(3, width), 2, 5),
      borderRadius: clamp(moderateScale(4, width), 3, 6),
    },
    uploadEmptySlotText: {
      fontSize: clamp(normalize(8, width), 7, 11),
      color: "#FFFFFF",
      fontWeight: "600",
    },
    photoLabel: {
      position: "absolute",
      bottom: 3,
      left: 3,
      right: 3,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      paddingVertical: 2,
      paddingHorizontal: 3,
      borderRadius: 3,
    },
    photoLabelText: {
      fontSize: clamp(normalize(8, width), 7, 11),
      color: "#FFFFFF",
      fontWeight: "600",
      textAlign: "center",
    },
    removePhotoButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "#fff",
      borderRadius: 12,
      width: clamp(moderateScale(24, width), 20, 28),
      height: clamp(moderateScale(24, width), 20, 28),
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: moderateScale(16, width),
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      borderRadius: moderateScale(12, width),
      marginBottom: moderateScale(16, width),
    },
    loadingText: {
      fontSize: normalize(14, width),
      color: "#666666",
      marginLeft: moderateScale(8, width),
    },
    /* Upload Area */
    uploadArea: {
      borderWidth: 2,
      borderColor: "#44D6FF",
      borderStyle: "dashed",
      borderRadius: clamp(moderateScale(12, width), 8, 18),
      padding: clamp(moderateScale(20, width), 16, 32),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.36)",
      marginBottom: clamp(moderateScale(10, width), 8, 16),
      minHeight: isExtraSmall ? 160 : isSmall ? 180 : 200,
    },
    uploadText: {
      fontSize: clamp(normalize(13, width), 11, 17),
      color: "#374151",
      fontWeight: "600",
      marginTop: clamp(moderateScale(10, width), 8, 16),
      marginBottom: clamp(moderateScale(3, width), 2, 6),
      textAlign: "center",
      paddingHorizontal: 6,
    },
    uploadSubtext: {
      fontSize: clamp(normalize(10, width), 9, 13),
      color: "#6b7280",
      marginBottom: clamp(moderateScale(14, width), 12, 20),
      textAlign: "center",
      paddingHorizontal: 6,
    },
    browseButton: {
      backgroundColor: "rgba(68, 214, 255, 0.5)",
      paddingHorizontal: clamp(moderateScale(18, width), 14, 32),
      paddingVertical: clamp(moderateScale(9, width), 7, 14),
      borderRadius: clamp(moderateScale(8, width), 6, 12),
      borderWidth: 1,
      borderColor: "#44D6FF",
      minHeight: minTouchTarget,
      justifyContent: "center",
    },
    browseButtonText: {
      fontSize: clamp(normalize(12, width), 11, 16),
      color: "#1f2937",
      fontWeight: "600",
    },
    photoCounter: {
      fontSize: clamp(normalize(11, width), 10, 14),
      color: "#0c64f0ff",
      fontWeight: "600",
      textAlign: "center",
      marginBottom: clamp(moderateScale(16, width), 12, 24),
    },
    sectionDivider: {
      height: 1,
      backgroundColor: "rgba(0,0,0,0.15)",
      marginVertical: clamp(moderateScale(20, width), 16, 28),
    },

    /* Location Section */
    locationDisplayBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: clamp(moderateScale(12, width), 10, 16),
    },
    locationIconWrapper: {
      marginRight: clamp(moderateScale(10, width), 8, 14),
      marginTop: clamp(moderateScale(2, width), 1, 4),
    },
    locationText: {
      flex: 1,
      fontSize: clamp(normalize(12, width), 11, 15),
      color: "#1f2937",
      lineHeight: clamp(normalize(17, width), 15, 20),
      fontWeight: "500",
    },
    dividerLine: {
      height: 1,
      backgroundColor: "rgba(0,0,0,0.1)",
      width: "100%",
      marginBottom: 0,
    },
    locationButtons: {
      flexDirection: "row",
      alignItems: "center",
      height: clamp(moderateScale(52, width), 46, 60),
      backgroundColor: "rgba(255,255,255,0.4)",
      borderBottomLeftRadius: clamp(moderateScale(12, width), 8, 16),
      borderBottomRightRadius: clamp(moderateScale(12, width), 8, 16),
    },
    changeLocationButton: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    changeLocationText: {
      fontSize: clamp(normalize(13, width), 12, 16),
      color: "#003EF9",
      fontWeight: "600",
    },
    verticalDivider: {
      width: 1,
      height: "60%",
      backgroundColor: "#9CA3AF",
    },
    saveButton: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonText: {
      fontSize: clamp(normalize(13, width), 12, 16),
      color: "#16A34A",
      fontWeight: "600",
    },
    savedButton: {
      width: "100%",
      height: clamp(moderateScale(52, width), 46, 60),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#16A34A",
      borderBottomLeftRadius: clamp(moderateScale(12, width), 8, 16),
      borderBottomRightRadius: clamp(moderateScale(12, width), 8, 16),
    },
    savedButtonText: {
      fontSize: clamp(normalize(15, width), 14, 18),
      color: "#FFFFFF",
      fontWeight: "700",
    },

    /* Next Button - Same as UploadScreen2 */
    nextButton: {
      backgroundColor: "rgba(20, 218, 232, 0.9)",
      marginHorizontal: 16,
      marginTop: 10,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.08)",
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    nextButtonDisabled: {
      backgroundColor: "rgba(156, 163, 175, 0.5)",
      elevation: 0,
      shadowOpacity: 0,
    },
    nextText: {
      fontSize: 16,
      fontWeight: "700",
      color: "rgba(255,255,255,0.78)",
    },
    nextTextDisabled: {
      color: "rgba(107, 114, 128, 0.7)",
    },
    buttonSpacer: {
      height: 60,
    },

    /* Modal Styles - Same as UploadScreen2 */
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: "#FFF",
      borderTopLeftRadius: clamp(moderateScale(22, width), 18, 32),
      borderTopRightRadius: clamp(moderateScale(22, width), 18, 32),
      maxHeight: height * 0.88,
      paddingBottom: Platform.OS === "ios" ? 34 : 20,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: clamp(moderateScale(18, width), 16, 26),
      paddingTop: clamp(moderateScale(18, width), 16, 26),
      paddingBottom: clamp(moderateScale(14, width), 12, 20),
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    },
    locationModalTitle: {
      fontSize: clamp(normalize(19, width), 17, 26),
      fontWeight: "700",
      color: "#1F2937",
    },

    /* Progress Steps */
    stepProgressContainer: {
      marginHorizontal: clamp(moderateScale(16, width), 14, 24),
      marginTop: clamp(moderateScale(14, width), 12, 20),
      marginBottom: clamp(moderateScale(10, width), 8, 16),
      padding: clamp(moderateScale(16, width), 14, 26),
      backgroundColor: "#F0F9FF",
      borderRadius: clamp(moderateScale(14, width), 12, 20),
      borderWidth: 2,
      borderColor: "#BAE6FD",
    },
    stepProgressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: clamp(moderateScale(14, width), 12, 20),
    },
    stepProgressTitle: {
      fontSize: clamp(normalize(14, width), 12, 18),
      fontWeight: "700",
      color: "#0891B2",
      flex: 1,
    },
    stepProgressCount: {
      fontSize: clamp(normalize(13, width), 12, 16),
      fontWeight: "600",
      color: "#64748B",
      marginLeft: 6,
    },
    progressBarContainer: {
      marginBottom: clamp(moderateScale(14, width), 12, 20),
    },
    progressBarBackground: {
      height: clamp(moderateScale(7, width), 5, 10),
      backgroundColor: "#E0F2FE",
      borderRadius: clamp(moderateScale(4, width), 3, 6),
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "#0891B2",
      borderRadius: clamp(moderateScale(4, width), 3, 6),
    },
    stepIndicators: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stepIndicatorItem: {
      alignItems: "center",
      gap: clamp(moderateScale(5, width), 3, 8),
    },
    stepDot: {
      width: clamp(moderateScale(30, width), 26, 38),
      height: clamp(moderateScale(30, width), 26, 38),
      borderRadius: clamp(moderateScale(15, width), 13, 19),
      backgroundColor: "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#D1D5DB",
    },
    stepDotActive: {
      backgroundColor: "#DBEAFE",
      borderColor: "#0891B2",
      borderWidth: 3,
    },
    stepDotComplete: {
      backgroundColor: "#16A34A",
      borderColor: "#16A34A",
    },
    stepDotNumber: {
      fontSize: clamp(normalize(13, width), 12, 16),
      fontWeight: "700",
      color: "#9CA3AF",
    },
    stepDotNumberActive: {
      color: "#0891B2",
      fontSize: clamp(normalize(14, width), 13, 17),
    },
    stepLabel: {
      fontSize: clamp(normalize(10, width), 9, 13),
      fontWeight: "600",
      color: "#9CA3AF",
      textAlign: "center",
    },
    stepLabelActive: {
      color: "#0891B2",
      fontWeight: "700",
    },
    stepLabelComplete: {
      color: "#16A34A",
    },
    stepConnector: {
      flex: 1,
      height: 2,
      backgroundColor: "#E5E7EB",
      marginHorizontal: clamp(moderateScale(6, width), 4, 10),
    },
    stepConnectorComplete: {
      backgroundColor: "#16A34A",
    },
    uploadProgressContainer: {
      marginHorizontal: clamp(moderateScale(16, width), 14, 24),
      marginBottom: clamp(moderateScale(10, width), 8, 16),
      padding: clamp(moderateScale(14, width), 12, 20),
      backgroundColor: "#FEF3C7",
      borderRadius: clamp(moderateScale(10, width), 8, 16),
      borderWidth: 1,
      borderColor: "#FCD34D",
    },
    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: clamp(moderateScale(6, width), 4, 10),
      marginBottom: clamp(moderateScale(8, width), 6, 12),
    },
    progressText: {
      fontSize: clamp(normalize(13, width), 12, 16),
      fontWeight: "600",
      color: "#0891B2",
    },

    /* Map Option */
    mapOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: clamp(moderateScale(16, width), 14, 24),
      paddingVertical: clamp(moderateScale(14, width), 12, 20),
      backgroundColor: "#F0F9FF",
      marginHorizontal: clamp(moderateScale(14, width), 12, 20),
      marginTop: clamp(moderateScale(14, width), 12, 20),
      borderRadius: clamp(moderateScale(10, width), 8, 16),
      borderWidth: 1,
      borderColor: "#BAE6FD",
    },
    mapOptionDisabled: {
      opacity: 0.5,
    },
    mapIconWrapper: {
      width: clamp(moderateScale(44, width), 40, 54),
      height: clamp(moderateScale(44, width), 40, 54),
      borderRadius: clamp(moderateScale(22, width), 20, 27),
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: clamp(moderateScale(10, width), 8, 14),
    },
    mapOptionContent: { flex: 1 },
    mapOptionTitle: {
      fontSize: clamp(normalize(15, width), 14, 18),
      fontWeight: "600",
      color: "#0891B2",
      marginBottom: clamp(moderateScale(2, width), 1, 4),
    },
    mapOptionSubtitle: {
      fontSize: clamp(normalize(11, width), 10, 14),
      color: "#64748B",
      lineHeight: clamp(normalize(16, width), 14, 19),
    },

    /* Divider */
    dividerWithText: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: clamp(moderateScale(16, width), 14, 24),
      marginVertical: clamp(moderateScale(14, width), 12, 20),
    },
    dividerLineShort: {
      flex: 1,
      height: 1,
      backgroundColor: "#E5E7EB",
    },
    dividerText: {
      fontSize: clamp(normalize(10, width), 9, 13),
      color: "#9CA3AF",
      fontWeight: "600",
      marginHorizontal: clamp(moderateScale(10, width), 8, 14),
    },

    /* Location List */
    locationList: {
      paddingHorizontal: clamp(moderateScale(14, width), 12, 20),
    },
    locationItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: clamp(moderateScale(12, width), 10, 16),
      paddingHorizontal: clamp(moderateScale(10, width), 8, 14),
    },
    locationItemIcon: {
      width: clamp(moderateScale(40, width), 36, 50),
      height: clamp(moderateScale(40, width), 36, 50),
      borderRadius: clamp(moderateScale(20, width), 18, 25),
      backgroundColor: "#E0F2FE",
      alignItems: "center",
      justifyContent: "center",
      marginRight: clamp(moderateScale(10, width), 8, 14),
    },
    locationItemContent: {
      flex: 1,
      marginRight: clamp(moderateScale(6, width), 4, 10),
    },
    locationItemName: {
      fontSize: clamp(normalize(14, width), 13, 17),
      fontWeight: "600",
      color: "#1F2937",
      marginBottom: clamp(moderateScale(3, width), 2, 5),
    },
    locationItemAddress: {
      fontSize: clamp(normalize(11, width), 10, 14),
      color: "#6B7280",
      lineHeight: clamp(normalize(15, width), 14, 18),
    },
    itemSeparator: {
      height: 1,
      backgroundColor: "#F3F4F6",
      marginLeft: clamp(moderateScale(60, width), 54, 74),
    },

    /* Photo Info */
    photoInfoSection: {
      paddingHorizontal: clamp(moderateScale(16, width), 14, 24),
      paddingVertical: clamp(moderateScale(10, width), 8, 16),
      backgroundColor: "#F9FAFB",
      marginHorizontal: clamp(moderateScale(14, width), 12, 20),
      marginTop: clamp(moderateScale(10, width), 8, 16),
      borderRadius: clamp(moderateScale(10, width), 8, 16),
      gap: clamp(moderateScale(6, width), 4, 10),
    },
    photoInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: clamp(moderateScale(6, width), 4, 10),
    },
    photoInfoText: {
      fontSize: clamp(normalize(12, width), 11, 15),
      color: "#6B7280",
      fontWeight: "500",
    },
    photoInfoTextSuccess: {
      color: "#16A34A",
      fontWeight: "600",
    },

    /* Requirements */
    requirementsScrollView: {
      maxHeight: height * 0.26,
    },
    requirementsList: {
      paddingHorizontal: clamp(moderateScale(16, width), 14, 24),
      gap: clamp(moderateScale(10, width), 8, 14),
      paddingBottom: clamp(moderateScale(14, width), 12, 20),
    },
    requirementItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: clamp(moderateScale(10, width), 8, 14),
    },
    requirementIconCircle: {
      width: clamp(moderateScale(34, width), 30, 42),
      height: clamp(moderateScale(34, width), 30, 42),
      borderRadius: clamp(moderateScale(17, width), 15, 21),
      backgroundColor: "#E0F2FE",
      alignItems: "center",
      justifyContent: "center",
    },
    requirementIconCircleComplete: {
      backgroundColor: "#DCFCE7",
    },
    requirementContent: {
      flex: 1,
    },
    requirementTitle: {
      fontSize: clamp(normalize(13, width), 12, 16),
      fontWeight: "600",
      color: "#1F2937",
      marginBottom: clamp(moderateScale(2, width), 1, 4),
    },
    requirementDescription: {
      fontSize: clamp(normalize(11, width), 10, 14),
      color: "#6B7280",
      lineHeight: clamp(normalize(15, width), 14, 18),
    },

    /* Next Button Modal */
    nextButtonModal: {
      marginHorizontal: clamp(moderateScale(16, width), 14, 24),
      marginTop: clamp(moderateScale(14, width), 12, 20),
      height: Math.max(minTouchTarget, clamp(moderateScale(50, width), 46, 60)),
      backgroundColor: "#0891B2",
      borderRadius: clamp(moderateScale(10, width), 8, 16),
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    nextButtonModalText: {
      fontSize: clamp(normalize(15, width), 14, 18),
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
};

// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Image,
//   useWindowDimensions,
//   Alert,
//   Platform,
//   KeyboardAvoidingView,
//   Keyboard,
//   TouchableWithoutFeedback,
//   Modal,
//   FlatList,
//   PixelRatio,
//   Animated,
//   ActivityIndicator,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import { useRouter } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useUpload } from '../../Context/UploadContext';
// import { supabase } from '../../Utils/supabase';

// // Enhanced scaling functions with better device support
// const guidelineBaseWidth = 375;
// const guidelineBaseHeight = 812;

// const scale = (size: number, width: number) => (width / guidelineBaseWidth) * size;
// const verticalScale = (size: number, height: number) => (height / guidelineBaseHeight) * size;
// const moderateScale = (size: number, width: number, factor = 0.5) =>
//   size + (scale(size, width) - size) * factor;

// // Improved normalize function for better pixel density handling
// const normalize = (size: number, width: number) => {
//   const newSize = moderateScale(size, width);
//   if (Platform.OS === 'ios') {
//     return Math.round(PixelRatio.roundToNearestPixel(newSize));
//   }
//   return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
// };

// const clamp = (n: number, min: number, max: number) =>
//   Math.max(min, Math.min(max, n));

// interface AddressType {
//   id: string;
//   title: string;
//   address: string;
//   isDefault: boolean;
//   lat?: number;
//   lng?: number;
//   icon?: string;
// }

// const UploadScreen3: React.FC = () => {
//   const { width, height } = useWindowDimensions();
//   const styles = useMemo(() => makeStyles(width, height), [width, height]);
//   const router = useRouter();
//   const { state, dispatch } = useUpload();

//   const [photos, setPhotos] = useState<(string | null)[]>(Array(8).fill(null));
//   const [showPhotoModal, setShowPhotoModal] = useState(false);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [addresses, setAddresses] = useState<AddressType[]>([]);
//   const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

//   // Initialize photos from context
//   useEffect(() => {
//     if (state.images.length > 0) {
//       const newPhotos = [...Array(8).fill(null)];
//       state.images.forEach((img, index) => {
//         if (index < 8) {
//           newPhotos[index] = img;
//         }
//       });
//       setPhotos(newPhotos);
//     }
//   }, [state.images]);

//   // Fetch addresses from database
//   useEffect(() => {
//     const fetchAddresses = async () => {
//       try {
//         setIsLoadingAddresses(true);
//         const { data: { user } } = await supabase.auth.getUser();

//         if (!user) {
//           Alert.alert("Error", "User not logged in");
//           return;
//         }

//         const { data, error } = await supabase
//           .from('addresses')
//           .select('*')
//           .eq('user_id', user.id)
//           .order('is_default', { ascending: false })
//           .order('created_at', { ascending: false });

//         if (error) {
//           console.error('Error fetching addresses:', error);
//           Alert.alert("Error", "Failed to load addresses");
//           return;
//         }

//         const formattedAddresses: AddressType[] = data.map(addr => ({
//           id: addr.id,
//           title: addr.title || 'Home',
//           address: addr.full_address || addr.address || '',
//           isDefault: addr.is_default,
//           lat: addr.latitude,
//           lng: addr.longitude,
//           icon: addr.title?.toLowerCase().includes('work')
//             ? 'briefcase'
//             : addr.title?.toLowerCase().includes('college')
//             ? 'school'
//             : 'home',
//         }));

//         setAddresses(formattedAddresses);

//         // Set default address if available
//         const defaultAddress = formattedAddresses.find(addr => addr.isDefault);
//         if (defaultAddress && !state.pickupAddressText) {
//           dispatch({
//             type: "SET_FIELD",
//             field: "pickupAddressText",
//             value: defaultAddress.address
//           });
//           dispatch({
//             type: "SET_FIELD",
//             field: "pickupAddressId",
//             value: defaultAddress.id
//           });
//         }
//       } catch (error) {
//         console.error('Error in fetchAddresses:', error);
//         Alert.alert("Error", "Failed to load addresses");
//       } finally {
//         setIsLoadingAddresses(false);
//       }
//     };

//     fetchAddresses();
//   }, []);

//   const requestPermissions = async () => {
//     const { status: cameraStatus } =
//       await ImagePicker.requestCameraPermissionsAsync();

//     if (cameraStatus !== 'granted') {
//       Alert.alert(
//         'Permission Required',
//         'Please grant camera permission to take photos.'
//       );
//       return false;
//     }
//     return true;
//   };

//   const simulateUpload = async () => {
//     setIsUploading(true);
//     setUploadProgress(0);

//     for (let i = 0; i <= 100; i += 10) {
//       await new Promise(resolve => setTimeout(resolve, 100));
//       setUploadProgress(i);
//     }

//     setIsUploading(false);
//     setUploadProgress(0);
//   };

//   const takePhoto = async () => {
//     const hasPermission = await requestPermissions();
//     if (!hasPermission) return;

//     const photoCount = photos.filter(p => p !== null).length;

//     if (photoCount >= 8) {
//       Alert.alert('Limit Reached', 'You can only upload up to 8 photos.');
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ['images'],
//       quality: 0.8,
//       allowsEditing: false,
//     });

//     if (!result.canceled && result.assets && result.assets[0]) {
//       await simulateUpload();

//       setPhotos(prev => {
//         const newPhotos = [...prev];
//         const firstEmptyIndex = newPhotos.findIndex(p => p === null);
//         if (firstEmptyIndex !== -1) {
//           newPhotos[firstEmptyIndex] = result.assets[0].uri;
//         }
//         return newPhotos;
//       });

//       // Update context
//       const validPhotos = [...photos];
//       const firstEmptyIndex = validPhotos.findIndex(p => p === null);
//       if (firstEmptyIndex !== -1) {
//         validPhotos[firstEmptyIndex] = result.assets[0].uri;
//       }
//       const contextPhotos = validPhotos.filter(p => p !== null) as string[];
//       dispatch({ type: "ADD_IMAGES", images: [result.assets[0].uri] });

//       // Check if first 3 required photos are complete
//       const requiredPhotosComplete = validPhotos[0] !== null && validPhotos[1] !== null && validPhotos[2] !== null;
//       if (requiredPhotosComplete) {
//         setShowPhotoModal(false);
//       }
//     }
//   };

//   // Enhanced removePhoto function for required photos
//   const removePhoto = (index: number) => {
//     // Special handling for first 3 photos (required photos)
//     if (index < 3) {
//       const photoNames = ['front cover', 'back cover', 'index/first page'];
//       Alert.alert(
//         'Remove Required Photo?',
//         `This is the ${photoNames[index]} photo. You must re-upload this photo before proceeding to the next page. The position will remain empty until you upload a new photo.`,
//         [
//           {
//             text: 'Cancel',
//             style: 'cancel'
//           },
//           {
//             text: 'Remove',
//             style: 'destructive',
//             onPress: () => {
//               const photoToRemove = photos[index];
//               if (!photoToRemove) return;

//               setPhotos(prev => {
//                 const newPhotos = [...prev];
//                 newPhotos[index] = null;
//                 return newPhotos;
//               });

//               // Update context by removing the specific image
//               dispatch({ type: "REMOVE_IMAGE", uri: photoToRemove });

//               // Show alert to re-upload after a short delay
//               setTimeout(() => {
//                 Alert.alert(
//                   'Photo Required',
//                   `Please upload the ${photoNames[index]} photo to complete your listing.`,
//                   [{ text: 'Upload Now', onPress: () => setShowPhotoModal(true) }]
//                 );
//               }, 500);
//             }
//           }
//         ]
//       );
//     } else {
//       // Regular removal for optional photos (4-8)
//       const photoToRemove = photos[index];
//       if (!photoToRemove) return;

//       setPhotos(prev => {
//         const newPhotos = [...prev];
//         newPhotos[index] = null;
//         return newPhotos;
//       });

//       // Update context by removing the specific image
//       dispatch({ type: "REMOVE_IMAGE", uri: photoToRemove });
//     }
//   };

//   const handleUploadPress = () => {
//     setShowPhotoModal(true);
//   };

//   const handleLocationSave = () => {
//     if (!state.pickupAddressText || state.pickupAddressText.trim() === '') {
//       Alert.alert('Error', 'Please select a location');
//       return;
//     }
//     // Location is saved when selected
//     setShowLocationModal(false);
//   };

//   const handleChangeLocation = () => {
//     setShowLocationModal(true);
//   };

//   const handleSelectAddress = (address: AddressType) => {
//     dispatch({
//       type: "SET_FIELD",
//       field: "pickupAddressText",
//       value: address.address
//     });
//     dispatch({
//       type: "SET_FIELD",
//       field: "pickupAddressId",
//       value: address.id
//     });
//     dispatch({
//       type: "SET_FIELD",
//       field: "pickupLatitude",
//       value: address.lat || null
//     });
//     dispatch({
//       type: "SET_FIELD",
//       field: "pickupLongitude",
//       value: address.lng || null
//     });
//     setShowLocationModal(false);
//   };

//   const handleAddNewAddress = () => {
//     setShowLocationModal(false);
//     router.push({
//       pathname: '/(screen)/UserCurrentLocation',
//       params: {
//         returnTo: 'UploadScreen3',
//       },
//     });
//   };

//   // Check if first 3 required photos are uploaded
//   const requiredPhotosUploaded = photos[0] !== null && photos[1] !== null && photos[2] !== null;
//   const requiredPhotoCount = [photos[0], photos[1], photos[2]].filter(p => p !== null).length;
//   const optionalPhotoCount = photos.slice(3).filter(p => p !== null).length;
//   const isFormValid = requiredPhotosUploaded && state.pickupAddressText;

//   // Enhanced handleNext function
//   const handleNext = () => {
//     if (!requiredPhotosUploaded) {
//       const missingPhotos = [];
//       if (!photos[0]) missingPhotos.push('front cover');
//       if (!photos[1]) missingPhotos.push('back cover');
//       if (!photos[2]) missingPhotos.push('index/first page');

//       Alert.alert(
//         'Required Photos Missing',
//         `Please upload the following photos: ${missingPhotos.join(', ')}.`,
//         [{ text: 'Upload Now', onPress: () => setShowPhotoModal(true) }]
//       );
//       return;
//     }

//     if (!state.pickupAddressText) {
//       Alert.alert('Location Required', 'Please select your pickup location.');
//       return;
//     }

//     if (isFormValid) {
//       const validPhotos = photos.filter(p => p !== null) as string[];
//       console.log('Photos:', validPhotos);
//       console.log('Location:', state.pickupAddressText);
//       // Navigate to next screen
//       router.push('/(screen)/Preview');
//     }
//   };

//   const handleBack = () => {
//     router.back();
//   };

//   const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

//   const renderLocationItem = ({ item }: { item: AddressType }) => (
//     <TouchableOpacity
//       style={[
//         styles.locationItem,
//         state.pickupAddressId === item.id && styles.addressItemSelected
//       ]}
//       onPress={() => handleSelectAddress(item)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.locationItemIcon}>
//         <Ionicons name={item.icon as any} size={moderateScale(22, width)} color="#003EF9" />
//       </View>
//       <View style={styles.locationItemContent}>
//         <Text style={styles.locationItemName}>{item.title}</Text>
//         <Text style={styles.locationItemAddress} numberOfLines={2}>
//           {item.address}
//         </Text>
//       </View>
//       <Ionicons
//         name={state.pickupAddressId === item.id ? "checkmark-circle" : "chevron-forward"}
//         size={moderateScale(20, width)}
//         color={state.pickupAddressId === item.id ? "#10B981" : "#9CA3AF"}
//       />
//     </TouchableOpacity>
//   );

//   return (
//     <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//         keyboardVerticalOffset={keyboardVerticalOffset}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <SafeAreaView style={{ flex: 1 }}>
//             {/* Fixed Header */}
//             <View style={styles.header}>
//               <Ionicons
//                 name="arrow-back-outline"
//                 size={24}
//                 color="#131E1E"
//                 onPress={handleBack}
//               />
//               <Text style={styles.headerTitle}>Shear Books</Text>
//             </View>

//             {/* Fixed Hero Image */}
//             <View style={styles.heroCard}>
//               <Image
//                 source={require('../../assets/images/donate-book.png')}
//                 style={styles.heroImage}
//                 resizeMode="cover"
//               />
//             </View>

//             {/* Scrollable Content */}
//             <ScrollView
//               contentContainerStyle={styles.scrollContent}
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//               bounces={false}
//             >
//               {/* Combined Upload and Location Card */}
//               <View style={styles.formCard}>
//                 {/* Upload Photos Section */}
//                 <Text style={styles.sectionTitle}>D. Upload Photos</Text>

//                 <View style={styles.noteBox}>
//                   <Text style={styles.noteText}>
//                     <Text style={styles.noteBold}>Note:</Text> Please upload photos of
//                     the front cover, back cover, and index page. If there are any torn
//                     or damaged pages, upload clear photos of the defects.
//                   </Text>
//                 </View>

//                 {/* Photo Grid with Empty Placeholders */}
//                 <View style={styles.photoGrid}>
//                   {/* Always show first 3 required photo slots */}
//                   {photos.slice(0, 3).map((photo, index) => (
//                     <View key={`required-${index}`} style={styles.photoContainer}>
//                       {photo ? (
//                         <>
//                           <Image
//                             source={{ uri: photo }}
//                             style={styles.photoThumbnail}
//                           />
//                           <View style={styles.photoLabel}>
//                             <Text style={styles.photoLabelText}>
//                               {index === 0 ? 'Cover' : index === 1 ? 'Back' : 'Index'}
//                             </Text>
//                           </View>
//                           <TouchableOpacity
//                             style={styles.removePhotoButton}
//                             onPress={() => removePhoto(index)}
//                             hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                           >
//                             <Ionicons
//                               name="close-circle"
//                               size={normalize(24, width)}
//                               color="#EF4444"
//                             />
//                           </TouchableOpacity>
//                         </>
//                       ) : (
//                         <View style={styles.emptyPhotoSlot}>
//                           <Ionicons
//                             name={index === 0 ? 'book' : index === 1 ? 'book-outline' : 'document-text'}
//                             size={normalize(32, width)}
//                             color="#003EF9"
//                           />
//                           <Text style={styles.emptyPhotoText}>
//                             {index === 0 ? 'Front' : index === 1 ? 'Back' : 'Index'}
//                           </Text>
//                           <TouchableOpacity
//                             style={styles.uploadEmptySlot}
//                             onPress={() => setShowPhotoModal(true)}
//                           >
//                             <Text style={styles.uploadEmptySlotText}>Upload</Text>
//                           </TouchableOpacity>
//                         </View>
//                       )}
//                     </View>
//                   ))}

//                   {/* Show uploaded optional photos (4-8) */}
//                   {photos.slice(3).map((photo, index) => {
//                     if (!photo) return null;
//                     const actualIndex = index + 3;

//                     return (
//                       <View key={`optional-${actualIndex}`} style={styles.photoContainer}>
//                         <Image
//                           source={{ uri: photo }}
//                           style={styles.photoThumbnail}
//                         />
//                         <View style={styles.photoLabel}>
//                           <Text style={styles.photoLabelText}>
//                             Page {index + 1}
//                           </Text>
//                         </View>
//                         <TouchableOpacity
//                           style={styles.removePhotoButton}
//                           onPress={() => removePhoto(actualIndex)}
//                           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                         >
//                           <Ionicons
//                             name="close-circle"
//                             size={normalize(24, width)}
//                             color="#EF4444"
//                           />
//                         </TouchableOpacity>
//                       </View>
//                     );
//                   })}
//                 </View>

//                 <TouchableOpacity
//                   style={styles.uploadArea}
//                   onPress={handleUploadPress}
//                   activeOpacity={0.7}
//                 >
//                   <Ionicons name="camera-outline" size={normalize(48, width)} color="#003EF9" />
//                   <Text style={styles.uploadText}>
//                     Take photos of your book
//                   </Text>
//                   <Text style={styles.uploadSubtext}>
//                     Minimum 3 photos required
//                   </Text>
//                   <TouchableOpacity
//                     style={styles.browseButton}
//                     onPress={handleUploadPress}
//                   >
//                     <Text style={styles.browseButtonText}>Start Camera</Text>
//                   </TouchableOpacity>
//                 </TouchableOpacity>

//                 {/* Photo Counter */}
//                 <Text style={styles.photoCounter}>
//                   {requiredPhotosUploaded ? '✓ ' : ''}
//                   Required photos: {requiredPhotoCount} / 3
//                   {optionalPhotoCount > 0 && ` (+${optionalPhotoCount} optional)`}
//                 </Text>

//                 {/* Divider */}
//                 <View style={styles.sectionDivider} />

//                 {/* Pickup Location Section */}
//                 <Text style={styles.sectionTitle}>E. Pickup Location</Text>

//                 {isLoadingAddresses ? (
//                   <View style={styles.loadingContainer}>
//                     <ActivityIndicator size="small" color="#003EF9" />
//                     <Text style={styles.loadingText}>Loading addresses...</Text>
//                   </View>
//                 ) : (
//                   <>
//                     <View style={styles.locationCard}>
//                       <Ionicons name="location-outline" size={moderateScale(24, width)} color="#003EF9" />
//                       <Text style={styles.locationText} numberOfLines={3}>
//                         {state.pickupAddressText || "No address selected"}
//                       </Text>
//                     </View>

//                     <TouchableOpacity
//                       style={[
//                         styles.locationActionButton,
//                         state.pickupAddressText && styles.locationActionButtonSaved
//                       ]}
//                       onPress={handleChangeLocation}
//                       activeOpacity={0.8}
//                     >
//                       <Ionicons
//                         name={state.pickupAddressText ? "checkmark-circle" : "location"}
//                         size={moderateScale(20, width)}
//                         color={state.pickupAddressText ? "#FFFFFF" : "#003EF9"}
//                       />
//                       <Text style={[
//                         styles.locationActionButtonText,
//                         state.pickupAddressText && styles.locationActionButtonTextSaved
//                       ]}>
//                         {state.pickupAddressText ? "Location Saved" : "Select Location"}
//                       </Text>
//                     </TouchableOpacity>
//                   </>
//                 )}
//               </View>

//               {/* Next Button */}
//               <TouchableOpacity
//                 style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
//                 onPress={handleNext}
//                 disabled={!isFormValid}
//                 activeOpacity={0.8}
//               >
//                 <Text
//                   style={[
//                     styles.nextButtonText,
//                     !isFormValid && styles.nextButtonTextDisabled,
//                   ]}
//                 >
//                   Next
//                 </Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </SafeAreaView>
//         </TouchableWithoutFeedback>
//       </KeyboardAvoidingView>

//       {/* Photo Upload Modal */}
//       <Modal
//         visible={showPhotoModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           if (requiredPhotosUploaded) {
//             setShowPhotoModal(false);
//           } else {
//             Alert.alert('Minimum Required', 'Please upload at least 3 photos before closing.');
//           }
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.locationModalTitle}>Upload Photos</Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   if (requiredPhotosUploaded) {
//                     setShowPhotoModal(false);
//                   } else {
//                     Alert.alert('Minimum Required', 'Please upload at least 3 photos before closing.');
//                   }
//                 }}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <Ionicons name="close" size={moderateScale(28, width)} color="#374151" />
//               </TouchableOpacity>
//             </View>

//             {/* Step Progress */}
//             <View style={styles.stepProgressContainer}>
//               <View style={styles.stepProgressHeader}>
//                 <Text style={styles.stepProgressTitle}>
//                   {requiredPhotoCount === 0 && 'Step 1: Upload Front Cover'}
//                   {requiredPhotoCount === 1 && 'Step 2: Upload Back Cover'}
//                   {requiredPhotoCount === 2 && 'Step 3: Upload Index/First Page'}
//                   {requiredPhotoCount >= 3 && '✓ Required Photos Complete'}
//                 </Text>
//                 <Text style={styles.stepProgressCount}>{requiredPhotoCount} / 3</Text>
//               </View>

//               <View style={styles.progressBarContainer}>
//                 <View style={styles.progressBarBackground}>
//                   <Animated.View
//                     style={[
//                       styles.progressBarFill,
//                       { width: `${Math.min((requiredPhotoCount / 3) * 100, 100)}%` }
//                     ]}
//                   />
//                 </View>
//               </View>

//               <View style={styles.stepIndicators}>
//                 <View style={styles.stepIndicatorItem}>
//                   <View style={[
//                     styles.stepDot,
//                     photos[0] !== null && styles.stepDotComplete,
//                     photos[0] === null && styles.stepDotActive
//                   ]}>
//                     {photos[0] !== null ? (
//                       <Ionicons name="checkmark" size={moderateScale(14, width)} color="#fff" />
//                     ) : (
//                       <Text style={[styles.stepDotNumber, photos[0] === null && styles.stepDotNumberActive]}>1</Text>
//                     )}
//                   </View>
//                   <Text style={[
//                     styles.stepLabel,
//                     photos[0] !== null && styles.stepLabelComplete,
//                     photos[0] === null && styles.stepLabelActive
//                   ]}>Front</Text>
//                 </View>

//                 <View style={[styles.stepConnector, photos[1] !== null && styles.stepConnectorComplete]} />

//                 <View style={styles.stepIndicatorItem}>
//                   <View style={[
//                     styles.stepDot,
//                     photos[1] !== null && styles.stepDotComplete,
//                     photos[0] !== null && photos[1] === null && styles.stepDotActive
//                   ]}>
//                     {photos[1] !== null ? (
//                       <Ionicons name="checkmark" size={moderateScale(14, width)} color="#fff" />
//                     ) : (
//                       <Text style={[styles.stepDotNumber, photos[0] !== null && photos[1] === null && styles.stepDotNumberActive]}>2</Text>
//                     )}
//                   </View>
//                   <Text style={[
//                     styles.stepLabel,
//                     photos[1] !== null && styles.stepLabelComplete,
//                     photos[0] !== null && photos[1] === null && styles.stepLabelActive
//                   ]}>Back</Text>
//                 </View>

//                 <View style={[styles.stepConnector, photos[2] !== null && styles.stepConnectorComplete]} />

//                 <View style={styles.stepIndicatorItem}>
//                   <View style={[
//                     styles.stepDot,
//                     photos[2] !== null && styles.stepDotComplete,
//                     photos[0] !== null && photos[1] !== null && photos[2] === null && styles.stepDotActive
//                   ]}>
//                     {photos[2] !== null ? (
//                       <Ionicons name="checkmark" size={moderateScale(14, width)} color="#fff" />
//                     ) : (
//                       <Text style={[styles.stepDotNumber, photos[0] !== null && photos[1] !== null && photos[2] === null && styles.stepDotNumberActive]}>3</Text>
//                     )}
//                   </View>
//                   <Text style={[
//                     styles.stepLabel,
//                     photos[2] !== null && styles.stepLabelComplete,
//                     photos[0] !== null && photos[1] !== null && photos[2] === null && styles.stepLabelActive
//                   ]}>Index</Text>
//                 </View>
//               </View>
//             </View>

//             {isUploading && (
//               <View style={styles.uploadProgressContainer}>
//                 <View style={styles.progressHeader}>
//                   <Ionicons name="cloud-upload-outline" size={moderateScale(20, width)} color="#003EF9" />
//                   <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
//                 </View>
//                 <View style={styles.progressBarBackground}>
//                   <View
//                     style={[
//                       styles.progressBarFill,
//                       { width: `${uploadProgress}%` }
//                     ]}
//                   />
//                 </View>
//               </View>
//             )}

//             <TouchableOpacity
//               style={[styles.mapOption, isUploading && styles.mapOptionDisabled]}
//               onPress={takePhoto}
//               activeOpacity={0.7}
//               disabled={isUploading}
//             >
//               <View style={styles.mapIconWrapper}>
//                 <Ionicons name="camera" size={moderateScale(24, width)} color="#003EF9" />
//               </View>
//               <View style={styles.mapOptionContent}>
//                 <Text style={styles.mapOptionTitle}>Open Camera</Text>
//                 <Text style={styles.mapOptionSubtitle}>
//                   {requiredPhotoCount === 0 && 'Take a clear photo of the front cover'}
//                   {requiredPhotoCount === 1 && 'Take a clear photo of the back cover'}
//                   {requiredPhotoCount === 2 && 'Take a clear photo of the index/first page'}
//                   {requiredPhotoCount >= 3 && 'Add more photos (optional - torn/damaged pages)'}
//                 </Text>
//               </View>
//               <Ionicons name="chevron-forward" size={moderateScale(20, width)} color="#9CA3AF" />
//             </TouchableOpacity>

//             <View style={styles.photoInfoSection}>
//               <View style={styles.photoInfoItem}>
//                 <Ionicons name="images-outline" size={moderateScale(20, width)} color="#6B7280" />
//                 <Text style={styles.photoInfoText}>
//                   {requiredPhotoCount + optionalPhotoCount} / 8 photos captured
//                 </Text>
//               </View>
//               <View style={styles.photoInfoItem}>
//                 <Ionicons name="checkmark-circle" size={moderateScale(20, width)} color={requiredPhotosUploaded ? "#16A34A" : "#9CA3AF"} />
//                 <Text style={[styles.photoInfoText, requiredPhotosUploaded && styles.photoInfoTextSuccess]}>
//                   Minimum 3 photos {requiredPhotosUploaded ? 'completed' : 'required'}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.dividerWithText}>
//               <View style={styles.dividerLineShort} />
//               <Text style={styles.dividerText}>PHOTO REQUIREMENTS</Text>
//               <View style={styles.dividerLineShort} />
//             </View>

//             <ScrollView
//               style={styles.requirementsScrollView}
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.requirementsList}>
//                 <View style={styles.requirementItem}>
//                   <View style={[styles.requirementIconCircle, photos[0] !== null && styles.requirementIconCircleComplete]}>
//                     <Ionicons
//                       name={photos[0] !== null ? "checkmark" : "book"}
//                       size={moderateScale(18, width)}
//                       color={photos[0] !== null ? "#16A34A" : "#003EF9"}
//                     />
//                   </View>
//                   <View style={styles.requirementContent}>
//                     <Text style={styles.requirementTitle}>Front Cover {photos[0] !== null && '✓'}</Text>
//                     <Text style={styles.requirementDescription}>Clear photo of the front cover</Text>
//                   </View>
//                 </View>

//                 <View style={styles.requirementItem}>
//                   <View style={[styles.requirementIconCircle, photos[1] !== null && styles.requirementIconCircleComplete]}>
//                     <Ionicons
//                       name={photos[1] !== null ? "checkmark" : "book-outline"}
//                       size={moderateScale(18, width)}
//                       color={photos[1] !== null ? "#16A34A" : "#003EF9"}
//                     />
//                   </View>
//                   <View style={styles.requirementContent}>
//                     <Text style={styles.requirementTitle}>Back Cover {photos[1] !== null && '✓'}</Text>
//                     <Text style={styles.requirementDescription}>Clear photo of the back cover</Text>
//                   </View>
//                 </View>

//                 <View style={styles.requirementItem}>
//                   <View style={[styles.requirementIconCircle, photos[2] !== null && styles.requirementIconCircleComplete]}>
//                     <Ionicons
//                       name={photos[2] !== null ? "checkmark" : "document-text"}
//                       size={moderateScale(18, width)}
//                       color={photos[2] !== null ? "#16A34A" : "#003EF9"}
//                     />
//                   </View>
//                   <View style={styles.requirementContent}>
//                     <Text style={styles.requirementTitle}>Index/First Page {photos[2] !== null && '✓'}</Text>
//                     <Text style={styles.requirementDescription}>Photo of the first or index page</Text>
//                   </View>
//                 </View>

//                 <View style={styles.requirementItem}>
//                   <View style={styles.requirementIconCircle}>
//                     <Ionicons name="albums" size={moderateScale(18, width)} color="#9CA3AF" />
//                   </View>
//                   <View style={styles.requirementContent}>
//                     <Text style={styles.requirementTitle}>Additional Pages (Optional)</Text>
//                     <Text style={styles.requirementDescription}>Photos of torn or damaged pages</Text>
//                   </View>
//                 </View>
//               </View>
//             </ScrollView>

//             {/* Next Button */}
//             {requiredPhotosUploaded && (
//               <TouchableOpacity
//                 style={styles.nextButtonModal}
//                 onPress={() => setShowPhotoModal(false)}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.nextButtonModalText}>Next</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Location Modal */}
//       <Modal
//         visible={showLocationModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowLocationModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.locationModalTitle}>Select Location</Text>
//               <TouchableOpacity
//                 onPress={() => setShowLocationModal(false)}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <Ionicons name="close" size={moderateScale(28, width)} color="#374151" />
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={styles.mapOption}
//               onPress={handleAddNewAddress}
//               activeOpacity={0.7}
//             >
//               <View style={styles.mapIconWrapper}>
//                 <Ionicons name="map" size={moderateScale(24, width)} color="#003EF9" />
//               </View>
//               <View style={styles.mapOptionContent}>
//                 <Text style={styles.mapOptionTitle}>Choose on Map</Text>
//                 <Text style={styles.mapOptionSubtitle}>
//                   Select your location by moving the map
//                 </Text>
//               </View>
//               <Ionicons name="chevron-forward" size={moderateScale(20, width)} color="#9CA3AF" />
//             </TouchableOpacity>

//             <View style={styles.dividerWithText}>
//               <View style={styles.dividerLineShort} />
//               <Text style={styles.dividerText}>OR SELECT FROM SAVED</Text>
//               <View style={styles.dividerLineShort} />
//             </View>

//             <FlatList
//               data={addresses}
//               renderItem={renderLocationItem}
//               keyExtractor={item => item.id}
//               style={styles.addressList}
//               showsVerticalScrollIndicator={false}
//               ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
//               ListEmptyComponent={
//                 <View style={styles.emptyAddressContainer}>
//                   <Ionicons
//                     name="location-outline"
//                     size={moderateScale(48, width)}
//                     color="#9CA3AF"
//                   />
//                   <Text style={styles.emptyAddressText}>
//                     No addresses saved yet
//                   </Text>
//                   <Text style={styles.emptyAddressSubtext}>
//                     Add your first address to get started
//                   </Text>
//                 </View>
//               }
//             />
//           </View>
//         </View>
//       </Modal>
//     </LinearGradient>
//   );
// };

// const makeStyles = (width: number, height: number) => {
//   // Enhanced responsive breakpoints
//   const isExtraSmall = width < 340;
//   const isSmall = width >= 340 && width < 375;
//   const isMedium = width >= 375 && width < 414;
//   const isLarge = width >= 414 && width < 480;
//   const isExtraLarge = width >= 480;

//   const aspectRatio = height / width;
//   const isNarrow = aspectRatio > 2.1;
//   const isWide = aspectRatio < 1.8;

//   // Adaptive padding
//   const topPad = isExtraSmall ? 16
//     : isSmall ? 20
//     : isMedium ? clamp(moderateScale(45, width), 35, 50)
//     : isLarge ? clamp(moderateScale(50, width), 40, 60)
//     : clamp(moderateScale(55, width), 45, 70);

//   const sidePad = isExtraSmall ? 10
//     : isSmall ? 14
//     : isMedium ? clamp(moderateScale(18, width), 16, 22)
//     : isLarge ? clamp(moderateScale(22, width), 18, 26)
//     : clamp(moderateScale(26, width), 22, 32);

//   const cardPadding = isExtraSmall ? 14
//     : isSmall ? 16
//     : clamp(moderateScale(16, width), 14, 20);

//   // Photo grid calculations
//   const availableWidth = width - (sidePad * 2) - (cardPadding * 2);
//   const photoGap = isExtraSmall ? 6 : isSmall ? 8 : clamp(moderateScale(12, width), 8, 16);
//   const photosPerRow = isExtraSmall ? 2 : 3;
//   const totalGaps = (photosPerRow - 1) * photoGap;
//   const photoSize = Math.floor((availableWidth - totalGaps) / photosPerRow);

//   const minTouchTarget = Platform.OS === 'ios' ? 44 : 48;

//   // Hero image height
//   const heroHeight = isExtraSmall
//     ? 120
//     : isSmall
//     ? 140
//     : isNarrow
//     ? clamp(verticalScale(140, height), 130, 170)
//     : clamp(verticalScale(160, height), 140, 200);

//   return StyleSheet.create({
//     container: { flex: 1 },
//     keyboardView: { flex: 1 },
//     mainContainer: { flex: 1 },
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 16,
//       paddingVertical: 12,
//       backgroundColor: "transparent",
//     },
//     headerTitle: {
//       fontSize: 18,
//       fontWeight: "400",
//       marginLeft: 10,
//       color: '#131E1E',
//     },
//     heroCard: {
//       height: heroHeight,
//       marginHorizontal: sidePad,
//       borderRadius: 9,
//       overflow: 'hidden',
//       backgroundColor: '#fff',
//       elevation: 3,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       borderWidth: 2,
//       borderColor: '#003EF9',
//       marginVertical: 8,
//     },
//     heroImage: { width: '100%', height: '100%' },
//     scrollContent: {
//       paddingHorizontal: sidePad,
//       paddingTop: clamp(moderateScale(12, width), 8, 16),
//       paddingBottom: clamp(moderateScale(24, width), 20, 40),
//       flexGrow: 1,
//     },
//     formCard: {
//       backgroundColor: '#BDF4FF',
//       borderRadius: 14,
//       padding: cardPadding,
//       marginBottom: clamp(moderateScale(16, width), 12, 22),
//       shadowColor: "#000",
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       elevation: 4,
//     },
//     sectionTitle: {
//       fontSize: 15,
//       fontWeight: '700',
//       color: '#000000E0',
//       marginBottom: clamp(moderateScale(16, width), 12, 20),
//     },
//     noteBox: {
//       backgroundColor: 'rgba(207, 250, 254, 0.5)',
//       borderWidth: 2,
//       borderColor: '#44D6FF',
//       borderRadius: moderateScale(10, width),
//       borderStyle: 'dashed',
//       padding: moderateScale(12, width),
//       marginBottom: moderateScale(16, width),
//     },
//     noteText: {
//       fontSize: normalize(11, width),
//       color: '#4b5563',
//       lineHeight: normalize(16, width),
//     },
//     noteBold: { fontWeight: '700' },
//     photoGrid: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       gap: photoGap,
//       marginBottom: clamp(moderateScale(14, width), 12, 20),
//     },
//     photoContainer: {
//       position: 'relative',
//       width: photoSize,
//       height: photoSize,
//     },
//     photoThumbnail: {
//       width: '100%',
//       height: '100%',
//       borderRadius: moderateScale(8, width),
//       backgroundColor: '#f3f4f6',
//     },
//     emptyPhotoSlot: {
//       width: '100%',
//       height: '100%',
//       borderRadius: moderateScale(8, width),
//       backgroundColor: '#F3F4F6',
//       borderWidth: 2,
//       borderColor: '#E5E7EB',
//       borderStyle: 'dashed',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: clamp(moderateScale(8, width), 6, 12),
//     },
//     emptyPhotoText: {
//       fontSize: clamp(normalize(9, width), 8, 12),
//       color: '#003EF9',
//       fontWeight: '600',
//       marginTop: clamp(moderateScale(4, width), 3, 6),
//       textAlign: 'center',
//     },
//     uploadEmptySlot: {
//       marginTop: clamp(moderateScale(4, width), 3, 6),
//       backgroundColor: '#003EF9',
//       paddingHorizontal: clamp(moderateScale(8, width), 6, 12),
//       paddingVertical: clamp(moderateScale(3, width), 2, 5),
//       borderRadius: clamp(moderateScale(4, width), 3, 6),
//     },
//     uploadEmptySlotText: {
//       fontSize: clamp(normalize(8, width), 7, 11),
//       color: '#FFFFFF',
//       fontWeight: '600',
//     },
//     photoLabel: {
//       position: 'absolute',
//       bottom: 4,
//       left: 4,
//       right: 4,
//       backgroundColor: 'rgba(0, 0, 0, 0.7)',
//       paddingVertical: 2,
//       paddingHorizontal: 3,
//       borderRadius: 3,
//     },
//     photoLabelText: {
//       fontSize: clamp(normalize(8, width), 7, 11),
//       color: '#FFFFFF',
//       fontWeight: '600',
//       textAlign: 'center',
//     },
//     removePhotoButton: {
//       position: 'absolute',
//       top: -8,
//       right: -8,
//       backgroundColor: '#fff',
//       borderRadius: 12,
//       width: clamp(moderateScale(24, width), 20, 28),
//       height: clamp(moderateScale(24, width), 20, 28),
//       alignItems: 'center',
//       justifyContent: 'center',
//       elevation: 2,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 1 },
//       shadowOpacity: 0.2,
//       shadowRadius: 2,
//     },
//     uploadArea: {
//       borderWidth: 2,
//       borderColor: '#44D6FF',
//       borderStyle: 'dashed',
//       borderRadius: moderateScale(12, width),
//       padding: moderateScale(20, width),
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: "rgba(255, 255, 255, 0.36)",
//       marginBottom: clamp(moderateScale(10, width), 8, 16),
//       minHeight: isExtraSmall ? 160 : isSmall ? 180 : 200,
//     },
//     uploadText: {
//       fontSize: normalize(16, width),
//       fontWeight: '600',
//       color: '#000000',
//       marginTop: moderateScale(12, width),
//       marginBottom: moderateScale(4, width),
//       textAlign: 'center',
//     },
//     uploadSubtext: {
//       fontSize: normalize(12, width),
//       color: '#666666',
//       marginBottom: moderateScale(16, width),
//       textAlign: 'center',
//     },
//     browseButton: {
//       backgroundColor: 'rgba(20, 218, 232, 0.9)',
//       paddingHorizontal: moderateScale(24, width),
//       paddingVertical: moderateScale(10, width),
//       borderRadius: moderateScale(8, width),
//       minHeight: minTouchTarget,
//       justifyContent: 'center',
//     },
//     browseButtonText: {
//       fontSize: normalize(14, width),
//       fontWeight: '600',
//       color: '#FFFFFF',
//     },
//     photoCounter: {
//       fontSize: normalize(12, width),
//       color: '#0c64f0ff',
//       fontWeight: '600',
//       textAlign: 'center',
//       marginBottom: clamp(moderateScale(16, width), 12, 24),
//     },
//     sectionDivider: {
//       height: 1,
//       backgroundColor: 'rgba(0, 62, 249, 0.2)',
//       marginVertical: moderateScale(20, width),
//     },
//     locationCard: {
//       backgroundColor: "rgba(255, 255, 255, 0.36)",
//       borderRadius: moderateScale(12, width),
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       padding: moderateScale(16, width),
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       marginBottom: moderateScale(16, width),
//     },
//     locationIconWrapper: {
//       marginRight: moderateScale(10, width),
//       marginTop: moderateScale(2, width),
//     },
//     locationText: {
//       fontSize: normalize(14, width),
//       color: '#000000',
//       lineHeight: normalize(20, width),
//       marginLeft: moderateScale(12, width),
//       flex: 1,
//     },
//     locationButtons: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       height: clamp(moderateScale(56, width), 46, 60),
//       backgroundColor: 'rgba(255,255,255,0.4)',
//       borderRadius: moderateScale(12, width),
//       overflow: 'hidden',
//     },
//     locationButton: {
//       flex: 1,
//       height: '100%',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     changeButton: {
//       backgroundColor: '#FFFFFF',
//       borderWidth: 1,
//       borderColor: '#44D6FF',
//     },
//     changeButtonText: {
//       fontSize: normalize(14, width),
//       fontWeight: '600',
//       color: '#003EF9',
//     },
//     saveButton: {
//       backgroundColor: 'rgba(20, 218, 232, 0.9)',
//     },
//     saveButtonText: {
//       fontSize: normalize(14, width),
//       fontWeight: '600',
//       color: '#FFFFFF',
//     },
//     savedButton: {
//       width: '100%',
//       height: clamp(moderateScale(56, width), 46, 60),
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#2da258ff',
//       borderRadius: moderateScale(12, width),
//     },
//     savedButtonText: {
//       fontSize: normalize(16, width),
//       color: '#FFFFFF',
//       fontWeight: '700',
//     },
//     locationActionButton: {
//       width: '100%',
//       height: Math.max(minTouchTarget, moderateScale(56, width)),
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#FFFFFF',
//       borderRadius: moderateScale(12, width),
//       borderWidth: 1,
//       borderColor: '#44D6FF',
//       gap: moderateScale(8, width),
//     },
//     locationActionButtonSaved: {
//       backgroundColor: '#2da258ff',
//       borderColor: '#2da258ff',
//     },
//     locationActionButtonText: {
//       fontSize: normalize(14, width),
//       fontWeight: '600',
//       color: '#003EF9',
//     },
//     locationActionButtonTextSaved: {
//       color: '#FFFFFF',
//     },
//     loadingContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: moderateScale(16, width),
//     },
//     loadingText: {
//       fontSize: normalize(14, width),
//       color: '#666666',
//       marginLeft: moderateScale(8, width),
//     },
//     verticalDivider: {
//       width: 1,
//       height: '60%',
//       backgroundColor: '#9CA3AF',
//     },
//     nextButton: {
//       height: Math.max(minTouchTarget, moderateScale(52, width)),
//       backgroundColor: 'rgba(20, 218, 232, 0.9)',
//       paddingVertical: moderateScale(16, width),
//       borderRadius: moderateScale(12, width),
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginTop: moderateScale(20, width),
//       elevation: 2,
//       shadowColor: '#000',
//       shadowOpacity: 0.07,
//       shadowRadius: 10,
//       shadowOffset: { width: 0, height: 6 },
//     },
//     nextButtonText: {
//       fontSize: normalize(16, width),
//       fontWeight: '700',
//       color: 'rgba(255,255,255,0.78)',
//     },
//     nextButtonDisabled: {
//       backgroundColor: 'rgba(156, 163, 175, 0.5)',
//       elevation: 0,
//       shadowOpacity: 0,
//     },
//     nextButtonTextDisabled: {
//       color: 'rgba(107, 114, 128, 0.7)',
//     },
//     modalOverlay: {
//       flex: 1,
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       justifyContent: 'flex-end',
//     },
//     modalContent: {
//       backgroundColor: '#FFF',
//       borderTopLeftRadius: moderateScale(20, width),
//       borderTopRightRadius: moderateScale(20, width),
//       maxHeight: height * 0.88,
//       paddingBottom: Platform.OS === 'ios' ? 34 : 20,
//     },
//     modalHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       paddingHorizontal: moderateScale(18, width),
//       paddingTop: moderateScale(18, width),
//       paddingBottom: moderateScale(14, width),
//       borderBottomWidth: 1,
//       borderBottomColor: '#E5E7EB',
//     },
//     locationModalTitle: {
//       fontSize: normalize(18, width),
//       fontWeight: '700',
//       color: '#1F2937',
//     },
//     stepProgressContainer: {
//       marginHorizontal: moderateScale(16, width),
//       marginTop: moderateScale(14, width),
//       marginBottom: moderateScale(10, width),
//       padding: moderateScale(16, width),
//       backgroundColor: '#F0F9FF',
//       borderRadius: moderateScale(14, width),
//       borderWidth: 2,
//       borderColor: '#BAE6FD',
//     },
//     stepProgressHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: moderateScale(14, width),
//     },
//     stepProgressTitle: {
//       fontSize: normalize(14, width),
//       fontWeight: '700',
//       color: '#003EF9',
//       flex: 1,
//     },
//     stepProgressCount: {
//       fontSize: normalize(13, width),
//       fontWeight: '600',
//       color: '#64748B',
//       marginLeft: 6,
//     },
//     progressBarContainer: {
//       marginBottom: moderateScale(14, width),
//     },
//     stepIndicators: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
//     stepIndicatorItem: {
//       alignItems: 'center',
//       gap: moderateScale(5, width),
//     },
//     stepDot: {
//       width: moderateScale(30, width),
//       height: moderateScale(30, width),
//       borderRadius: moderateScale(15, width),
//       backgroundColor: '#E5E7EB',
//       alignItems: 'center',
//       justifyContent: 'center',
//       borderWidth: 2,
//       borderColor: '#D1D5DB',
//     },
//     stepDotActive: {
//       backgroundColor: '#DBEAFE',
//       borderColor: '#003EF9',
//       borderWidth: 3,
//     },
//     stepDotComplete: {
//       backgroundColor: '#16A34A',
//       borderColor: '#16A34A',
//     },
//     stepDotNumber: {
//       fontSize: normalize(13, width),
//       fontWeight: '700',
//       color: '#9CA3AF',
//     },
//     stepDotNumberActive: {
//       color: '#003EF9',
//       fontSize: normalize(14, width),
//     },
//     stepLabel: {
//       fontSize: normalize(10, width),
//       fontWeight: '600',
//       color: '#9CA3AF',
//       textAlign: 'center',
//     },
//     stepLabelActive: {
//       color: '#003EF9',
//       fontWeight: '700',
//     },
//     stepLabelComplete: {
//       color: '#16A34A',
//     },
//     stepConnector: {
//       flex: 1,
//       height: 2,
//       backgroundColor: '#E5E7EB',
//       marginHorizontal: moderateScale(6, width),
//     },
//     stepConnectorComplete: {
//       backgroundColor: '#16A34A',
//     },
//     uploadProgressContainer: {
//       marginHorizontal: moderateScale(16, width),
//       marginBottom: moderateScale(10, width),
//       padding: moderateScale(14, width),
//       backgroundColor: '#FEF3C7',
//       borderRadius: moderateScale(10, width),
//       borderWidth: 1,
//       borderColor: '#FCD34D',
//     },
//     progressHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: moderateScale(6, width),
//       marginBottom: moderateScale(8, width),
//     },
//     progressText: {
//       fontSize: normalize(13, width),
//       fontWeight: '600',
//       color: '#003EF9',
//     },
//     progressBarBackground: {
//       height: moderateScale(7, width),
//       backgroundColor: '#E0F2FE',
//       borderRadius: moderateScale(4, width),
//       overflow: 'hidden',
//     },
//     progressBarFill: {
//       height: '100%',
//       backgroundColor: '#003EF9',
//       borderRadius: moderateScale(4, width),
//     },
//     mapOption: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: moderateScale(16, width),
//       paddingVertical: moderateScale(14, width),
//       backgroundColor: '#F0F9FF',
//       marginHorizontal: moderateScale(14, width),
//       marginTop: moderateScale(14, width),
//       borderRadius: moderateScale(10, width),
//       borderWidth: 1,
//       borderColor: '#BAE6FD',
//     },
//     mapOptionDisabled: {
//       opacity: 0.5,
//     },
//     mapIconWrapper: {
//       width: moderateScale(44, width),
//       height: moderateScale(44, width),
//       borderRadius: moderateScale(22, width),
//       backgroundColor: '#FFFFFF',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: moderateScale(10, width),
//     },
//     mapOptionContent: { flex: 1 },
//     mapOptionTitle: {
//       fontSize: normalize(15, width),
//       fontWeight: '600',
//       color: '#003EF9',
//       marginBottom: moderateScale(2, width),
//     },
//     mapOptionSubtitle: {
//       fontSize: normalize(11, width),
//       color: '#64748B',
//       lineHeight: normalize(16, width),
//     },
//     dividerWithText: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: moderateScale(16, width),
//       marginVertical: moderateScale(14, width),
//     },
//     dividerLineShort: {
//       flex: 1,
//       height: 1,
//       backgroundColor: '#E5E7EB',
//     },
//     dividerText: {
//       fontSize: normalize(10, width),
//       color: '#9CA3AF',
//       fontWeight: '600',
//       marginHorizontal: moderateScale(10, width),
//     },
//     addressList: {
//       paddingHorizontal: moderateScale(14, width),
//     },
//     locationItem: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingVertical: moderateScale(12, width),
//       paddingHorizontal: moderateScale(10, width),
//     },
//     addressItemSelected: {
//       backgroundColor: '#F0F9FF',
//       borderRadius: moderateScale(8, width),
//     },
//     locationItemIcon: {
//       width: moderateScale(40, width),
//       height: moderateScale(40, width),
//       borderRadius: moderateScale(20, width),
//       backgroundColor: '#E0F2FE',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: moderateScale(10, width),
//     },
//     locationItemContent: {
//       flex: 1,
//       marginRight: moderateScale(6, width),
//     },
//     locationItemName: {
//       fontSize: normalize(14, width),
//       fontWeight: '600',
//       color: '#1F2937',
//       marginBottom: moderateScale(3, width),
//     },
//     locationItemAddress: {
//       fontSize: normalize(11, width),
//       color: '#6B7280',
//       lineHeight: normalize(15, width),
//     },
//     itemSeparator: {
//       height: 1,
//       backgroundColor: '#F3F4F6',
//       marginLeft: moderateScale(60, width),
//     },
//     emptyAddressContainer: {
//       alignItems: 'center',
//       padding: moderateScale(40, width),
//     },
//     emptyAddressText: {
//       fontSize: normalize(16, width),
//       fontWeight: '600',
//       color: '#6B7280',
//       marginTop: moderateScale(12, width),
//     },
//     emptyAddressSubtext: {
//       fontSize: normalize(14, width),
//       color: '#9CA3AF',
//       marginTop: moderateScale(4, width),
//       textAlign: 'center',
//     },
//     photoInfoSection: {
//       paddingHorizontal: moderateScale(16, width),
//       paddingVertical: moderateScale(10, width),
//       backgroundColor: '#F9FAFB',
//       marginHorizontal: moderateScale(14, width),
//       marginTop: moderateScale(10, width),
//       borderRadius: moderateScale(10, width),
//       gap: moderateScale(6, width),
//     },
//     photoInfoItem: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: moderateScale(6, width),
//     },
//     photoInfoText: {
//       fontSize: normalize(12, width),
//       color: '#6B7280',
//       fontWeight: '500',
//     },
//     photoInfoTextSuccess: {
//       color: '#16A34A',
//       fontWeight: '600',
//     },
//     requirementsScrollView: {
//       maxHeight: height * 0.26,
//     },
//     requirementsList: {
//       paddingHorizontal: moderateScale(16, width),
//       gap: moderateScale(10, width),
//       paddingBottom: moderateScale(14, width),
//     },
//     requirementItem: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       gap: moderateScale(10, width),
//     },
//     requirementIconCircle: {
//       width: moderateScale(34, width),
//       height: moderateScale(34, width),
//       borderRadius: moderateScale(17, width),
//       backgroundColor: '#E0F2FE',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     requirementIconCircleComplete: {
//       backgroundColor: '#DCFCE7',
//     },
//     requirementContent: {
//       flex: 1,
//     },
//     requirementTitle: {
//       fontSize: normalize(13, width),
//       fontWeight: '600',
//       color: '#1F2937',
//       marginBottom: moderateScale(2, width),
//     },
//     requirementDescription: {
//       fontSize: normalize(11, width),
//       color: '#6B7280',
//       lineHeight: normalize(15, width),
//     },
//     nextButtonModal: {
//       marginHorizontal: moderateScale(16, width),
//       marginTop: moderateScale(14, width),
//       height: Math.max(minTouchTarget, moderateScale(50, width)),
//       backgroundColor: '#003EF9',
//       borderRadius: moderateScale(10, width),
//       alignItems: 'center',
//       justifyContent: 'center',
//       elevation: 2,
//       shadowColor: '#000',
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       shadowOffset: { width: 0, height: 2 },
//     },
//     nextButtonModalText: {
//       fontSize: normalize(15, width),
//       fontWeight: '700',
//       color: '#FFFFFF',
//     },
//   });
// };

// export default UploadScreen3;
