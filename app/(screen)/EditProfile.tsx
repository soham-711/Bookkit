

// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import * as ImagePicker from "expo-image-picker";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   ImageBackground,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useWindowDimensions,
//   View,
// } from "react-native";

// import * as FileSystem from "expo-file-system/legacy";
// import { supabase } from "../../Utils/supabase";

// import { useProfileStore } from "../../Context/ProfileContext";

// interface ProfileData {
//   name: string;
//   mobile: string;
//   email: string;
//   dob: string;
//   address: string;
// }

// interface AddressItem {
//   id: string;
//   title: string;
//   address: string;
//   isDefault: boolean;
// }

// const clamp = (n: number, min: number, max: number) =>
//   Math.max(min, Math.min(max, n));

// const ProfileScreen: React.FC = () => {
//   const { width, height } = useWindowDimensions();
//   const styles = useMemo(() => makeStyles(width, height), [width, height]);

//   const [profileData, setProfileData] = useState<ProfileData>({
//     name: "",
//     mobile: "",
//     email: "",
//     dob: "",
//     address: "",
//   });

//   const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
//   const [avatarRemoteUrl, setAvatarRemoteUrl] = useState<string | null>(null);
//   const [avatarToUpload, setAvatarToUpload] = useState<{
//     uri: string;
//   } | null>(null);

//   const [pendingEmail, setPendingEmail] = useState(profileData.email);
//   const [editingField, setEditingField] = useState<keyof ProfileData | null>(
//     null
//   );
//   const [isDirty, setIsDirty] = useState(false);

//   // Date picker state
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date());
// const [imageViewerVisible, setImageViewerVisible] = useState(false)

//   const formatDOBForDB = (dob: string | null) => {
//     if (!dob) return null;

//     // expects DD/MM/YYYY
//     const [dd, mm, yyyy] = dob.split("/");
//     return `${yyyy}-${mm}-${dd}`;
//   };

//   // Address management state
//   const [showAddressModal, setShowAddressModal] = useState(false);
//   const [addresses, setAddresses] = useState<AddressItem[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);

//   // Image picker modal state
//   const [showImagePickerModal, setShowImagePickerModal] = useState(false);

//   const inputRefs = useRef<Record<string, TextInput | null>>({});

//   const { refreshProfileSilently } = useProfileStore();

//   const handleChange = (field: keyof ProfileData) => {
//     if (field === "mobile") {
//       Alert.alert("Mobile Number", "Mobile number cannot be changed.");
//       return;
//     }

//     if (field === "dob") {
//       setShowDatePicker(true);
//       return;
//     }

//     if (field === "address") {
//       setShowAddressModal(true);
//       return;
//     }

//     setEditingField(field);
//     setTimeout(() => inputRefs.current[field]?.focus(), 0);
//   };

//   const stopEditing = () => {
//     if (editingField === "email") {
//       setProfileData((p) => ({ ...p, email: pendingEmail }));
//     }
//     setEditingField(null);
//   };

//   // Date picker handlers
//   const onDateChange = (event: any, date?: Date) => {
//     if (event.type === "set" && date) {
//       setSelectedDate(date);
//       const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
//         date.getMonth() + 1
//       )
//         .toString()
//         .padStart(2, "0")}/${date.getFullYear()}`;
//       setProfileData((prev) => ({ ...prev, dob: formattedDate }));
//       setIsDirty(true);
//     }
//     setShowDatePicker(false);
//   };

//   // Address management handlers
//   const handleSelectAddress = (address: AddressItem) => {
//     const updatedAddresses = addresses.map((addr) => ({
//       ...addr,
//       isDefault: addr.id === address.id,
//     }));

//     setAddresses(updatedAddresses);
//     setProfileData((prev) => ({ ...prev, address: address.address }));
//     setShowAddressModal(false);
//     setIsDirty(true);
//   };

//   // Function to redirect to address creation screen
//   const handleAddNewAddress = () => {
//     setShowAddressModal(false);
//     router.push("/(screen)/UserCurrentLocation");
//   };

//   const onPressCamera = () => {
//     setShowImagePickerModal(true);
//   };

//   // WORKING UPLOAD FUNCTION
//   const uploadAvatarToSupabase = async (
//     imageUri: string,
//     userId: string
//   ): Promise<string | null> => {
//     try {
//       console.log("🔄 Uploading avatar...");

//       // Check if supabase is initialized
//       if (!supabase) {
//         console.error("❌ Supabase not initialized");
//         return null;
//       }

//       // Read the image file
//       const base64 = await FileSystem.readAsStringAsync(imageUri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });

//       // Convert to Uint8Array
//       const binaryString = atob(base64);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }

//       // Use unique filename
//       const filePath = `${userId}/avatar_${Date.now()}.jpg`;

//       console.log("📤 Uploading to:", filePath);

//       // Try upload with ArrayBuffer
//       const { data, error } = await supabase.storage
//         .from("avatars")
//         .upload(filePath, bytes.buffer, {
//           contentType: "image/jpeg",
//           upsert: true,
//         });

//       if (error) {
//         console.log("❌ ArrayBuffer failed, trying blob...");

//         // Try with Blob
//         const blob = new Blob([bytes], { type: "image/jpeg" });

//         const { data: data2, error: error2 } = await supabase.storage
//           .from("avatars")
//           .upload(filePath, blob, {
//             contentType: "image/jpeg",
//             upsert: true,
//           });

//         if (error2) {
//           console.error("❌ All upload methods failed:", error2);
//           return null;
//         }

//         console.log("✅ Upload successful via blob");
//       } else {
//         console.log("✅ Upload successful via ArrayBuffer");
//       }

//       // Get public URL
//       const { data: urlData } = supabase.storage
//         .from("avatars")
//         .getPublicUrl(filePath);

//       console.log("🔗 Public URL:", urlData.publicUrl);
//       return urlData.publicUrl;
//     } catch (error) {
//       console.error("💥 Upload failed completely:", error);
//       return null;
//     }
//   };
//   const takePhoto = async () => {
//     setShowImagePickerModal(false);
//     const permission = await ImagePicker.requestCameraPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert(
//         "Permission Required",
//         "Camera permission is needed to take photos"
//       );
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ["images"],
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.7,
//     });

//     if (!result.canceled && result.assets[0]) {
//       const asset = result.assets[0];
//       setAvatarLocalUri(asset.uri);
//       setAvatarToUpload({
//         uri: asset.uri,
//       });
//       setIsDirty(true);
//     }
//   };

//   const pickFromGallery = async () => {
//     setShowImagePickerModal(false);
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert(
//         "Permission Required",
//         "Gallery permission is needed to select photos"
//       );
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ["images"],
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.7,
//     });

//     if (!result.canceled && result.assets[0]) {
//       const asset = result.assets[0];
//       setAvatarLocalUri(asset.uri);
//       setAvatarToUpload({
//         uri: asset.uri,
//       });
//       setIsDirty(true);
//     }
//   };

//   const isValidEmail = (email: string) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

//   const updateProfile = async () => {
//     if (!userId) {
//       Alert.alert("Error", "User not found");
//       return;
//     }

//     if (!isValidEmail(pendingEmail)) {
//       Alert.alert("Invalid Email", "Please enter a valid email address");
//       return;
//     }

//     try {
//       setSaving(true);
//       let finalAvatarUrl = avatarRemoteUrl;

//       // Upload avatar only if a new image was selected
//       if (avatarToUpload && avatarToUpload.uri) {
//         console.log("📸 Uploading new avatar...");
//         const uploadedUrl = await uploadAvatarToSupabase(
//           avatarToUpload.uri,
//           userId
//         );

//         if (uploadedUrl) {
//           finalAvatarUrl = uploadedUrl;

//           console.log("✅ Avatar URL updated:", finalAvatarUrl);
//         } else {
//           // If upload fails, keep the old avatar URL
//           console.log("⚠️ Avatar upload failed, keeping previous image");
//         }
//       }

//       // Format DOB for database
//       const formattedDOB = formatDOBForDB(profileData.dob);

//       // Validate DOB before sending to database
//       if (formattedDOB === null && profileData.dob) {
//         console.error("Invalid DOB format:", profileData.dob);
//         Alert.alert(
//           "Invalid Date of Birth",
//           "Please reset your DOB again. Use format DD/MM/YYYY"
//         );
//         setSaving(false);
//         return;
//       }

//       // Prepare update data
//       const updateData: any = {
//         full_name: profileData.name.trim(),
//         email: pendingEmail.trim(),
//         avatar_url: finalAvatarUrl,
//         updated_at: new Date().toISOString(),
//       };

//       // Only add date_of_birth if it's valid and not null
//       if (formattedDOB !== null) {
//         updateData.date_of_birth = formattedDOB;
//       }

//       console.log("Updating profile with data:", updateData);

//       // Update profile in Supabase database
//       const { error: profileError } = await supabase
//         .from("profiles")
//         .update(updateData)
//         .eq("user_id", userId);

//       if (profileError) {
//         console.error("Profile update error:", profileError);

//         // Check if error is related to date format
//         if (
//           profileError.code === "22007" || // PostgreSQL invalid date format error
//           profileError.message.includes("date") ||
//           profileError.message.includes("DOB")
//         ) {
//           Alert.alert(
//             "Date of Birth Error",
//             "Please reset your DOB again. Use format DD/MM/YYYY"
//           );
//         } else {
//           throw profileError;
//         }
//         return;
//       }

//       // Update default address if needed
//       const selected = addresses.find((a) => a.isDefault);
//       if (selected) {
//         await supabase
//           .from("addresses")
//           .update({ is_default: false })
//           .eq("user_id", userId);

//         await supabase
//           .from("addresses")
//           .update({ is_default: true })
//           .eq("id", selected.id);
//       }

//       // Update local state
//       setAvatarRemoteUrl(finalAvatarUrl);
//       setAvatarLocalUri(null);
//       setAvatarToUpload(null);
//       setIsDirty(false);
//       setEditingField(null);
//       await refreshProfileSilently();
//       Alert.alert("Success", "Profile updated successfully!");
//     } catch (err: any) {
//       console.error("Update error:", err);

//       // Check if error is date-related
//       if (
//         err.code === "22007" ||
//         err.message?.includes("date") ||
//         err.message?.includes("DOB") ||
//         err.message?.includes("invalid input syntax")
//       ) {
//         Alert.alert(
//           "Date of Birth Error",
//           "Please reset your DOB again. Use format DD/MM/YYYY"
//         );
//       } else {
//         Alert.alert("Error", err.message || "Failed to update profile");
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isEditing = useMemo(() => editingField !== null, [editingField]);

//   useEffect(() => {
//     const loadProfile = async () => {
//       setLoading(true);

//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();

//         if (!user) {
//           Alert.alert("Error", "Please log in to view profile");
//           router.back();
//           return;
//         }

//         setUserId(user.id);

//         // Fetch profile
//         const { data: profile, error: profileError } = await supabase
//           .from("profiles")
//           .select("*")
//           .eq("user_id", user.id)
//           .single();

//         if (profileError) throw profileError;

//         if (profile) {
//           // Add timestamp to prevent caching
//           const avatarUrl = profile.avatar_url
//             ? `${profile.avatar_url}?t=${Date.now()}`
//             : null;

//           setAvatarRemoteUrl(avatarUrl);

//           setProfileData({
//             name: profile.full_name || "",
//             mobile: user.phone || "",
//             email: profile.email || "",
//             dob: profile.date_of_birth || "",
//             address: profile.default_address || "",
//           });
//           setPendingEmail(profile.email || "");
//         }

//         // Fetch addresses
//         const { data: addr, error: addrError } = await supabase
//           .from("addresses")
//           .select("*")
//           .eq("user_id", user.id)
//           .order("is_default", { ascending: false });

//         if (addrError) throw addrError;

//         if (addr) {
//           const formattedAddresses = addr.map((a) => ({
//             id: a.id,
//             title: a.address_type,
//             address: a.full_address,
//             isDefault: a.is_default,
//           }));

//           setAddresses(formattedAddresses);

//           const defaultAddr = addr.find((a) => a.is_default);
//           if (defaultAddr) {
//             setProfileData((p) => ({
//               ...p,
//               address: defaultAddr.full_address,
//             }));
//           }
//         }
//       } catch (error: any) {
//         console.error("Load profile error:", error);
//         Alert.alert("Error", "Failed to load profile data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <LinearGradient
//       colors={["#ffffffff", "#aff6f6ff"]}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//       style={styles.container}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => router.push("/(screen)/Profile")}
//           >
//             <Ionicons name="arrow-back" size={22} color="black" />
//             <Text style={styles.headerText}>Your profile</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Avatar */}
//         <View style={styles.hero}>
//           <View style={styles.avatarContainer}>
//             <View style={styles.avatarWrapper}>
//               <TouchableOpacity  onPress={() => setImageViewerVisible(true)}
//                 activeOpacity={0.8}>
//                 <View style={styles.avatarRing}>
//                 <Image
//                   source={
//                     avatarLocalUri
//                       ? { uri: avatarLocalUri }
//                       : avatarRemoteUrl
//                       ? { uri: avatarRemoteUrl }
//                       : require("../../assets/images/profile.png")
//                   }
//                   style={styles.profileImage}
//                   resizeMode="cover"
//                 />
//               </View>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.editBadge}
//                 onPress={onPressCamera}
//                 activeOpacity={0.8}
//               >
//                 <Ionicons name="camera" size={14} color="#11a7ecff" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Card Background */}
//         <ImageBackground
//           source={require("../../assets/images/Editprofile.png")}
//           style={styles.formCard}
//           imageStyle={styles.formCardImage}
//           resizeMode="stretch"
//         >
//           <View style={styles.formContent}>
//             <Field
//               styles={styles}
//               label="Name"
//               value={profileData.name}
//               editable={editingField === "name"}
//               disabledAction={isEditing && editingField !== "name"}
//               onPressChange={() => handleChange("name")}
//               onChangeText={(t) => {
//                 setProfileData((p) => ({ ...p, name: t }));
//                 setIsDirty(true);
//               }}
//               inputRef={(r) => (inputRefs.current["name"] = r)}
//               onBlur={stopEditing}
//             />

//             <Field
//               styles={styles}
//               label="Mobile"
//               value={profileData.mobile}
//               disabled={true}
//               disabledAction={true}
//               onPressChange={() => handleChange("mobile")}
//               icon="lock-closed"
//             />

//             <Field
//               styles={styles}
//               label="Email"
//               value={
//                 editingField === "email" ? pendingEmail : profileData.email
//               }
//               editable={editingField === "email"}
//               disabledAction={isEditing && editingField !== "email"}
//               onPressChange={() => handleChange("email")}
//               onChangeText={(t) => {
//                 setPendingEmail(t);
//                 setIsDirty(true);
//               }}
//               inputRef={(r) => (inputRefs.current["email"] = r)}
//               keyboardType="email-address"
//               onBlur={stopEditing}
//             />

//             <Field
//               styles={styles}
//               label="Date of birth"
//               value={profileData.dob}
//               disabledAction={isEditing && editingField !== "dob"}
//               onPressChange={() => handleChange("dob")}
//               icon="calendar"
//             />

//             <Field
//               styles={styles}
//               label="Address"
//               value={profileData.address}
//               disabledAction={isEditing && editingField !== "address"}
//               onPressChange={() => handleChange("address")}
//               icon="location"
//             />
//           </View>
//         </ImageBackground>

//         {/* Update Profile Button - NOW CONNECTED TO updateProfile */}
//         <TouchableOpacity
//           style={[styles.updateButton, !isDirty && styles.updateButtonDisabled]}
//           disabled={!isDirty || saving}
//           onPress={updateProfile} // This is now connected
//         >
//           {saving ? (
//             <ActivityIndicator color="#ffffffff" />
//           ) : (
//             <Text style={styles.updateButtonText}>Update profile</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Date Picker Modal */}
//       {showDatePicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display={Platform.OS === "ios" ? "spinner" : "default"}
//           onChange={onDateChange}
//           maximumDate={new Date()}
//           themeVariant="light"
//         />
//       )}

//       {/* Image Picker Modal */}
//       <Modal
//         visible={showImagePickerModal}
//         animationType="fade"
//         transparent={true}
//         onRequestClose={() => setShowImagePickerModal(false)}
//       >
//         <View style={styles.imageModalOverlay}>
//           <View style={styles.imageModalContent}>
//             <View style={styles.imageModalHeader}>
//               <Text style={styles.imageModalTitle}>Profile Photo</Text>
//               <Text style={styles.imageModalSubtitle}>
//                 Choose how to update your profile picture
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={styles.imageModalOption}
//               onPress={takePhoto}
//               activeOpacity={0.7}
//             >
//               <View style={styles.imageOptionIconContainer}>
//                 <Ionicons name="camera-outline" size={24} color="#4F46E5" />
//               </View>
//               <View style={styles.imageOptionContent}>
//                 <Text style={styles.imageOptionTitle}>Take Photo</Text>
//                 <Text style={styles.imageOptionDescription}>
//                   Use your camera to take a new photo
//                 </Text>
//               </View>
//               <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
//             </TouchableOpacity>

//             <View style={styles.imageModalDivider} />

//             <TouchableOpacity
//               style={styles.imageModalOption}
//               onPress={pickFromGallery}
//               activeOpacity={0.7}
//             >
//               <View style={styles.imageOptionIconContainer}>
//                 <Ionicons name="images-outline" size={24} color="#4F46E5" />
//               </View>
//               <View style={styles.imageOptionContent}>
//                 <Text style={styles.imageOptionTitle}>Choose from Gallery</Text>
//                 <Text style={styles.imageOptionDescription}>
//                   Select a photo from your device
//                 </Text>
//               </View>
//               <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.imageModalCancelButton}
//               onPress={() => setShowImagePickerModal(false)}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.imageModalCancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Address Selection Modal */}
//       <Modal
//         visible={showAddressModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowAddressModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Address</Text>
//               <TouchableOpacity
//                 onPress={() => setShowAddressModal(false)}
//                 style={styles.closeButton}
//               >
//                 <Ionicons name="close" size={24} color="#000" />
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={addresses}
//               keyExtractor={(item) => item.id}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[
//                     styles.addressItem,
//                     item.isDefault && styles.addressItemSelected,
//                   ]}
//                   onPress={() => handleSelectAddress(item)}
//                 >
//                   <View style={styles.addressItemContent}>
//                     <View style={styles.addressHeader}>
//                       <Text style={styles.addressTitle}>{item.title}</Text>
//                       {item.isDefault && (
//                         <View style={styles.defaultBadge}>
//                           <Text style={styles.defaultBadgeText}>Default</Text>
//                         </View>
//                       )}
//                     </View>
//                     <Text style={styles.addressText}>{item.address}</Text>
//                   </View>
//                   <Ionicons
//                     name={
//                       item.isDefault ? "checkmark-circle" : "radio-button-off"
//                     }
//                     size={24}
//                     color={item.isDefault ? "#10B981" : "#9CA3AF"}
//                   />
//                 </TouchableOpacity>
//               )}
//               ItemSeparatorComponent={() => <View style={styles.separator} />}
//               style={styles.addressList}
//               ListEmptyComponent={
//                 <View style={styles.emptyAddressContainer}>
//                   <Ionicons name="location-outline" size={48} color="#9CA3AF" />
//                   <Text style={styles.emptyAddressText}>
//                     No addresses saved yet
//                   </Text>
//                   <Text style={styles.emptyAddressSubtext}>
//                     Add your first address to get started
//                   </Text>
//                 </View>
//               }
//             />

//             {/* Add New Address Button */}
//             <View style={styles.addAddressContainer}>
//               <TouchableOpacity
//                 style={styles.addAddressButton}
//                 onPress={handleAddNewAddress}
//                 activeOpacity={0.7}
//               >
//                 <LinearGradient
//                   colors={["#3B82F6", "#4979ffff"]}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                   style={styles.addAddressButtonGradient}
//                 >
//                   <Text style={styles.addAddressButtonText}>
//                     Add New Address
//                   </Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={imageViewerVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setImageViewerVisible(false)}
//       >
//         <View style={styles.imageViewerContainer}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setImageViewerVisible(false)}
//             activeOpacity={0.8}
//           >
//             <Ionicons name="close" size={30} color="#FFFFFF" />
//           </TouchableOpacity>
//           <Image
//             source={
//                     avatarLocalUri
//                       ? { uri: avatarLocalUri }
//                       : avatarRemoteUrl
//                       ? { uri: avatarRemoteUrl }
//                       : require("../../assets/images/profile.png")
//                   }
//             style={styles.fullScreenImage}
//             resizeMode="contain"
//           />
//         </View>
//       </Modal>
//     </LinearGradient>
//   );
// };

// // Field component remains the same...
// function Field({
//   styles,
//   label,
//   value,
//   disabled,
//   editable,
//   onPressChange,
//   onChangeText,
//   inputRef,
//   onBlur,
//   disabledAction,
//   keyboardType,
//   icon,
// }: {
//   styles: ReturnType<typeof makeStyles>;
//   label: string;
//   value: string;
//   disabled?: boolean;
//   editable?: boolean;
//   onPressChange?: () => void;
//   onChangeText?: (t: string) => void;
//   inputRef?: (r: TextInput | null) => void;
//   onBlur?: () => void;
//   disabledAction?: boolean;
//   keyboardType?: "default" | "phone-pad" | "email-address";
//   icon?: string;
// }) {
//   return (
//     <View style={styles.fieldWrap}>
//       <View style={styles.floatingLabel}>
//         <Text style={styles.floatingLabelText}>{label}</Text>
//       </View>

//       <View style={[styles.boxRow, disabled && styles.boxRowDisabled]}>
//         <View style={styles.fieldLeftContent}>
//           {icon && (
//             <Ionicons
//               name={icon as any}
//               size={styles.iconSize.fontSize}
//               color={disabled ? "#9CA3AF" : "#6B7280"}
//               style={styles.fieldIcon}
//             />
//           )}
//           {editable && !disabled ? (
//             <TextInput
//               ref={inputRef}
//               value={value}
//               onChangeText={onChangeText}
//               style={styles.boxInput}
//               onBlur={onBlur}
//               keyboardType={keyboardType || "default"}
//               returnKeyType="done"
//               autoCapitalize="none"
//               autoFocus={true}
//             />
//           ) : (
//             <Text
//               style={[styles.boxValue, disabled && styles.boxValueDisabled]}
//               numberOfLines={1}
//             >
//               {value}
//             </Text>
//           )}
//         </View>

//         {!disabled && (
//           <TouchableOpacity
//             onPress={onPressChange}
//             hitSlop={10}
//             disabled={!!disabledAction}
//             style={disabledAction ? styles.changeDisabledWrap : undefined}
//           >
//             <Text style={styles.changeButton}>CHANGE</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// }

// // makeStyles function remains exactly the same...
// const makeStyles = (width: number, height: number) => {
//   const s = (n: number) => (width / 375) * n;
//   const r = (n: number) => Math.round(n);

//   const topPad = clamp(s(45), 24, 60);
//   const sidePad = clamp(s(16), 12, 22);

//   const avatarSize = clamp(s(110), 92, 124);
//   const avatarRadius = avatarSize / 2;

//   const heroHeight = clamp(s(150), 120, 170);
//   const avatarOverlap = clamp(s(55), 42, 70);

//   return StyleSheet.create({
//     container: { flex: 1 },

//     scrollContent: {
//       paddingHorizontal: sidePad,
//       paddingTop: topPad,
//       paddingBottom: clamp(s(30), 18, 40),
//     },

//     header: { marginBottom: clamp(s(8), 6, 12) },

//     backButton: { flexDirection: "row", alignItems: "center" },

//     headerText: {
//       fontSize: clamp(s(18), 16, 20),
//       fontWeight: "800",
//       color: "#000",
//       marginLeft: clamp(s(6), 4, 10),
//     },

//     hero: {
//       height: heroHeight,
//       justifyContent: "center",
//       alignItems: "center",
//       position: "relative",
//       marginBottom: clamp(s(8), 6, 12),
//       marginTop: clamp(s(20), 10, 26),
//     },

//     avatarContainer: {
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 20,
//       transform: [{ translateY: avatarOverlap }],
//     },

//     avatarWrapper: { position: "relative" },

//     avatarRing: {
//       width: avatarSize,
//       height: avatarSize,
//       borderRadius: avatarRadius,
//       borderWidth: 2,
//       borderColor: "rgba(102, 52, 201, 0.55)",
//       backgroundColor: "rgba(255,255,255,0.65)",
//       overflow: "hidden",
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     profileImage: { width: "100%", height: "100%" },

//     editBadge: {
//       position: "absolute",
//       right: clamp(s(2), 0, 6),
//       bottom: clamp(s(6), 4, 10),
//       width: clamp(s(26), 22, 30),
//       height: clamp(s(26), 22, 30),
//       borderRadius: clamp(s(26), 22, 30) / 2,
//       backgroundColor: "#FFFFFF",
//       borderWidth: 1,
//       borderColor: "rgba(0,0,0,0.25)",
//       alignItems: "center",
//       justifyContent: "center",
//     },
// // Image Viewer Styles
//     imageViewerContainer: {
//       flex: 1,
//       backgroundColor: "rgba(0,0,0,0.95)",
//       justifyContent: "center",
//       alignItems: "center",
//     },

//     fullScreenImage: {
//       width: width * 0.9,
//       height: height * 0.65,
//       maxWidth: 600,
//       maxHeight: 800,
//     },
//     formCard: {
//       minHeight: clamp(s(360), 320, 420),
//       marginBottom: clamp(s(16), 12, 20),
//       overflow: "hidden",
//     },

//     formCardImage: { borderRadius: 14 },

//     formContent: {
//       flex: 1,
//       paddingHorizontal: clamp(s(18), 14, 22),
//       paddingTop: clamp(s(92), 76, 110),
//       paddingBottom: clamp(s(14), 10, 18),
//     },

//     fieldWrap: {
//       marginBottom: clamp(s(10), 8, 12),
//       marginTop: clamp(s(6), 4, 8),
//       position: "relative",
//     },

//     floatingLabel: {
//       position: "absolute",
//       left: clamp(s(14), 10, 18),
//       top: -7,
//       paddingHorizontal: clamp(s(6), 4, 8),
//       backgroundColor: "#FFFFFFFF",
//       borderRadius: 6,
//       zIndex: 2,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//     },

//     floatingLabelText: {
//       fontSize: clamp(s(10), 9, 11),
//       fontWeight: "700",
//       color: "rgba(0,0,0,0.65)",
//     },

//     boxRow: {
//       minHeight: clamp(s(44), 42, 48),
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       backgroundColor: "rgba(255, 255, 255, 0.45)",
//       paddingHorizontal: clamp(s(14), 12, 16),
//       alignItems: "center",
//       flexDirection: "row",
//       justifyContent: "space-between",
//     },

//     boxRowDisabled: {
//       borderColor: "#44D6FF",
//       backgroundColor: "rgba(118, 192, 200, 0.42)",
//     },

//     fieldLeftContent: {
//       flex: 1,
//       flexDirection: "row",
//       alignItems: "center",
//     },

//     fieldIcon: {
//       marginRight: clamp(s(10), 8, 12),
//     },

//     iconSize: {
//       fontSize: clamp(s(16), 14, 18),
//     },

//     boxValue: {
//       flex: 1,
//       marginRight: clamp(s(10), 8, 12),
//       fontSize: clamp(s(16), 14, 17),
//       fontWeight: "400",
//       color: "#0B0B0B",
//     },

//     boxValueDisabled: { color: "rgba(255,255,255,0.88)" },

//     boxInput: {
//       flex: 1,
//       marginRight: clamp(s(10), 8, 12),
//       fontSize: clamp(s(16), 14, 17),
//       fontWeight: "400",
//       color: "#0B0B0B",
//       paddingVertical: 0,
//     },

//     changeButton: {
//       fontSize: clamp(s(11), 10, 12),
//       color: "#EF4444",
//       fontWeight: "800",
//       letterSpacing: 0.6,
//     },

//     changeDisabledWrap: { opacity: 0.35 },

//     updateButton: {
//       height: clamp(s(50), 46, 54),
//       borderRadius: 12,
//       backgroundColor: "rgba(44, 241, 255, 0.9)",
//       borderWidth: 1,
//       borderColor: "rgba(0,0,0,0.08)",
//       alignItems: "center",
//       justifyContent: "center",
//       ...Platform.select({
//         android: { elevation: 2 },
//         ios: {
//           shadowColor: "#000",
//           shadowOpacity: 0.07,
//           shadowRadius: 10,
//           shadowOffset: { width: 0, height: 6 },
//         },
//       }),
//     },

//     updateButtonDisabled: { opacity: 0.6 },

//     updateButtonText: {
//       fontSize: clamp(s(16), 14, 17),
//       fontWeight: "700",
//       color: "rgba(255, 255, 255, 1)",
//     },

//     // Image Picker Modal Styles
//     imageModalOverlay: {
//       flex: 1,
//       backgroundColor: "rgba(0, 0, 0, 0.5)",
//       justifyContent: "center",
//       alignItems: "center",
//       padding: clamp(s(20), 16, 24),
//     },

//     imageModalContent: {
//       width: "100%",
//       maxWidth: 400,
//       backgroundColor: "#FFFFFF",
//       borderRadius: 20,
//       overflow: "hidden",
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 10 },
//       shadowOpacity: 0.25,
//       shadowRadius: 20,
//       elevation: 10,
//     },

//     imageModalHeader: {
//       padding: clamp(s(24), 20, 28),
//       alignItems: "center",
//       borderBottomWidth: 1,
//       borderBottomColor: "#F3F4F6",
//     },

//     imageModalTitle: {
//       fontSize: clamp(s(20), 18, 22),
//       fontWeight: "700",
//       color: "#1F2937",
//       marginBottom: clamp(s(8), 6, 10),
//     },

//     imageModalSubtitle: {
//       fontSize: clamp(s(14), 13, 15),
//       color: "#6B7280",
//       textAlign: "center",
//       lineHeight: clamp(s(20), 18, 22),
//     },

//     imageModalOption: {
//       flexDirection: "row",
//       alignItems: "center",
//       padding: clamp(s(20), 18, 24),
//       backgroundColor: "#FFFFFF",
//     },

//     imageOptionIconContainer: {
//       width: clamp(s(48), 44, 52),
//       height: clamp(s(48), 44, 52),
//       borderRadius: 12,
//       backgroundColor: "rgba(79, 70, 229, 0.1)",
//       alignItems: "center",
//       justifyContent: "center",
//       marginRight: clamp(s(16), 14, 18),
//     },

//     imageOptionContent: {
//       flex: 1,
//     },

//     imageOptionTitle: {
//       fontSize: clamp(s(16), 15, 17),
//       fontWeight: "600",
//       color: "#1F2937",
//       marginBottom: clamp(s(4), 2, 6),
//     },

//     imageOptionDescription: {
//       fontSize: clamp(s(14), 13, 15),
//       color: "#6B7280",
//     },

//     imageModalDivider: {
//       height: 1,
//       backgroundColor: "#F3F4F6",
//       marginHorizontal: clamp(s(20), 16, 24),
//     },

//     imageModalCancelButton: {
//       padding: clamp(s(20), 18, 24),
//       alignItems: "center",
//       borderTopWidth: 1,
//       borderTopColor: "#F3F4F6",
//     },

//     imageModalCancelText: {
//       fontSize: clamp(s(16), 15, 17),
//       fontWeight: "600",
//       color: "#EF4444",
//     },

//     // Address Modal Styles
//     modalOverlay: {
//       flex: 1,
//       backgroundColor: "rgba(0, 0, 0, 0.5)",
//       justifyContent: "flex-end",
//     },

//     modalContent: {
//       backgroundColor: "#FFFFFF",
//       borderTopLeftRadius: 20,
//       borderTopRightRadius: 20,
//       maxHeight: height * 0.8,
//       paddingBottom:
//         Platform.OS === "ios" ? clamp(s(34), 20, 40) : clamp(s(20), 16, 24),
//     },

//     modalHeader: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       paddingHorizontal: clamp(s(20), 16, 24),
//       paddingVertical: clamp(s(16), 14, 20),
//       borderBottomWidth: 1,
//       borderBottomColor: "#E5E7EB",
//     },

//     modalTitle: {
//       fontSize: clamp(s(18), 16, 20),
//       fontWeight: "700",
//       color: "#1F2937",
//     },

//     closeButton: {
//       padding: clamp(s(4), 2, 6),
//     },

//     addressList: {
//       maxHeight: height * 0.4,
//     },

//     addressItem: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingHorizontal: clamp(s(20), 16, 24),
//       paddingVertical: clamp(s(14), 12, 16),
//       backgroundColor: "#FFFFFF",
//     },

//     addressItemSelected: {
//       backgroundColor: "#F0F9FF",
//     },

//     addressItemContent: {
//       flex: 1,
//       marginRight: clamp(s(12), 10, 14),
//     },

//     addressHeader: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginBottom: clamp(s(4), 2, 6),
//     },

//     addressTitle: {
//       fontSize: clamp(s(16), 14, 17),
//       fontWeight: "600",
//       color: "#1F2937",
//       marginRight: clamp(s(8), 6, 10),
//     },

//     defaultBadge: {
//       backgroundColor: "#10B981",
//       paddingHorizontal: clamp(s(6), 4, 8),
//       paddingVertical: clamp(s(2), 1, 3),
//       borderRadius: 12,
//     },

//     defaultBadgeText: {
//       fontSize: clamp(s(10), 9, 11),
//       color: "#FFFFFF",
//       fontWeight: "600",
//     },

//     addressText: {
//       fontSize: clamp(s(14), 12, 15),
//       color: "#6B7280",
//       lineHeight: clamp(s(18), 16, 20),
//     },

//     separator: {
//       height: 1,
//       backgroundColor: "#E5E7EB",
//       marginHorizontal: clamp(s(20), 16, 24),
//     },

//     // Empty Address State
//     emptyAddressContainer: {
//       padding: clamp(s(40), 32, 48),
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     emptyAddressText: {
//       fontSize: clamp(s(16), 15, 17),
//       fontWeight: "600",
//       color: "#1F2937",
//       marginTop: clamp(s(16), 14, 18),
//       textAlign: "center",
//     },

//     emptyAddressSubtext: {
//       fontSize: clamp(s(14), 13, 15),
//       color: "#6B7280",
//       marginTop: clamp(s(8), 6, 10),
//       textAlign: "center",
//       lineHeight: clamp(s(20), 18, 22),
//     },

//     // Add Address Button
//     addAddressContainer: {
//       paddingHorizontal: clamp(s(20), 16, 24),
//       paddingTop: clamp(s(16), 14, 18),
//       paddingBottom:
//         Platform.OS === "ios" ? clamp(s(34), 20, 40) : clamp(s(20), 16, 24),
//       borderTopWidth: 1,
//       borderTopColor: "#E5E7EB",
//     },

//     addAddressButton: {
//       borderRadius: 12,
//       overflow: "hidden",
//       shadowColor: "#3B82F6",
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.25,
//       shadowRadius: 8,
//       elevation: 6,
//     },

//     addAddressButtonGradient: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       paddingVertical: clamp(s(16), 14, 18),
//       paddingHorizontal: clamp(s(24), 20, 28),
//     },

//     addAddressButtonText: {
//       fontSize: clamp(s(16), 15, 17),
//       fontWeight: "700",
//       color: "#FFFFFF",
//       marginLeft: clamp(s(10), 8, 12),
//     },
//   });
// };

// export default ProfileScreen;


import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView, // Added
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../../Utils/supabase";

import { useProfileStore } from "../../Context/ProfileContext";

interface ProfileData {
  name: string;
  mobile: string;
  email: string;
  dob: string;
  address: string;
}

interface AddressItem {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const ProfileScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    address: "",
  });

  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [avatarRemoteUrl, setAvatarRemoteUrl] = useState<string | null>(null);
  const [avatarToUpload, setAvatarToUpload] = useState<{
    uri: string;
  } | null>(null);

  const [pendingEmail, setPendingEmail] = useState(profileData.email);
  const [editingField, setEditingField] = useState<keyof ProfileData | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const formatDOBForDB = (dob: string | null) => {
    if (!dob) return null;

    // expects DD/MM/YYYY
    const [dd, mm, yyyy] = dob.split("/");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Address management state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Image picker modal state
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const { refreshProfileSilently } = useProfileStore();

  const handleChange = (field: keyof ProfileData) => {
    if (field === "mobile") {
      Alert.alert("Mobile Number", "Mobile number cannot be changed.");
      return;
    }

    if (field === "dob") {
      setShowDatePicker(true);
      return;
    }

    if (field === "address") {
      setShowAddressModal(true);
      return;
    }

    setEditingField(field);
    setTimeout(() => inputRefs.current[field]?.focus(), 0);
  };

  const stopEditing = () => {
    if (editingField === "email") {
      setProfileData((p) => ({ ...p, email: pendingEmail }));
    }
    setEditingField(null);
  };

  // Date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    if (event.type === "set" && date) {
      setSelectedDate(date);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
      setProfileData((prev) => ({ ...prev, dob: formattedDate }));
      setIsDirty(true);
    }
    setShowDatePicker(false);
  };

  // Address management handlers
  const handleSelectAddress = (address: AddressItem) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === address.id,
    }));

    setAddresses(updatedAddresses);
    setProfileData((prev) => ({ ...prev, address: address.address }));
    setShowAddressModal(false);
    setIsDirty(true);
  };

  // Function to redirect to address creation screen
  const handleAddNewAddress = () => {
    setShowAddressModal(false);
    router.push("/(screen)/UserCurrentLocation");
  };

  const onPressCamera = () => {
    setShowImagePickerModal(true);
  };

  // WORKING UPLOAD FUNCTION
  const uploadAvatarToSupabase = async (
    imageUri: string,
    userId: string
  ): Promise<string | null> => {
    try {
      console.log("🔄 Uploading avatar...");

      // Check if supabase is initialized
      if (!supabase) {
        console.error("❌ Supabase not initialized");
        return null;
      }

      // Read the image file
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Use unique filename
      const filePath = `${userId}/avatar_${Date.now()}.jpg`;

      console.log("📤 Uploading to:", filePath);

      // Try upload with ArrayBuffer
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, bytes.buffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.log("❌ ArrayBuffer failed, trying blob...");

        // Try with Blob
        const blob = new Blob([bytes], { type: "image/jpeg" });

        const { data: data2, error: error2 } = await supabase.storage
          .from("avatars")
          .upload(filePath, blob, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (error2) {
          console.error("❌ All upload methods failed:", error2);
          return null;
        }

        console.log("✅ Upload successful via blob");
      } else {
        console.log("✅ Upload successful via ArrayBuffer");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      console.log("🔗 Public URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error("💥 Upload failed completely:", error);
      return null;
    }
  };
  const takePhoto = async () => {
    setShowImagePickerModal(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take photos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatarLocalUri(asset.uri);
      setAvatarToUpload({
        uri: asset.uri,
      });
      setIsDirty(true);
    }
  };

  const pickFromGallery = async () => {
    setShowImagePickerModal(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Gallery permission is needed to select photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatarLocalUri(asset.uri);
      setAvatarToUpload({
        uri: asset.uri,
      });
      setIsDirty(true);
    }
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const updateProfile = async () => {
    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }

    if (!isValidEmail(pendingEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setSaving(true);
      let finalAvatarUrl = avatarRemoteUrl;

      // Upload avatar only if a new image was selected
      if (avatarToUpload && avatarToUpload.uri) {
        console.log("📸 Uploading new avatar...");
        const uploadedUrl = await uploadAvatarToSupabase(
          avatarToUpload.uri,
          userId
        );

        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;

          console.log("✅ Avatar URL updated:", finalAvatarUrl);
        } else {
          // If upload fails, keep the old avatar URL
          console.log("⚠️ Avatar upload failed, keeping previous image");
        }
      }

      // Format DOB for database
      const formattedDOB = formatDOBForDB(profileData.dob);

      // Validate DOB before sending to database
      if (formattedDOB === null && profileData.dob) {
        console.error("Invalid DOB format:", profileData.dob);
        Alert.alert(
          "Invalid Date of Birth",
          "Please reset your DOB again. Use format DD/MM/YYYY"
        );
        setSaving(false);
        return;
      }

      // Prepare update data
      const updateData: any = {
        full_name: profileData.name.trim(),
        email: pendingEmail.trim(),
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      };

      // Only add date_of_birth if it's valid and not null
      if (formattedDOB !== null) {
        updateData.date_of_birth = formattedDOB;
      }

      console.log("Updating profile with data:", updateData);

      // Update profile in Supabase database
      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId);

      if (profileError) {
        console.error("Profile update error:", profileError);

        // Check if error is related to date format
        if (
          profileError.code === "22007" || // PostgreSQL invalid date format error
          profileError.message.includes("date") ||
          profileError.message.includes("DOB")
        ) {
          Alert.alert(
            "Date of Birth Error",
            "Please reset your DOB again. Use format DD/MM/YYYY"
          );
        } else {
          throw profileError;
        }
        return;
      }

      // Update default address if needed
      const selected = addresses.find((a) => a.isDefault);
      if (selected) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);

        await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", selected.id);
      }

      // Update local state
      setAvatarRemoteUrl(finalAvatarUrl);
      setAvatarLocalUri(null);
      setAvatarToUpload(null);
      setIsDirty(false);
      setEditingField(null);
      await refreshProfileSilently();
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      console.error("Update error:", err);

      // Check if error is date-related
      if (
        err.code === "22007" ||
        err.message?.includes("date") ||
        err.message?.includes("DOB") ||
        err.message?.includes("invalid input syntax")
      ) {
        Alert.alert(
          "Date of Birth Error",
          "Please reset your DOB again. Use format DD/MM/YYYY"
        );
      } else {
        Alert.alert("Error", err.message || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const isEditing = useMemo(() => editingField !== null, [editingField]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          Alert.alert("Error", "Please log in to view profile");
          router.back();
          return;
        }

        setUserId(user.id);

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          // Add timestamp to prevent caching
          const avatarUrl = profile.avatar_url
            ? `${profile.avatar_url}?t=${Date.now()}`
            : null;

          setAvatarRemoteUrl(avatarUrl);

          setProfileData({
            name: profile.full_name || "",
            mobile: user.phone || "",
            email: profile.email || "",
            dob: profile.date_of_birth || "",
            address: profile.default_address || "",
          });
          setPendingEmail(profile.email || "");
        }

        // Fetch addresses
        const { data: addr, error: addrError } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        if (addrError) throw addrError;

        if (addr) {
          const formattedAddresses = addr.map((a) => ({
            id: a.id,
            title: a.address_type,
            address: a.full_address,
            isDefault: a.is_default,
          }));

          setAddresses(formattedAddresses);

          const defaultAddr = addr.find((a) => a.is_default);
          if (defaultAddr) {
            setProfileData((p) => ({
              ...p,
              address: defaultAddr.full_address,
            }));
          }
        }
      } catch (error: any) {
        console.error("Load profile error:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#ffffffff", "#aff6f6ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 5}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(screen)/Profile")}
            >
              <Ionicons name="arrow-back" size={22} color="black" />
              <Text style={styles.headerText}>Your profile</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.hero}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <TouchableOpacity
                  onPress={() => setImageViewerVisible(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.avatarRing}>
                    <Image
                      source={
                        avatarLocalUri
                          ? { uri: avatarLocalUri }
                          : avatarRemoteUrl
                          ? { uri: avatarRemoteUrl }
                          : require("../../assets/images/profile.png")
                      }
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editBadge}
                  onPress={onPressCamera}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={14} color="#11a7ecff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Card Background */}
          <ImageBackground
            source={require("../../assets/images/Editprofile.png")}
            style={styles.formCard}
            imageStyle={styles.formCardImage}
            resizeMode="stretch"
          >
            <View style={styles.formContent}>
              <Field
                styles={styles}
                label="Name"
                value={profileData.name}
                editable={editingField === "name"}
                disabledAction={isEditing && editingField !== "name"}
                onPressChange={() => handleChange("name")}
                onChangeText={(t) => {
                  setProfileData((p) => ({ ...p, name: t }));
                  setIsDirty(true);
                }}
                inputRef={(r) => (inputRefs.current["name"] = r)}
                onBlur={stopEditing}
              />

              <Field
                styles={styles}
                label="Mobile"
                value={profileData.mobile}
                disabled={true}
                disabledAction={true}
                onPressChange={() => handleChange("mobile")}
                icon="lock-closed"
              />

              <Field
                styles={styles}
                label="Email"
                value={
                  editingField === "email" ? pendingEmail : profileData.email
                }
                editable={editingField === "email"}
                disabledAction={isEditing && editingField !== "email"}
                onPressChange={() => handleChange("email")}
                onChangeText={(t) => {
                  setPendingEmail(t);
                  setIsDirty(true);
                }}
                inputRef={(r) => (inputRefs.current["email"] = r)}
                keyboardType="email-address"
                onBlur={stopEditing}
              />

              <Field
                styles={styles}
                label="Date of birth"
                value={profileData.dob}
                disabledAction={isEditing && editingField !== "dob"}
                onPressChange={() => handleChange("dob")}
                icon="calendar"
              />

              <Field
                styles={styles}
                label="Address"
                value={profileData.address}
                disabledAction={isEditing && editingField !== "address"}
                onPressChange={() => handleChange("address")}
                icon="location"
              />
            </View>
          </ImageBackground>

          {/* Update Profile Button - NOW CONNECTED TO updateProfile */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              !isDirty && styles.updateButtonDisabled,
            ]}
            disabled={!isDirty || saving}
            onPress={updateProfile} // This is now connected
          >
            {saving ? (
              <ActivityIndicator color="#ffffffff" />
            ) : (
              <Text style={styles.updateButtonText}>Update profile</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
          themeVariant="light"
        />
      )}

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>Profile Photo</Text>
              <Text style={styles.imageModalSubtitle}>
                Choose how to update your profile picture
              </Text>
            </View>

            <TouchableOpacity
              style={styles.imageModalOption}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <View style={styles.imageOptionIconContainer}>
                <Ionicons name="camera-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.imageOptionContent}>
                <Text style={styles.imageOptionTitle}>Take Photo</Text>
                <Text style={styles.imageOptionDescription}>
                  Use your camera to take a new photo
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.imageModalDivider} />

            <TouchableOpacity
              style={styles.imageModalOption}
              onPress={pickFromGallery}
              activeOpacity={0.7}
            >
              <View style={styles.imageOptionIconContainer}>
                <Ionicons name="images-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.imageOptionContent}>
                <Text style={styles.imageOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.imageOptionDescription}>
                  Select a photo from your device
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageModalCancelButton}
              onPress={() => setShowImagePickerModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.imageModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Address</Text>
              <TouchableOpacity
                onPress={() => setShowAddressModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.addressItem,
                    item.isDefault && styles.addressItemSelected,
                  ]}
                  onPress={() => handleSelectAddress(item)}
                >
                  <View style={styles.addressItemContent}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressTitle}>{item.title}</Text>
                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressText}>{item.address}</Text>
                  </View>
                  <Ionicons
                    name={
                      item.isDefault ? "checkmark-circle" : "radio-button-off"
                    }
                    size={24}
                    color={item.isDefault ? "#10B981" : "#9CA3AF"}
                  />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.addressList}
              ListEmptyComponent={
                <View style={styles.emptyAddressContainer}>
                  <Ionicons name="location-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyAddressText}>
                    No addresses saved yet
                  </Text>
                  <Text style={styles.emptyAddressSubtext}>
                    Add your first address to get started
                  </Text>
                </View>
              }
            />

            {/* Add New Address Button */}
            <View style={styles.addAddressContainer}>
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={handleAddNewAddress}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#3B82F6", "#4979ffff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addAddressButtonGradient}
                >
                  <Text style={styles.addAddressButtonText}>
                    Add New Address
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageViewerVisible(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Image
            source={
              avatarLocalUri
                ? { uri: avatarLocalUri }
                : avatarRemoteUrl
                ? { uri: avatarRemoteUrl }
                : require("../../assets/images/profile.png")
            }
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </LinearGradient>
  );
};

// Field component remains the same...
function Field({
  styles,
  label,
  value,
  disabled,
  editable,
  onPressChange,
  onChangeText,
  inputRef,
  onBlur,
  disabledAction,
  keyboardType,
  icon,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  value: string;
  disabled?: boolean;
  editable?: boolean;
  onPressChange?: () => void;
  onChangeText?: (t: string) => void;
  inputRef?: (r: TextInput | null) => void;
  onBlur?: () => void;
  disabledAction?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
  icon?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.floatingLabel}>
        <Text style={styles.floatingLabelText}>{label}</Text>
      </View>

      <View style={[styles.boxRow, disabled && styles.boxRowDisabled]}>
        <View style={styles.fieldLeftContent}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={styles.iconSize.fontSize}
              color={disabled ? "#9CA3AF" : "#6B7280"}
              style={styles.fieldIcon}
            />
          )}
          {editable && !disabled ? (
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              style={styles.boxInput}
              onBlur={onBlur}
              keyboardType={keyboardType || "default"}
              returnKeyType="done"
              autoCapitalize="none"
              autoFocus={true}
            />
          ) : (
            <Text
              style={[styles.boxValue, disabled && styles.boxValueDisabled]}
              numberOfLines={1}
            >
              {value}
            </Text>
          )}
        </View>

        {!disabled && (
          <TouchableOpacity
            onPress={onPressChange}
            hitSlop={10}
            disabled={!!disabledAction}
            style={disabledAction ? styles.changeDisabledWrap : undefined}
          >
            <Text style={styles.changeButton}>CHANGE</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// makeStyles function remains exactly the same...
const makeStyles = (width: number, height: number) => {
  const s = (n: number) => (width / 375) * n;
  const r = (n: number) => Math.round(n);

  const topPad = clamp(s(45), 24, 60);
  const sidePad = clamp(s(16), 12, 22);

  const avatarSize = clamp(s(110), 92, 124);
  const avatarRadius = avatarSize / 2;

  const heroHeight = clamp(s(150), 120, 170);
  const avatarOverlap = clamp(s(55), 42, 70);

  return StyleSheet.create({
    container: { flex: 1 },

    scrollContent: {
      paddingHorizontal: sidePad,
      paddingTop: topPad,
      paddingBottom: clamp(s(30), 18, 40),
    },

    header: { marginBottom: clamp(s(8), 6, 12) },

    backButton: { flexDirection: "row", alignItems: "center" },

    headerText: {
      fontSize: clamp(s(18), 16, 20),
      fontWeight: "800",
      color: "#000",
      marginLeft: clamp(s(6), 4, 10),
    },

    hero: {
      height: heroHeight,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      marginBottom: clamp(s(8), 6, 12),
      marginTop: clamp(s(20), 10, 26),
    },

    avatarContainer: {
      alignItems: "center",
      justifyContent: "center",
      zIndex: 20,
      transform: [{ translateY: avatarOverlap }],
    },

    avatarWrapper: { position: "relative" },

    avatarRing: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarRadius,
      borderWidth: 2,
      borderColor: "rgba(102, 52, 201, 0.55)",
      backgroundColor: "rgba(255,255,255,0.65)",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },

    profileImage: { width: "100%", height: "100%" },

    editBadge: {
      position: "absolute",
      right: clamp(s(2), 0, 6),
      bottom: clamp(s(6), 4, 10),
      width: clamp(s(26), 22, 30),
      height: clamp(s(26), 22, 30),
      borderRadius: clamp(s(26), 22, 30) / 2,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
    // Image Viewer Styles
    imageViewerContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.95)",
      justifyContent: "center",
      alignItems: "center",
    },

    fullScreenImage: {
      width: width * 0.9,
      height: height * 0.65,
      maxWidth: 600,
      maxHeight: 800,
    },
    formCard: {
      minHeight: clamp(s(360), 320, 420),
      marginBottom: clamp(s(16), 12, 20),
      overflow: "hidden",
    },

    formCardImage: { borderRadius: 14 },

    formContent: {
      flex: 1,
      paddingHorizontal: clamp(s(18), 14, 22),
      paddingTop: clamp(s(92), 76, 110),
      paddingBottom: clamp(s(14), 10, 18),
    },

    fieldWrap: {
      marginBottom: clamp(s(10), 8, 12),
      marginTop: clamp(s(6), 4, 8),
      position: "relative",
    },

    floatingLabel: {
      position: "absolute",
      left: clamp(s(14), 10, 18),
      top: -7,
      paddingHorizontal: clamp(s(6), 4, 8),
      backgroundColor: "#FFFFFFFF",
      borderRadius: 6,
      zIndex: 2,
      borderWidth: 1,
      borderColor: "#44D6FF",
    },

    floatingLabelText: {
      fontSize: clamp(s(10), 9, 11),
      fontWeight: "700",
      color: "rgba(0,0,0,0.65)",
    },

    boxRow: {
      minHeight: clamp(s(44), 42, 48),
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#44D6FF",
      backgroundColor: "rgba(255, 255, 255, 0.45)",
      paddingHorizontal: clamp(s(14), 12, 16),
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },

    boxRowDisabled: {
      borderColor: "#44D6FF",
      backgroundColor: "rgba(118, 192, 200, 0.42)",
    },

    fieldLeftContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    fieldIcon: {
      marginRight: clamp(s(10), 8, 12),
    },

    iconSize: {
      fontSize: clamp(s(16), 14, 18),
    },

    boxValue: {
      flex: 1,
      marginRight: clamp(s(10), 8, 12),
      fontSize: clamp(s(16), 14, 17),
      fontWeight: "400",
      color: "#0B0B0B",
    },

    boxValueDisabled: { color: "rgba(255,255,255,0.88)" },

    boxInput: {
      flex: 1,
      marginRight: clamp(s(10), 8, 12),
      fontSize: clamp(s(16), 14, 17),
      fontWeight: "400",
      color: "#0B0B0B",
      paddingVertical: 0,
    },

    changeButton: {
      fontSize: clamp(s(11), 10, 12),
      color: "#EF4444",
      fontWeight: "800",
      letterSpacing: 0.6,
    },

    changeDisabledWrap: { opacity: 0.35 },

    updateButton: {
      height: clamp(s(50), 46, 54),
      borderRadius: 12,
      backgroundColor: "rgba(44, 241, 255, 0.9)",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.08)",
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        android: { elevation: 2 },
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.07,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        },
      }),
    },

    updateButtonDisabled: { opacity: 0.6 },

    updateButtonText: {
      fontSize: clamp(s(16), 14, 17),
      fontWeight: "700",
      color: "rgba(255, 255, 255, 1)",
    },

    // Image Picker Modal Styles
    imageModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: clamp(s(20), 16, 24),
    },

    imageModalContent: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },

    imageModalHeader: {
      padding: clamp(s(24), 20, 28),
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    },

    imageModalTitle: {
      fontSize: clamp(s(20), 18, 22),
      fontWeight: "700",
      color: "#1F2937",
      marginBottom: clamp(s(8), 6, 10),
    },

    imageModalSubtitle: {
      fontSize: clamp(s(14), 13, 15),
      color: "#6B7280",
      textAlign: "center",
      lineHeight: clamp(s(20), 18, 22),
    },

    imageModalOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: clamp(s(20), 18, 24),
      backgroundColor: "#FFFFFF",
    },

    imageOptionIconContainer: {
      width: clamp(s(48), 44, 52),
      height: clamp(s(48), 44, 52),
      borderRadius: 12,
      backgroundColor: "rgba(79, 70, 229, 0.1)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: clamp(s(16), 14, 18),
    },

    imageOptionContent: {
      flex: 1,
    },

    imageOptionTitle: {
      fontSize: clamp(s(16), 15, 17),
      fontWeight: "600",
      color: "#1F2937",
      marginBottom: clamp(s(4), 2, 6),
    },

    imageOptionDescription: {
      fontSize: clamp(s(14), 13, 15),
      color: "#6B7280",
    },

    imageModalDivider: {
      height: 1,
      backgroundColor: "#F3F4F6",
      marginHorizontal: clamp(s(20), 16, 24),
    },

    imageModalCancelButton: {
      padding: clamp(s(20), 18, 24),
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: "#F3F4F6",
    },

    imageModalCancelText: {
      fontSize: clamp(s(16), 15, 17),
      fontWeight: "600",
      color: "#EF4444",
    },

    // Address Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },

    modalContent: {
      backgroundColor: "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: height * 0.8,
      paddingBottom:
        Platform.OS === "ios" ? clamp(s(34), 20, 40) : clamp(s(20), 16, 24),
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: clamp(s(20), 16, 24),
      paddingVertical: clamp(s(16), 14, 20),
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    },

    modalTitle: {
      fontSize: clamp(s(18), 16, 20),
      fontWeight: "700",
      color: "#1F2937",
    },

    closeButton: {
      padding: clamp(s(4), 2, 6),
    },

    addressList: {
      maxHeight: height * 0.4,
    },

    addressItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: clamp(s(20), 16, 24),
      paddingVertical: clamp(s(14), 12, 16),
      backgroundColor: "#FFFFFF",
    },

    addressItemSelected: {
      backgroundColor: "#F0F9FF",
    },

    addressItemContent: {
      flex: 1,
      marginRight: clamp(s(12), 10, 14),
    },

    addressHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: clamp(s(4), 2, 6),
    },

    addressTitle: {
      fontSize: clamp(s(16), 14, 17),
      fontWeight: "600",
      color: "#1F2937",
      marginRight: clamp(s(8), 6, 10),
    },

    defaultBadge: {
      backgroundColor: "#10B981",
      paddingHorizontal: clamp(s(6), 4, 8),
      paddingVertical: clamp(s(2), 1, 3),
      borderRadius: 12,
    },

    defaultBadgeText: {
      fontSize: clamp(s(10), 9, 11),
      color: "#FFFFFF",
      fontWeight: "600",
    },

    addressText: {
      fontSize: clamp(s(14), 12, 15),
      color: "#6B7280",
      lineHeight: clamp(s(18), 16, 20),
    },

    separator: {
      height: 1,
      backgroundColor: "#E5E7EB",
      marginHorizontal: clamp(s(20), 16, 24),
    },

    // Empty Address State
    emptyAddressContainer: {
      padding: clamp(s(40), 32, 48),
      alignItems: "center",
      justifyContent: "center",
    },

    emptyAddressText: {
      fontSize: clamp(s(16), 15, 17),
      fontWeight: "600",
      color: "#1F2937",
      marginTop: clamp(s(16), 14, 18),
      textAlign: "center",
    },

    emptyAddressSubtext: {
      fontSize: clamp(s(14), 13, 15),
      color: "#6B7280",
      marginTop: clamp(s(8), 6, 10),
      textAlign: "center",
      lineHeight: clamp(s(20), 18, 22),
    },

    // Add Address Button
    addAddressContainer: {
      paddingHorizontal: clamp(s(20), 16, 24),
      paddingTop: clamp(s(16), 14, 18),
      paddingBottom:
        Platform.OS === "ios" ? clamp(s(34), 20, 40) : clamp(s(20), 16, 24),
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
    },

    addAddressButton: {
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },

    addAddressButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: clamp(s(16), 14, 18),
      paddingHorizontal: clamp(s(24), 20, 28),
    },

    addAddressButtonText: {
      fontSize: clamp(s(16), 15, 17),
      fontWeight: "700",
      color: "#FFFFFF",
      marginLeft: clamp(s(10), 8, 12),
    },
  });
};

export default ProfileScreen;