// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   Image,
//   Keyboard,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   useWindowDimensions,
//   View,
// } from "react-native";
// import * as Crypto from 'expo-crypto';
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useUpload } from "../../Context/UploadContext"; // Update this path
// import { router } from "expo-router";

// import { supabase } from "../../Utils/supabase";
// import { uploadBookImages } from "../../Services/uploadImages";
// import { generateBookPrice } from "../../Services/generateBookPrice";
// const [showPricePreviewModal, setShowPricePreviewModal] = useState(false);

// const clamp = (n: number, min: number, max: number) =>
//   Math.max(min, Math.min(max, n));

// const Preview: React.FC = () => {
//   const { width, height } = useWindowDimensions();
//   const styles = useMemo(() => makeStyles(width, height), [width, height]);

//   // Use context instead of local state
//   const { state: uploadState, dispatch } = useUpload();

//   // Local state for editing and custom values
//   const [customValues, setCustomValues] = useState({
//     category: "",
//     class: "",
//     subject: "",
//   });

//   const [price, setPrice] = useState(
//     uploadState.originalPrice?.toString() || "2000"
//   );

//   // Track which section is being edited
//   const [editingSection, setEditingSection] = useState<string | null>(null);
//   const [openDropdown, setOpenDropdown] = useState<string | null>(null);

//   // Loading and success states
//   const [isUploading, setIsUploading] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [estimatedPrice, setEstimatedPrice] = useState("");

//   // Initialize custom values when component mounts
//   useEffect(() => {
//     // Extract custom values from context if they contain "Others" logic
//     // Since context stores final values (not "Others"), we need to check if they match dropdown options
//     const categories = [
//       "Academic",
//       "Fiction",
//       "Non-Fiction",
//       "Science",
//       "Mathematics",
//       "Literature",
//       "History",
//       "Others",
//     ];
//     const classes = [
//       "Class 1",
//       "Class 2",
//       "Class 3",
//       "Class 4",
//       "Class 5",
//       "Class 6",
//       "Class 7",
//       "Class 8",
//       "Class 9",
//       "Class 10",
//       "Class 11",
//       "Class 12",
//       "Undergraduate",
//       "Postgraduate",
//       "Others",
//     ];
//     const subjects = [
//       "English",
//       "Mathematics",
//       "Science",
//       "Social Studies",
//       "Physics",
//       "Chemistry",
//       "Biology",
//       "Computer Science",
//       "Economics",
//       "Others",
//     ];

//     // If context value is not in dropdown options, it's a custom value
//     if (uploadState.category && !categories.includes(uploadState.category)) {
//       setCustomValues((prev) => ({ ...prev, category: uploadState.category }));
//     }
//     if (uploadState.className && !classes.includes(uploadState.className)) {
//       setCustomValues((prev) => ({ ...prev, class: uploadState.className }));
//     }
//     if (uploadState.subject && !subjects.includes(uploadState.subject)) {
//       setCustomValues((prev) => ({ ...prev, subject: uploadState.subject }));
//     }
//   }, []);

//   // Dropdown options
//   const categories = [
//     "Academic",
//     "Fiction",
//     "Non-Fiction",
//     "Science",
//     "Mathematics",
//     "Literature",
//     "History",
//     "Others",
//   ];

//   const classes = [
//     "Class 1",
//     "Class 2",
//     "Class 3",
//     "Class 4",
//     "Class 5",
//     "Class 6",
//     "Class 7",
//     "Class 8",
//     "Class 9",
//     "Class 10",
//     "Class 11",
//     "Class 12",
//     "Undergraduate",
//     "Postgraduate",
//     "Others",
//   ];

//   const subjects = [
//     "English",
//     "Mathematics",
//     "Science",
//     "Social Studies",
//     "Physics",
//     "Chemistry",
//     "Biology",
//     "Computer Science",
//     "Economics",
//     "Others",
//   ];

//   const bookConditions = [
//     "Brand New",
//     "Like New",
//     "Very Good",
//     "Good",
//     "Fair",
//     "Poor",
//   ];

//   const writingOptions = [
//     "None",
//     "Minimal (Few pages)",
//     "Moderate (Some pages)",
//     "Heavy (Most pages)",
//     "Highlighted Text",
//   ];

//   const pagesOptions = [
//     "None - All pages intact",
//     "Few pages missing",
//     "Some pages torn",
//     "Many pages missing",
//     "Cover damaged",
//   ];

//   // Helper function to get dropdown display value
//   const getDropdownValue = (contextValue: string, options: string[]) => {
//     // If context value is in dropdown options, use it
//     if (options.includes(contextValue)) {
//       return contextValue;
//     }
//     // Otherwise, it's a custom value, so show "Others"
//     return "Others";
//   };

//   // Get display values for context fields
//   const getCategoryValue = () =>
//     getDropdownValue(uploadState.category, categories);
//   const getClassValue = () => getDropdownValue(uploadState.className, classes);
//   const getSubjectValue = () => getDropdownValue(uploadState.subject, subjects);

//   // Get display text for showing (reads from context directly)
//   const getCategoryDisplay = () => uploadState.category || "";
//   const getClassDisplay = () => uploadState.className || "";
//   const getSubjectDisplay = () => uploadState.subject || "";

//   // Check if "Others" is selected for editing
//   const isCategoryOthers = getCategoryValue() === "Others";
//   const isClassOthers = getClassValue() === "Others";
//   const isSubjectOthers = getSubjectValue() === "Others";

//   // Check if all required fields are filled
//   const isFormValid = useMemo(() => {
//     const isBasicDetailsFilled =
//       uploadState.bookTitle.trim() !== "" &&
//       uploadState.category.trim() !== "" &&
//       uploadState.className.trim() !== "" &&
//       uploadState.subject.trim() !== "" &&
//       uploadState.authorName.trim() !== "" &&
//       uploadState.publisherName.trim() !== "" &&
//       uploadState.edition.trim() !== "";

//     const isConditionFilled =
//       uploadState.bookCondition.trim() !== "" &&
//       uploadState.conditionDescription.trim() !== "" &&
//       uploadState.writingMarking.trim() !== "" &&
//       uploadState.pagesMissing.trim() !== "";

//     const isPriceFilled = price.trim() !== "" && parseFloat(price) > 0;
//     const hasMinPhotos = uploadState.images.length >= 3;
//     const hasLocation = uploadState.pickupAddressText.trim() !== "";

//     return (
//       isBasicDetailsFilled &&
//       isConditionFilled &&
//       isPriceFilled &&
//       hasMinPhotos &&
//       hasLocation
//     );
//   }, [uploadState, price]);

//   const isEditing = editingSection !== null;

//   // Save changes to context
//   const handleSaveChanges = (section: string) => {
//     // For basic section, handle "Others" logic like UploadScreen1
//     if (section === "basic") {
//       const updatedState = { ...uploadState };

//       // Handle category
//       if (isCategoryOthers && customValues.category.trim()) {
//         updatedState.category = customValues.category.trim();
//       } else if (!isCategoryOthers) {
//         updatedState.category = getCategoryValue();
//       }

//       // Handle class
//       if (isClassOthers && customValues.class.trim()) {
//         updatedState.className = customValues.class.trim();
//       } else if (!isClassOthers) {
//         updatedState.className = getClassValue();
//       }

//       // Handle subject
//       if (isSubjectOthers && customValues.subject.trim()) {
//         updatedState.subject = customValues.subject.trim();
//       } else if (!isSubjectOthers) {
//         updatedState.subject = getSubjectValue();
//       }

//       // Update all basic fields in context
//       Object.entries(updatedState).forEach(([field, value]) => {
//         if (
//           [
//             "bookTitle",
//             "category",
//             "className",
//             "subject",
//             "authorName",
//             "publisherName",
//             "edition",
//           ].includes(field)
//         ) {
//           dispatch({
//             type: "SET_FIELD",
//             field: field as keyof typeof uploadState,
//             value,
//           });
//         }
//       });
//     }

//     // For price section
//     if (section === "price") {
//       const priceNum = parseFloat(price);
//       if (isNaN(priceNum) || priceNum <= 0) {
//         Alert.alert("Invalid Price", "Please enter a valid price.");
//         return;
//       }
//       dispatch({
//         type: "SET_FIELD",
//         field: "originalPrice",
//         value: priceNum,
//       });
//     }

//     // For condition section
//     if (section === "condition") {
//       // Already handled by individual field updates
//     }

//     setEditingSection(null);
//     setOpenDropdown(null);
//     Alert.alert("Success", `${section} section updated successfully!`);
//   };

//   const handleEdit = (section: string) => {
//     if (editingSection === section) {
//       // If already editing this section, save changes
//       handleSaveChanges(section);
//     } else {
//       // Start editing this section
//       setEditingSection(section);
//       setOpenDropdown(null);
//     }
//   };

//   const handleBasicDetailChange = (field: string, value: string) => {
//     dispatch({
//       type: "SET_FIELD",
//       field: field as keyof typeof uploadState,
//       value,
//     });
//   };

//   const handleConditionChange = (field: string, value: string) => {
//     let contextField: keyof typeof uploadState;

//     // Map UI field names to context field names
//     switch (field) {
//       case "condition":
//         contextField = "bookCondition";
//         break;
//       case "description":
//         contextField = "conditionDescription";
//         break;
//       case "writing":
//         contextField = "writingMarking";
//         break;
//       case "pages":
//         contextField = "pagesMissing";
//         break;
//       default:
//         contextField = field as keyof typeof uploadState;
//     }

//     dispatch({
//       type: "SET_FIELD",
//       field: contextField,
//       value,
//     });
//   };

//   // Handle dropdown selection for basic details
//   const handleDropdownSelect = (
//     field: "category" | "className" | "subject",
//     value: string
//   ) => {
//     // If selecting "Others", keep the custom value if it exists
//     // If selecting a regular option, update context directly
//     if (value === "Others") {
//       // Set the dropdown value to "Others" but don't update context yet
//       // Context will be updated when user saves
//       if (field === "category") {
//         handleBasicDetailChange("category", "Others");
//       } else if (field === "className") {
//         handleBasicDetailChange("className", "Others");
//       } else if (field === "subject") {
//         handleBasicDetailChange("subject", "Others");
//       }
//     } else {
//       // Regular option selected, update context and clear custom value
//       handleBasicDetailChange(field, value);
//       if (field === "category") {
//         setCustomValues((prev) => ({ ...prev, category: "" }));
//       } else if (field === "className") {
//         setCustomValues((prev) => ({ ...prev, class: "" }));
//       } else if (field === "subject") {
//         setCustomValues((prev) => ({ ...prev, subject: "" }));
//       }
//     }
//   };

// //   const handleUpload = async () => {
// //    console.log("📦 Final Upload State:", uploadState);

// //     if (!isFormValid) {
// //       Alert.alert(
// //         "Incomplete Form",
// //         "Please fill all required fields and upload at least 3 photos."
// //       );
// //       return;
// //     }

// //     setIsUploading(true);

// //     setTimeout(() => {
// //       setIsUploading(false);
// //       setShowSuccessModal(true);
// //     }, 3000);
// //   };

// // const handleUpload = async () => {

// //   if (!isFormValid) {
// //     Alert.alert(
// //       "Incomplete Form",
// //       "Please fill all required fields and upload at least 3 photos."
// //     );

// //     return;
// //   }

// //   try {
// //     setIsUploading(true);

// //     // 1️⃣ Get logged-in user
// //     const { data: authData, error: authError } =
// //       await supabase.auth.getUser();

// //     if (authError || !authData.user) {
// //       throw new Error("User not authenticated");
// //     }

// //     const userId = authData.user.id;
// //     const generatedPrice = generateBookPrice({
// //       originalPrice: uploadState.originalPrice!,
// //       bookCondition: (uploadState.bookCondition || 'Good'),
// //       writingOption: uploadState.writingMarking,
// //       pagesOption: uploadState.pagesMissing,
// //       subject: uploadState.subject,
// //     });
// //     // ✅ SAVE TO CONTEXT
// //   dispatch({
// //     type: "SET_GENERATED_PRICE",
// //     price: generatedPrice,
// //   });
// //     console.log("📦 Final Upload State:", uploadState);
// //     console.log(gen);

// //     // 2️⃣ Create bookId (before upload)
// //     const bookId = Crypto.randomUUID();

// //     // 3️⃣ Upload images to Supabase Storage
// //     const imageUrls = await uploadBookImages(
// //       userId,
// //       bookId,
// //       uploadState.images
// //     );

// //     if (imageUrls.length === 0) {
// //       throw new Error("Image upload failed");
// //     }
// // console.log(imageUrls);
// //     // 5️⃣ Success
// //     setShowSuccessModal(true);
// //   } catch (error: any) {
// //     console.error("❌ Upload failed:", error);
// //     Alert.alert("Upload Failed", error.message || "Something went wrong");
// //   } finally {
// //     setIsUploading(false);
// //   }
// // };

// const handleUpload = async () => {
//   if (!isFormValid) {
//     Alert.alert(
//       "Incomplete Form",
//       "Please fill all required fields and upload at least 3 photos."
//     );
//     return;
//   }

//   try {
//     setIsUploading(true);

//     // 1️⃣ Get logged-in user
//     const { data: authData, error: authError } = await supabase.auth.getUser();
//     if (authError || !authData.user) {
//       throw new Error("User not authenticated");
//     }
//     const userId = authData.user.id;

//     // 2️⃣ Generate book price
//     const generatedPrice = generateBookPrice({
//       originalPrice: uploadState.originalPrice!,
//       bookCondition: uploadState.bookCondition || "Good",
//       writingOption: uploadState.writingMarking,
//       pagesOption: uploadState.pagesMissing,
//       subject: uploadState.subject,
//     });
//     setEstimatedPrice(generatedPrice.toString())
//     // 3️⃣ Create a unique bookId
//     const bookId = Crypto.randomUUID();

//     // 4️⃣ Upload images to Supabase Storage
//     const imageUrls = await uploadBookImages(userId, bookId, uploadState.images);
//     if (imageUrls.length === 0) {
//       throw new Error("Image upload failed");
//     }

//     // 5️⃣ Prepare data for Supabase
//     const bookData = {
//       id: bookId,
//       user_id: userId,
//       title: uploadState.bookTitle,
//       category: uploadState.category,
//       class: uploadState.className,
//       subject: uploadState.subject,
//       authorname: uploadState.authorName,
//       publisher: uploadState.publisherName,
//       edition: uploadState.edition,
//       condition: uploadState.bookCondition,
//       condition_description: uploadState.conditionDescription,
//       writing_marking: uploadState.writingMarking,
//       pages_missing: uploadState.pagesMissing,
//       original_price: uploadState.originalPrice,
//       generated_price: generatedPrice,
//       images: imageUrls,
//       pickup_address_id: uploadState.pickupAddressId,
//       pickup_address_text: uploadState.pickupAddressText,
//       pickup_latitude: uploadState.pickupLatitude,
//       pickup_longitude: uploadState.pickupLongitude,
//       approval_status: "pending",
//       is_active: true,
//       created_at: new Date().toISOString(),
//     };

//     // 6️⃣ Insert book into Supabase
//     const { data: insertedBook, error: insertError } = await supabase
//       .from("books")
//       .insert([bookData]);

//     if (insertError) {
//       throw insertError;
//     }

//     console.log("✅ Book uploaded successfully:", insertedBook);

//     // 7️⃣ Show success modal
//     setShowSuccessModal(true);
//   } catch (error: any) {
//     console.error("❌ Upload failed:", error);
//     Alert.alert("Upload Failed", error.message || "Something went wrong");
//   } finally {
//     setIsUploading(false);
//   }
// };

//   const handleCancel = () => {
//     setShowSuccessModal(false);
//   };

//   const handleFindBuyer = () => {
//     setShowSuccessModal(false);
//     console.log("Finding buyer...");
//   };

//   const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;

//   return (
//     <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <View style={styles.fixedHeader}>
//           <TouchableOpacity style={styles.backButton}>
//             <Ionicons name="arrow-back-outline" size={24} color="#131E1E" onPress={()=>router.back()}/>
//             <Text style={styles.headerTitle}>Preview</Text>
//           </TouchableOpacity>
//         </View>

//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.keyboardView}
//           keyboardVerticalOffset={keyboardVerticalOffset}
//         >
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <ScrollView
//               style={styles.scrollView}
//               contentContainerStyle={styles.scrollContent}
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//               bounces={false}
//             >
//               {/* A. Basic Details Section */}
//               <View style={styles.formCard}>
//                 <View style={styles.sectionHeader}>
//                   <Text style={styles.sectionTitle}>A. Basic Details</Text>
//                   <TouchableOpacity
//                     style={styles.editIconButton}
//                     onPress={() => handleEdit("basic")}
//                     activeOpacity={0.7}
//                   >
//                     <Ionicons
//                       name={
//                         editingSection === "basic"
//                           ? "checkmark-circle"
//                           : "pencil"
//                       }
//                       size={20}
//                       color={editingSection === "basic" ? "#10B981" : "#6B7280"}
//                     />
//                   </TouchableOpacity>
//                 </View>

//                 <EditableDetailItem
//                   label="Book Title"
//                   value={uploadState.bookTitle}
//                   isEditing={editingSection === "basic"}
//                   onChangeText={(value) =>
//                     handleBasicDetailChange("bookTitle", value)
//                   }
//                   styles={styles}
//                 />

//                 <EditableDropdownItem
//                   label="Category"
//                   value={getCategoryValue()}
//                   displayValue={getCategoryDisplay()}
//                   options={categories}
//                   isEditing={editingSection === "basic"}
//                   onSelect={(value) => handleDropdownSelect("category", value)}
//                   isOpen={openDropdown === "category"}
//                   onToggle={(open) => setOpenDropdown(open ? "category" : null)}
//                   styles={styles}
//                   customValue={customValues.category}
//                   showCustomInput={isCategoryOthers}
//                   onCustomInput={(text) =>
//                     setCustomValues((prev) => ({ ...prev, category: text }))
//                   }
//                 />

//                 <EditableDropdownItem
//                   label="Class"
//                   value={getClassValue()}
//                   displayValue={getClassDisplay()}
//                   options={classes}
//                   isEditing={editingSection === "basic"}
//                   onSelect={(value) => handleDropdownSelect("className", value)}
//                   isOpen={openDropdown === "class"}
//                   onToggle={(open) => setOpenDropdown(open ? "class" : null)}
//                   styles={styles}
//                   customValue={customValues.class}
//                   showCustomInput={isClassOthers}
//                   onCustomInput={(text) =>
//                     setCustomValues((prev) => ({ ...prev, class: text }))
//                   }
//                 />

//                 <EditableDropdownItem
//                   label="Subject"
//                   value={getSubjectValue()}
//                   displayValue={getSubjectDisplay()}
//                   options={subjects}
//                   isEditing={editingSection === "basic"}
//                   onSelect={(value) => handleDropdownSelect("subject", value)}
//                   isOpen={openDropdown === "subject"}
//                   onToggle={(open) => setOpenDropdown(open ? "subject" : null)}
//                   styles={styles}
//                   customValue={customValues.subject}
//                   showCustomInput={isSubjectOthers}
//                   onCustomInput={(text) =>
//                     setCustomValues((prev) => ({ ...prev, subject: text }))
//                   }
//                 />

//                 <EditableDetailItem
//                   label="Author Name"
//                   value={uploadState.authorName}
//                   isEditing={editingSection === "basic"}
//                   onChangeText={(value) =>
//                     handleBasicDetailChange("authorName", value)
//                   }
//                   styles={styles}
//                 />

//                 <EditableDetailItem
//                   label="Publisher Name"
//                   value={uploadState.publisherName}
//                   isEditing={editingSection === "basic"}
//                   onChangeText={(value) =>
//                     handleBasicDetailChange("publisherName", value)
//                   }
//                   styles={styles}
//                 />

//                 <EditableDetailItem
//                   label="Edition"
//                   value={uploadState.edition}
//                   isEditing={editingSection === "basic"}
//                   onChangeText={(value) =>
//                     handleBasicDetailChange("edition", value)
//                   }
//                   styles={styles}
//                 />
//               </View>

//               {/* B. Book Condition & Description Section */}
//               <View style={styles.formCard}>
//                 <View style={styles.sectionHeader}>
//                   <Text style={styles.sectionTitle}>
//                     B. Book Condition & Description
//                   </Text>
//                   <TouchableOpacity
//                     style={styles.editIconButton}
//                     onPress={() => handleEdit("condition")}
//                     activeOpacity={0.7}
//                   >
//                     <Ionicons
//                       name={
//                         editingSection === "condition"
//                           ? "checkmark-circle"
//                           : "pencil"
//                       }
//                       size={20}
//                       color={
//                         editingSection === "condition" ? "#10B981" : "#6B7280"
//                       }
//                     />
//                   </TouchableOpacity>
//                 </View>

//                 <EditableDropdownItem
//                   label="Book Condition"
//                   value={uploadState.bookCondition}
//                   displayValue={uploadState.bookCondition}
//                   options={bookConditions}
//                   isEditing={editingSection === "condition"}
//                   onSelect={(value) =>
//                     handleConditionChange("condition", value)
//                   }
//                   isOpen={openDropdown === "bookCondition"}
//                   onToggle={(open) =>
//                     setOpenDropdown(open ? "bookCondition" : null)
//                   }
//                   styles={styles}
//                 />

//                 <EditableDetailItem
//                   label="About the Book Condition"
//                   value={uploadState.conditionDescription}
//                   isEditing={editingSection === "condition"}
//                   onChangeText={(value) =>
//                     handleConditionChange("description", value)
//                   }
//                   multiline
//                   styles={styles}
//                 />

//                 <EditableDropdownItem
//                   label="Any Writing/Marking Inside?"
//                   value={uploadState.writingMarking}
//                   displayValue={uploadState.writingMarking}
//                   options={writingOptions}
//                   isEditing={editingSection === "condition"}
//                   onSelect={(value) => handleConditionChange("writing", value)}
//                   isOpen={openDropdown === "writingMarking"}
//                   onToggle={(open) =>
//                     setOpenDropdown(open ? "writingMarking" : null)
//                   }
//                   styles={styles}
//                 />

//                 <EditableDropdownItem
//                   label="Any Pages Missing or Torn?"
//                   value={uploadState.pagesMissing}
//                   displayValue={uploadState.pagesMissing}
//                   options={pagesOptions}
//                   isEditing={editingSection === "condition"}
//                   onSelect={(value) => handleConditionChange("pages", value)}
//                   isOpen={openDropdown === "pagesMissing"}
//                   onToggle={(open) =>
//                     setOpenDropdown(open ? "pagesMissing" : null)
//                   }
//                   styles={styles}
//                 />
//               </View>

//               {/* C. Price Section */}
//               <View style={styles.formCard}>
//                 <View style={styles.sectionHeader}>
//                   <Text style={styles.sectionTitle}>C. Price</Text>
//                   <TouchableOpacity
//                     style={styles.editIconButton}
//                     onPress={() => handleEdit("price")}
//                     activeOpacity={0.7}
//                   >
//                     <Ionicons
//                       name={
//                         editingSection === "price"
//                           ? "checkmark-circle"
//                           : "pencil"
//                       }
//                       size={20}
//                       color={editingSection === "price" ? "#10B981" : "#6B7280"}
//                     />
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.priceFieldWrap}>
//                   <View style={styles.priceCheckbox}>
//                     <Text style={styles.rupeeSymbol}>₹</Text>
//                   </View>
//                   {editingSection === "price" ? (
//                     <View style={styles.priceInputWrapper}>
//                       <TextInput
//                         style={styles.priceInput}
//                         value={price}
//                         onChangeText={setPrice}
//                         keyboardType="numeric"
//                         placeholder="Enter price"
//                         placeholderTextColor="rgba(0,0,0,0.4)"
//                       />
//                     </View>
//                   ) : (
//                     <View style={styles.priceDisplay}>
//                       <Text style={styles.priceText}>
//                         {uploadState.originalPrice || "Not set"}
//                       </Text>
//                     </View>
//                   )}
//                 </View>

//                 {/* Note Box */}
//                 <View style={styles.noteBox}>
//                   <Text style={styles.noteText}>
//                     <Text style={styles.noteBold}>Note:</Text> Enter the
//                     original Retail Price (MRP) printed on the book
//                     cover.
//                   </Text>
//                 </View>
//               </View>

//               {/* D. Uploaded Photos Section - READ ONLY */}
//               <View style={styles.formCard}>
//                 <View style={styles.sectionHeader}>
//                   <Text style={styles.sectionTitle}>D. Uploaded Photos</Text>
//                 </View>

//                 <View
//                   style={[
//                     styles.photoGridContainer,
//                     isEditing && styles.photoGridContainerDisabled,
//                   ]}
//                 >
//                   {uploadState.images.length > 0 ? (
//                     <View style={styles.photoGrid}>
//                       {uploadState.images.map((photo, index) => (
//                         <View key={index} style={styles.photoContainer}>
//                           <Image
//                             source={{ uri: photo }}
//                             style={styles.photoThumbnail}
//                             resizeMode="cover"
//                           />
//                         </View>
//                       ))}
//                     </View>
//                   ) : (
//                     <View style={styles.uploadArea}>
//                       <Ionicons
//                         name="camera-outline"
//                         size={32}
//                         color="#374151"
//                       />
//                       <Text
//                         style={[styles.uploadText, styles.uploadTextDisabled]}
//                       >
//                         No photos uploaded
//                       </Text>
//                       <Text style={styles.uploadSubtext}>
//                         Photos are uploaded from previous screens
//                       </Text>
//                     </View>
//                   )}
//                 </View>
//               </View>

//               {/* E. Pickup Location Section - READ ONLY */}
//               <View style={styles.formCard}>
//                 <View style={styles.sectionHeader}>
//                   <Text style={styles.sectionTitle}>E. Pickup Location</Text>
//                 </View>

//                 <View style={styles.locationDisplayBox}>
//                   <View style={styles.locationIconWrapper}>
//                     <Ionicons name="location" size={22} color="#000" />
//                   </View>
//                   <Text style={styles.locationText}>
//                     {uploadState.pickupAddressText || "No location set"}
//                   </Text>
//                 </View>
//               </View>

//               {/* Upload Button */}
//               <TouchableOpacity
//                 style={[
//                   styles.nextButton,
//                   (!isFormValid || isEditing) && styles.nextButtonDisabled, // ✅ Added isEditing check
//                 ]}
//                 onPress={handleUpload}
//                 disabled={!isFormValid || isEditing} // ✅ Added isEditing check
//                 activeOpacity={0.8}
//               >
//                 <Text
//                   style={[
//                     styles.nextText,
//                     !isFormValid && styles.nextTextDisabled,
//                   ]}
//                 >
//                   Upload
//                 </Text>
//               </TouchableOpacity>

//               {/* FIXED BOTTOM PADDING SPACER for Navigation Bar */}
//               <View style={styles.buttonSpacer} />
//             </ScrollView>
//           </TouchableWithoutFeedback>
//         </KeyboardAvoidingView>

//         {/* Loading Modal */}
//         <Modal visible={isUploading} transparent animationType="fade">
//           <View style={styles.modalOverlay}>
//             <View style={styles.loadingContainer}>
//               <Text style={styles.loadingText}>Uploading...</Text>
//             </View>
//           </View>
//         </Modal>

//         {/* Success Modal */}
//         <Modal visible={showSuccessModal} transparent animationType="slide">
//           <View style={styles.modalOverlay}>
//             <View style={styles.successCard}>
//               <View style={styles.successContent}>
//                 <Text style={styles.successMessage}>
//                   Great news 😊 Based on the details you uploaded, you can get
//                   up to{" "}
//                   <Text style={styles.priceHighlight}>₹{estimatedPrice}</Text>
//                 </Text>
//               </View>

//               <View style={styles.dividerLine} />

//               <View style={styles.locationButtons}>
//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={handleCancel}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <View style={styles.verticalDivider} />

//                 <TouchableOpacity
//                   style={styles.findBuyerButton}
//                   onPress={handleFindBuyer}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.findBuyerButtonText}>Find Buyer</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// // Updated EditableDropdownItem component with showCustomInput prop
// const EditableDropdownItem = ({
//   label,
//   value,
//   displayValue,
//   options,
//   isEditing,
//   onSelect,
//   isOpen,
//   onToggle,
//   styles,
//   customValue = "",
//   showCustomInput = false,
//   onCustomInput,
// }: {
//   label: string;
//   value: string;
//   displayValue: string;
//   options: string[];
//   isEditing: boolean;
//   onSelect: (value: string) => void;
//   isOpen: boolean;
//   onToggle: (open: boolean) => void;
//   styles: ReturnType<typeof makeStyles>;
//   customValue?: string;
//   showCustomInput?: boolean;
//   onCustomInput?: (text: string) => void;
// }) => {
//   const isFilled = value.length > 0;
//   const isOthersSelected = value === "Others";

//   return (
//     <View style={styles.fieldContainer}>
//       <View
//         style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
//       >
//         <Text style={styles.floatingLabelText}>{label}</Text>
//       </View>

//       {isEditing ? (
//         <>
//           <TouchableOpacity
//             style={[styles.dropdown, isFilled && styles.dropdownFilled]}
//             onPress={() => onToggle(!isOpen)}
//             activeOpacity={0.7}
//           >
//             <Text
//               style={[
//                 styles.dropdownText,
//                 isFilled && styles.dropdownTextFilled,
//               ]}
//             >
//               {value || `Select ${label}`}
//             </Text>
//             <Ionicons
//               name={isOpen ? "chevron-up" : "chevron-down"}
//               size={18}
//               color="#444"
//             />
//           </TouchableOpacity>

//           {isOpen && (
//             <View style={styles.dropdownList}>
//               <ScrollView
//                 style={styles.dropdownScrollView}
//                 nestedScrollEnabled
//                 showsVerticalScrollIndicator={false}
//               >
//                 {options.map((option) => (
//                   <TouchableOpacity
//                     key={option}
//                     style={[
//                       styles.dropdownItem,
//                       option === value && styles.dropdownItemSelected,
//                     ]}
//                     onPress={() => {
//                       onSelect(option);
//                       onToggle(false);
//                     }}
//                     activeOpacity={0.7}
//                   >
//                     <Text
//                       style={[
//                         styles.dropdownItemText,
//                         option === value && styles.dropdownItemTextSelected,
//                       ]}
//                     >
//                       {option}
//                     </Text>

//                     {option === value && (
//                       <Ionicons name="checkmark" size={20} color="#003EF9" />
//                     )}
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             </View>
//           )}

//           {(showCustomInput || isOthersSelected) && onCustomInput && (
//             <View style={styles.customInputContainer}>
//               <TextInput
//                 style={[styles.input, styles.customInput]}
//                 value={customValue}
//                 onChangeText={onCustomInput}
//                 placeholder={`Specify ${label}`}
//                 placeholderTextColor="rgba(0,0,0,0.4)"
//               />
//             </View>
//           )}
//         </>
//       ) : (
//         <View style={[styles.valueBox, isFilled && styles.valueBoxFilled]}>
//           <Text style={styles.valueText}>{displayValue}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// // Keep the existing EditableDetailItem component as is
// const EditableDetailItem = ({
//   label,
//   value,
//   isEditing,
//   onChangeText,
//   multiline = false,
//   styles,
// }: {
//   label: string;
//   value: string;
//   isEditing: boolean;
//   onChangeText: (text: string) => void;
//   multiline?: boolean;
//   styles: ReturnType<typeof makeStyles>;
// }) => {
//   const isFilled = value.trim().length > 0;

//   return (
//     <View style={styles.fieldContainer}>
//       <View
//         style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
//       >
//         <Text style={styles.floatingLabelText}>{label}</Text>
//       </View>
//       {isEditing ? (
//         <TextInput
//           style={[
//             styles.input,
//             isFilled && styles.inputFilled,
//             multiline && styles.inputMultiline,
//           ]}
//           value={value}
//           onChangeText={onChangeText}
//           placeholder={label}
//           placeholderTextColor="rgba(0,0,0,0.4)"
//           multiline={multiline}
//           numberOfLines={multiline ? 4 : 1}
//           textAlignVertical={multiline ? "top" : "center"}
//           blurOnSubmit={!multiline}
//         />
//       ) : (
//         <View style={[styles.valueBox, isFilled && styles.valueBoxFilled]}>
//           <Text style={styles.valueText}>{value}</Text>
//         </View>
//       )}
//     </View>
//   );
// };
// const makeStyles = (width: number, height: number) => {
//   const s = (n: number) => (width / 375) * n;

//   const isSmallScreen = width < 360;
//   const isMediumScreen = width >= 360 && width < 414;

//   return StyleSheet.create({
//     container: {
//       flex: 1,
//     },

//     fixedHeader: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 16,
//       paddingVertical: 12,

//       zIndex: 10,
//     },

//     keyboardView: {
//       flex: 1,
//     },

//     scrollView: {
//       flex: 1,
//     },

//     scrollContent: {
//       paddingBottom: 20,
//     },

//     // Header
//     backButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//     },

//     headerTitle: {
//       fontSize: 18,
//       fontWeight: "500",
//       color: "#000",
//       marginLeft: 6,
//     },

//     // Form Card - Reduced side padding to match UploadScreen
//     formCard: {
//       backgroundColor: "#BDF4FF",
//       marginHorizontal: 12, // Reduced from 16
//       marginTop: 8, // Reduced
//       marginBottom: 16, // Reduced
//       borderRadius: 9,
//       borderWidth: 1,
//       borderColor: "#3DB9D4",
//       padding: 16,
//       shadowColor: "#000",
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       elevation: 4,
//     },

//     sectionHeader: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       marginBottom: 12,
//     },

//     sectionTitle: {
//       fontSize: 15,
//       fontWeight: "700",
//       color: "#000000E0",
//       flex: 1,
//     },

//     editIconButton: {
//       width: 36,
//       height: 36,
//       borderRadius: 8,
//       alignItems: "center",
//       justifyContent: "center",
//       borderWidth: 1,
//       borderColor: "#003EF9",
//     },

//     // Field Container
//     fieldContainer: {
//       marginBottom: 16,
//       position: "relative",
//     },

//     // Floating Label
//     floatingLabel: {
//       position: "absolute",
//       left: 15,
//       top: -8,
//       paddingHorizontal: 6,
//       backgroundColor: "#D8D8D8",
//       borderRadius: 5,
//       zIndex: 2,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//     },

//     floatingLabelFilled: {
//       borderColor: "#003EF9B0",
//     },

//     floatingLabelText: {
//       fontSize: 10,
//       fontWeight: "700",
//       color: "rgba(0,0,0,0.65)",
//     },

//     // Value Box (Read-only)
//     valueBox: {
//       minHeight: 48,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       backgroundColor: "rgba(255, 255, 255, 0.36)",
//       paddingHorizontal: 14,
//       paddingVertical: 14,
//       justifyContent: "center",
//     },

//     valueBoxFilled: {
//       borderColor: "#003EF9B0",
//     },

//     valueText: {
//       fontSize: 14,
//       color: "#0B0B0B",
//       fontWeight: "500",
//     },

//     // Input Fields (Editing)
//     input: {
//       minHeight: 48,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       backgroundColor: "rgba(255, 255, 255, 0.36)",
//       paddingHorizontal: 14,
//       fontSize: 14,
//       color: "#0B0B0B",
//       paddingTop: 14,
//       paddingBottom: 14,
//     },

//     inputFilled: {
//       borderColor: "#003EF9B0",
//     },

//     inputMultiline: {
//       minHeight: 100,
//       paddingTop: 12,
//       paddingBottom: 12,
//     },

//     // Dropdown
//     dropdown: {
//       minHeight: 48,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       backgroundColor: "rgba(255, 255, 255, 0.36)",
//       paddingHorizontal: 14,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingTop: 14,
//       paddingBottom: 14,
//     },

//     dropdownFilled: {
//       borderColor: "#003EF9B0",
//     },

//     dropdownText: {
//       fontSize: 14,
//       color: "rgba(0,0,0,0.5)",
//       flex: 1,
//     },

//     dropdownTextFilled: {
//       color: "#0B0B0B",
//     },

//     dropdownList: {
//       marginTop: 4,
//       backgroundColor: "#FFF",
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       overflow: "hidden",
//       elevation: 3,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.15,
//       shadowRadius: 8,
//     },

//     dropdownScrollView: {
//       maxHeight: 200,
//     },

//     dropdownItem: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       padding: 12,
//       borderBottomWidth: 1,
//       borderBottomColor: "#f3f4f6",
//     },

//     dropdownItemSelected: {
//       backgroundColor: "#dbdee3ff",
//     },

//     dropdownItemText: {
//       fontSize: 14,
//       color: "#374151",
//       flex: 1,
//     },

//     dropdownItemTextSelected: {
//       color: "#003EF9",
//       fontWeight: "600",
//     },

//     // Custom input styles for "Others" option
//     customInputContainer: {
//       marginTop: 8,
//     },

//     customInput: {
//       borderColor: "#44D6FF",
//       backgroundColor: "rgba(255, 255, 255, 0.36)",
//     },

//     // Price Section
//     priceFieldWrap: {
//       flexDirection: "row",
//       alignItems: "flex-start",
//       gap: 12,
//       marginBottom: 16,
//     },

//     priceCheckbox: {
//       paddingTop: 12,
//     },

//     rupeeSymbol: {
//       fontSize: 20,
//       fontWeight: "700",
//       color: "#003EF9",
//     },

//     priceDisplay: {
//       flex: 1,
//       minHeight: 48,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: "#003EF9B0",
//       backgroundColor: "rgba(255, 255, 255, 0.36)",
//       paddingHorizontal: 14,
//       justifyContent: "center",
//     },

//     priceInputWrapper: {
//       flex: 1,
//     },

//     priceInput: {
//       minHeight: 48,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       backgroundColor: "rgba(255, 255, 255, 0.36)",
//       paddingHorizontal: 14,
//       fontSize: 14,
//       color: "#0B0B0B",
//     },

//     priceText: {
//       fontSize: 14,
//       color: "#0B0B0B",
//       fontWeight: "500",
//     },

//     // Note Box
//     noteBox: {
//       backgroundColor: "rgba(207, 250, 254, 0.5)",
//       borderWidth: 2,
//       borderColor: "#44D6FF",
//       borderRadius: 10,
//       borderStyle: "dashed",
//       padding: 12,
//       marginTop: 8,
//       marginBottom: 8,
//     },

//     noteText: {
//       fontSize: 11,
//       color: "#4b5563",
//       lineHeight: 16,
//       marginBottom: 4,
//     },

//     noteBold: {
//       fontWeight: "700",
//     },

//     // Photo Section
//     photoGridContainer: {
//       borderWidth: 2,
//       borderColor: "#44D6FF",
//       borderStyle: "dashed",
//       borderRadius: 12,
//       padding: 16,
//       backgroundColor: "rgba(255, 255, 255, 0.3)",
//       minHeight: 150,
//     },

//     photoGridContainerDisabled: {
//       opacity: 0.5,
//       backgroundColor: "rgba(200, 200, 200, 0.3)",
//     },

//     photoGrid: {
//       flexDirection: "row",
//       flexWrap: "wrap",
//       gap: 12,
//       marginBottom: 12,
//     },

//     photoContainer: {
//       position: "relative",
//       width: (width - 56 - 24) / 4, // Adjusted for reduced padding
//       height: (width - 56 - 24) / 4,
//     },

//     photoThumbnail: {
//       width: "100%",
//       height: "100%",
//       borderRadius: 8,
//       backgroundColor: "#4B5563",
//     },

//     removePhotoButton: {
//       position: "absolute",
//       top: -8,
//       right: -8,
//       backgroundColor: "#fff",
//       borderRadius: 12,
//     },

//     uploadArea: {
//       alignItems: "center",
//       justifyContent: "center",
//       paddingVertical: 20,
//     },

//     uploadAreaDisabled: {
//       opacity: 0.5,
//     },

//     uploadText: {
//       fontSize: 14,
//       color: "#374151",
//       fontWeight: "600",
//       marginTop: 8,
//     },

//     uploadTextDisabled: {
//       color: "#9CA3AF",
//     },

//     uploadSubtext: {
//       fontSize: 12,
//       color: "#6B7280",
//       marginTop: 4,
//     },

//     browseButton: {
//       backgroundColor: "rgba(68, 214, 255, 0.5)",
//       paddingHorizontal: 18,
//       paddingVertical: 9,
//       borderRadius: 8,
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       marginTop: 12,
//     },

//     browseButtonText: {
//       fontSize: 12,
//       color: "#1f2937",
//       fontWeight: "600",
//     },

//     photoCounter: {
//       fontSize: 12,
//       color: "#0c64f0ff",
//       fontWeight: "600",
//       textAlign: "center",
//       marginTop: 8,
//     },

//     photoCounterWarning: {
//       color: "#EF4444",
//     },

//     // Location Section
//     locationDisplayBox: {
//       flexDirection: "row",
//       alignItems: "flex-start",
//       paddingBottom: 12,
//     },

//     locationIconWrapper: {
//       marginRight: 10,
//       marginTop: 2,
//     },

//     locationText: {
//       flex: 1,
//       fontSize: 14,
//       color: "#1f2937",
//       lineHeight: 20,
//       fontWeight: "400",
//     },

//     locationButtons: {
//       flexDirection: "row",
//       alignItems: "center",
//       height: 52,
//       backgroundColor: "rgba(255,255,255,0.4)",
//     },

//     changeLocationButton: {
//       flex: 1,
//       height: "100%",
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     changeLocationText: {
//       fontSize: 14,
//       color: "#003EF9",
//       fontWeight: "600",
//     },

//     verticalDivider: {
//       width: 1,
//       height: "60%",
//       backgroundColor: "#9CA3AF",
//     },

//     saveButton: {
//       flex: 1,
//       height: "100%",
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     saveButtonText: {
//       fontSize: 14,
//       color: "#16A34A",
//       fontWeight: "600",
//     },

//     // Next Button
//     nextButton: {
//       backgroundColor: "rgba(20, 218, 232, 0.9)",
//       marginHorizontal: 12, // Reduced from 16
//       marginTop: 10,
//       paddingVertical: 16,
//       borderRadius: 12,
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: "rgba(0,0,0,0.08)",
//       elevation: 2,
//       shadowColor: "#000",
//       shadowOpacity: 0.07,
//       shadowRadius: 10,
//       shadowOffset: { width: 0, height: 6 },
//     },

//     nextButtonDisabled: {
//       backgroundColor: "rgba(156, 163, 175, 0.5)",
//       elevation: 0,
//       shadowOpacity: 0,
//     },

//     nextText: {
//       fontSize: 16,
//       fontWeight: "700",
//       color: "rgba(255,255,255,0.78)",
//     },

//     nextTextDisabled: {
//       color: "rgba(107, 114, 128, 0.7)",
//     },

//     buttonSpacer: {
//       height: 40, // Reduced from 60
//     },

//     // Modal styles
//     modalOverlay: {
//       flex: 1,
//       backgroundColor: "rgba(0, 0, 0, 0.5)",
//       alignItems: "center",
//       justifyContent: "center",
//       padding: 20,
//     },

//     loadingContainer: {
//       backgroundColor: "#fff",
//       borderRadius: 16,
//       padding: 30,
//       alignItems: "center",
//       justifyContent: "center",
//       elevation: 5,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.25,
//       shadowRadius: 10,
//     },

//     loadingText: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: "#374151",
//       marginTop: 16,
//     },

//     successCard: {
//       backgroundColor: "rgba(165, 243, 252, 1)",
//       borderRadius: 16,
//       width: "90%",
//       maxWidth: 400,
//       overflow: "hidden",
//       elevation: 10,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.3,
//       shadowRadius: 12,
//     },

//     successContent: {
//       padding: 20,
//       paddingBottom: 16,
//     },

//     successMessage: {
//       fontSize: 15,
//       fontWeight: "600",
//       color: "#1f2937",
//       textAlign: "center",
//       lineHeight: 22,
//     },

//     priceHighlight: {
//       fontSize: 20,
//       fontWeight: "800",
//       color: "#059669",
//     },

//     dividerLine: {
//       height: 1,
//       backgroundColor: "rgba(0, 0, 0, 0.1)",
//     },

//     cancelButton: {
//       flex: 1,
//       paddingVertical: 16,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     cancelButtonText: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: "#EF4444",
//     },

//     findBuyerButton: {
//       flex: 1,
//       paddingVertical: 16,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     findBuyerButtonText: {
//       fontSize: 16,
//       fontWeight: "700",
//       color: "#003EF9",
//     },
//   });
// };

// export default Preview;

import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpload } from "../../Context/UploadContext"; // Update this path

import { generateBookPrice } from "../../Services/generateBookPrice";
import { uploadBookImages } from "../../Services/uploadImages";
import { supabase } from "../../Utils/supabase";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const Preview: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  // Use context instead of local state
  const { state: uploadState, dispatch } = useUpload();

  // Local state for editing and custom values
  const [customValues, setCustomValues] = useState({
    category: "",
    class: "",
    subject: "",
  });

  const [price, setPrice] = useState(
    uploadState.originalPrice?.toString() || "2000"
  );

  // Track which section is being edited
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Loading and success states
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [showPricePreviewModal, setShowPricePreviewModal] = useState(false);
  // Initialize custom values when component mounts
  useEffect(() => {
    // Extract custom values from context if they contain "Others" logic
    // Since context stores final values (not "Others"), we need to check if they match dropdown options
    const categories = [
      "Academic",
      "Fiction",
      "Non-Fiction",
      "Science",
      "Mathematics",
      "Literature",
      "History",
      "Others",
    ];
    const classes = [
      "Class 1",
      "Class 2",
      "Class 3",
      "Class 4",
      "Class 5",
      "Class 6",
      "Class 7",
      "Class 8",
      "Class 9",
      "Class 10",
      "Class 11",
      "Class 12",
      "Undergraduate",
      "Postgraduate",
      "Others",
    ];
    const subjects = [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Economics",
      "Others",
    ];

    // If context value is not in dropdown options, it's a custom value
    if (uploadState.category && !categories.includes(uploadState.category)) {
      setCustomValues((prev) => ({ ...prev, category: uploadState.category }));
    }
    if (uploadState.className && !classes.includes(uploadState.className)) {
      setCustomValues((prev) => ({ ...prev, class: uploadState.className }));
    }
    if (uploadState.subject && !subjects.includes(uploadState.subject)) {
      setCustomValues((prev) => ({ ...prev, subject: uploadState.subject }));
    }
  }, []);

  // Dropdown options
  const categories = [
    "Academic",
    "Fiction",
    "Non-Fiction",
    "Science",
    "Mathematics",
    "Literature",
    "History",
    "Others",
  ];

  const classes = [
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
    "Undergraduate",
    "Postgraduate",
    "Others",
  ];

  const subjects = [
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Economics",
    "Others",
  ];

  const bookConditions = [
    "Brand New",
    "Like New",
    "Very Good",
    "Good",
    "Fair",
    "Poor",
  ];

  const writingOptions = [
    "None",
    "Minimal (Few pages)",
    "Moderate (Some pages)",
    "Heavy (Most pages)",
    "Highlighted Text",
  ];

  const pagesOptions = [
    "None - All pages intact",
    "Few pages missing",
    "Some pages torn",
    "Many pages missing",
    "Cover damaged",
  ];

  // Helper function to get dropdown display value
  const getDropdownValue = (contextValue: string, options: string[]) => {
    // If context value is in dropdown options, use it
    if (options.includes(contextValue)) {
      return contextValue;
    }
    // Otherwise, it's a custom value, so show "Others"
    return "Others";
  };

  // Get display values for context fields
  const getCategoryValue = () =>
    getDropdownValue(uploadState.category, categories);
  const getClassValue = () => getDropdownValue(uploadState.className, classes);
  const getSubjectValue = () => getDropdownValue(uploadState.subject, subjects);

  // Get display text for showing (reads from context directly)
  const getCategoryDisplay = () => uploadState.category || "";
  const getClassDisplay = () => uploadState.className || "";
  const getSubjectDisplay = () => uploadState.subject || "";

  // Check if "Others" is selected for editing
  const isCategoryOthers = getCategoryValue() === "Others";
  const isClassOthers = getClassValue() === "Others";
  const isSubjectOthers = getSubjectValue() === "Others";

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    const isBasicDetailsFilled =
      uploadState.bookTitle.trim() !== "" &&
      uploadState.category.trim() !== "" &&
      uploadState.className.trim() !== "" &&
      uploadState.subject.trim() !== "" &&
      uploadState.authorName.trim() !== "" &&
      uploadState.publisherName.trim() !== "" &&
      uploadState.edition.trim() !== "";

    const isConditionFilled =
      uploadState.bookCondition.trim() !== "" &&
      uploadState.conditionDescription.trim() !== "" &&
      uploadState.writingMarking.trim() !== "" &&
      uploadState.pagesMissing.trim() !== "";

    const isPriceFilled = price.trim() !== "" && parseFloat(price) > 0;
    const hasMinPhotos = uploadState.images.length >= 3;
    const hasLocation = uploadState.pickupAddressText.trim() !== "";

    return (
      isBasicDetailsFilled &&
      isConditionFilled &&
      isPriceFilled &&
      hasMinPhotos &&
      hasLocation
    );
  }, [uploadState, price]);

  const isEditing = editingSection !== null;

  // Save changes to context
  const handleSaveChanges = (section: string) => {
    // For basic section, handle "Others" logic like UploadScreen1
    if (section === "basic") {
      const updatedState = { ...uploadState };

      // Handle category
      if (isCategoryOthers && customValues.category.trim()) {
        updatedState.category = customValues.category.trim();
      } else if (!isCategoryOthers) {
        updatedState.category = getCategoryValue();
      }

      // Handle class
      if (isClassOthers && customValues.class.trim()) {
        updatedState.className = customValues.class.trim();
      } else if (!isClassOthers) {
        updatedState.className = getClassValue();
      }

      // Handle subject
      if (isSubjectOthers && customValues.subject.trim()) {
        updatedState.subject = customValues.subject.trim();
      } else if (!isSubjectOthers) {
        updatedState.subject = getSubjectValue();
      }

      // Update all basic fields in context
      Object.entries(updatedState).forEach(([field, value]) => {
        if (
          [
            "bookTitle",
            "category",
            "className",
            "subject",
            "authorName",
            "publisherName",
            "edition",
          ].includes(field)
        ) {
          dispatch({
            type: "SET_FIELD",
            field: field as keyof typeof uploadState,
            value,
          });
        }
      });
    }

    // For price section
    if (section === "price") {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        Alert.alert("Invalid Price", "Please enter a valid price.");
        return;
      }
      dispatch({
        type: "SET_FIELD",
        field: "originalPrice",
        value: priceNum,
      });
    }

    // For condition section
    if (section === "condition") {
      // Already handled by individual field updates
    }

    setEditingSection(null);
    setOpenDropdown(null);
    Alert.alert("Success", `${section} section updated successfully!`);
  };

  const handleEdit = (section: string) => {
    if (editingSection === section) {
      // If already editing this section, save changes
      handleSaveChanges(section);
    } else {
      // Start editing this section
      setEditingSection(section);
      setOpenDropdown(null);
    }
  };

  const handleBasicDetailChange = (field: string, value: string) => {
    dispatch({
      type: "SET_FIELD",
      field: field as keyof typeof uploadState,
      value,
    });
  };

  const handleConditionChange = (field: string, value: string) => {
    let contextField: keyof typeof uploadState;

    // Map UI field names to context field names
    switch (field) {
      case "condition":
        contextField = "bookCondition";
        break;
      case "description":
        contextField = "conditionDescription";
        break;
      case "writing":
        contextField = "writingMarking";
        break;
      case "pages":
        contextField = "pagesMissing";
        break;
      default:
        contextField = field as keyof typeof uploadState;
    }

    dispatch({
      type: "SET_FIELD",
      field: contextField,
      value,
    });
  };

  // Handle dropdown selection for basic details
  const handleDropdownSelect = (
    field: "category" | "className" | "subject",
    value: string
  ) => {
    // If selecting "Others", keep the custom value if it exists
    // If selecting a regular option, update context directly
    if (value === "Others") {
      // Set the dropdown value to "Others" but don't update context yet
      // Context will be updated when user saves
      if (field === "category") {
        handleBasicDetailChange("category", "Others");
      } else if (field === "className") {
        handleBasicDetailChange("className", "Others");
      } else if (field === "subject") {
        handleBasicDetailChange("subject", "Others");
      }
    } else {
      // Regular option selected, update context and clear custom value
      handleBasicDetailChange(field, value);
      if (field === "category") {
        setCustomValues((prev) => ({ ...prev, category: "" }));
      } else if (field === "className") {
        setCustomValues((prev) => ({ ...prev, class: "" }));
      } else if (field === "subject") {
        setCustomValues((prev) => ({ ...prev, subject: "" }));
      }
    }
  };

  //   const handleUpload = async () => {
  //    console.log("📦 Final Upload State:", uploadState);

  //     if (!isFormValid) {
  //       Alert.alert(
  //         "Incomplete Form",
  //         "Please fill all required fields and upload at least 3 photos."
  //       );
  //       return;
  //     }

  //     setIsUploading(true);

  //     setTimeout(() => {
  //       setIsUploading(false);
  //       setShowSuccessModal(true);
  //     }, 3000);
  //   };

  // const handleUpload = async () => {

  //   if (!isFormValid) {
  //     Alert.alert(
  //       "Incomplete Form",
  //       "Please fill all required fields and upload at least 3 photos."
  //     );

  //     return;
  //   }

  //   try {
  //     setIsUploading(true);

  //     // 1️⃣ Get logged-in user
  //     const { data: authData, error: authError } =
  //       await supabase.auth.getUser();

  //     if (authError || !authData.user) {
  //       throw new Error("User not authenticated");
  //     }

  //     const userId = authData.user.id;
  //     const generatedPrice = generateBookPrice({
  //       originalPrice: uploadState.originalPrice!,
  //       bookCondition: (uploadState.bookCondition || 'Good'),
  //       writingOption: uploadState.writingMarking,
  //       pagesOption: uploadState.pagesMissing,
  //       subject: uploadState.subject,
  //     });
  //     // ✅ SAVE TO CONTEXT
  //   dispatch({
  //     type: "SET_GENERATED_PRICE",
  //     price: generatedPrice,
  //   });
  //     console.log("📦 Final Upload State:", uploadState);
  //     console.log(gen);

  //     // 2️⃣ Create bookId (before upload)
  //     const bookId = Crypto.randomUUID();

  //     // 3️⃣ Upload images to Supabase Storage
  //     const imageUrls = await uploadBookImages(
  //       userId,
  //       bookId,
  //       uploadState.images
  //     );

  //     if (imageUrls.length === 0) {
  //       throw new Error("Image upload failed");
  //     }
  // console.log(imageUrls);
  //     // 5️⃣ Success
  //     setShowSuccessModal(true);
  //   } catch (error: any) {
  //     console.error("❌ Upload failed:", error);
  //     Alert.alert("Upload Failed", error.message || "Something went wrong");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  //   const handleUpload = async () => {
  //     if (!isFormValid) {
  //       Alert.alert(
  //         "Incomplete Form",
  //         "Please fill all required fields and upload at least 3 photos."
  //       );
  //       return;
  //     }

  //     try {
  //       setIsUploading(true);

  //       // 1️⃣ Get logged-in user
  //       const { data: authData, error: authError } =
  //         await supabase.auth.getUser();
  //       if (authError || !authData.user) {
  //         throw new Error("User not authenticated");
  //       }
  //       const userId = authData.user.id;

  //       // 2️⃣ Generate book price
  //       const generatedPrice = generateBookPrice({
  //         originalPrice: uploadState.originalPrice!,
  //         bookCondition: uploadState.bookCondition || "Good",
  //         writingOption: uploadState.writingMarking,
  //         pagesOption: uploadState.pagesMissing,
  //         subject: uploadState.subject,
  //       });
  //       setEstimatedPrice(generatedPrice.toString());
  //       // 3️⃣ Create a unique bookId
  //       const bookId = Crypto.randomUUID();

  //       // 4️⃣ Upload images to Supabase Storage
  //       const imageUrls = await uploadBookImages(
  //         userId,
  //         bookId,
  //         uploadState.images
  //       );
  //       if (imageUrls.length === 0) {
  //         throw new Error("Image upload failed");
  //       }

  //       // 5️⃣ Prepare data for Supabase
  //       const bookData = {
  //         id: bookId,
  //         user_id: userId,
  //         title: uploadState.bookTitle,
  //         category: uploadState.category,
  //         class: uploadState.className,
  //         subject: uploadState.subject,
  //         authorname: uploadState.authorName,
  //         publisher: uploadState.publisherName,
  //         edition: uploadState.edition,
  //         condition: uploadState.bookCondition,
  //         condition_description: uploadState.conditionDescription,
  //         writing_marking: uploadState.writingMarking,
  //         pages_missing: uploadState.pagesMissing,
  //         original_price: uploadState.originalPrice,
  //         generated_price: generatedPrice,
  //         images: imageUrls,
  //         pickup_address_id: uploadState.pickupAddressId,
  //         pickup_address_text: uploadState.pickupAddressText,
  //         pickup_latitude: uploadState.pickupLatitude,
  //         pickup_longitude: uploadState.pickupLongitude,
  //         approval_status: "pending",
  //         is_active: true,
  //         created_at: new Date().toISOString(),
  //       };

  //       // 6️⃣ Insert book into Supabase
  //       const { data: insertedBook, error: insertError } = await supabase
  //         .from("books")
  //         .insert([bookData]);

  //       if (insertError) {
  //         throw insertError;
  //       }

  //       console.log("✅ Book uploaded successfully:", insertedBook);

  //       // 7️⃣ Show success modal
  //       setShowSuccessModal(true);
  //     } catch (error: any) {
  //       console.error("❌ Upload failed:", error);
  //       Alert.alert("Upload Failed", error.message || "Something went wrong");
  //     } finally {
  //       setIsUploading(false);
  //     }
  //   };

  const handleUpload = async () => {
    if (!isFormValid || isEditing) return;

    try {
      setIsUploading(true);

      // 1️⃣ Auth
      const { data: authData, error } = await supabase.auth.getUser();
      if (error || !authData.user) {
        throw new Error("User not authenticated");
      }

      const userId = authData.user.id;

      // 2️⃣ Generate price ONLY
      const generatedPrice = generateBookPrice({
        originalPrice: uploadState.originalPrice!,
        bookCondition: uploadState.bookCondition || "Good",
        writingOption: uploadState.writingMarking,
        pagesOption: uploadState.pagesMissing,
        subject: uploadState.subject,
      });

      // 3️⃣ Create bookId
      const bookId = Crypto.randomUUID();

      // 4️⃣ Save ONLY metadata (no images)
      setUploadSessionData({
        userId,
        bookId,
        generatedPrice,
      });

      // 5️⃣ Show price preview
      setEstimatedPrice(generatedPrice.toString());
      setShowPricePreviewModal(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  const [uploadSessionData, setUploadSessionData] = useState<{
    userId: string;
    bookId: string;
    generatedPrice: number;
  } | null>(null);

  // Step 2: Confirm and save to DB
  const confirmUpload = async () => {
    if (!uploadSessionData) {
      Alert.alert(
        "Something went wrong",
        "Your upload session expired. Please try again."
      );
      return;
    }

    try {
      setIsUploading(true);
      setShowPricePreviewModal(false);

      const { userId, bookId, generatedPrice } = uploadSessionData;

      // 1️⃣ Upload images NOW ✅
      const imageUrls = await uploadBookImages(
        userId,
        bookId,
        uploadState.images
      );

      if (!imageUrls.length) {
        throw new Error("IMAGE_UPLOAD_FAILED");
      }

      // 2️⃣ Prepare DB data
      const bookData = {
        id: bookId,
        user_id: userId,
        title: uploadState.bookTitle,
        category: uploadState.category,
        class: uploadState.className,
        subject: uploadState.subject,
        authorname: uploadState.authorName,
        publisher: uploadState.publisherName,
        edition: uploadState.edition,
        condition: uploadState.bookCondition,
        condition_description: uploadState.conditionDescription,
        writing_marking: uploadState.writingMarking,
        pages_missing: uploadState.pagesMissing,
        original_price: uploadState.originalPrice,
        generated_price: generatedPrice,
        images: imageUrls,
        pickup_address_id: uploadState.pickupAddressId,
        pickup_address_text: uploadState.pickupAddressText,
        pickup_latitude: uploadState.pickupLatitude,
        pickup_longitude: uploadState.pickupLongitude,
        approval_status: "pending",
        is_active: true,
        created_at: new Date().toISOString(),
      };

      // 3️⃣ Insert book
      const { error } = await supabase.from("books").insert([bookData]);
      if (error) throw new Error("DB_INSERT_FAILED");

      // 4️⃣ Success
      /* 4️⃣ FULL SUCCESS — CLEAN EVERYTHING ✅ */
      setUploadSessionData(null);
      dispatch({ type: "RESET_UPLOAD" });
      setShowSuccessModal(true);
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message || "Something went wrong");
      // 🧠 IMPORTANT: Keep context + reopen preview
      setShowPricePreviewModal(true);

      let message = "We couldn’t complete your upload. Please try again.";

      if (err.message === "IMAGE_UPLOAD_FAILED") {
        message =
          "Image upload failed. Please check your internet connection and try again.";
      } else if (err.message === "DB_INSERT_FAILED") {
        message = "Your book details couldn’t be saved. Please try again.";
      }

      Alert.alert("Upload Failed", message);
    } finally {
      setIsUploading(false);
    }
  };

  // Step 3: Cancel upload (clean up images)
  const cancelUpload = async () => {
    if (!uploadSessionData) {
      setShowPricePreviewModal(false);
      return;
    }

    try {
      // 3️⃣ Reset upload context state
      dispatch({ type: "RESET_UPLOAD" });

      // 4️⃣ Friendly feedback + redirect
      Alert.alert(
        "Upload Cancelled",
        "Your book upload was cancelled. No information was saved.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(screen)/Dashboard");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Failed to cleanup images:", error);
    } finally {
      setShowPricePreviewModal(false);
      setUploadSessionData(null);
    }
  };

  const handleCancel = () => {
    setShowSuccessModal(false);
  };

  const handleFindBuyer = () => {
    setShowSuccessModal(false);
    console.log("Finding buyer...");
  };

  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;

  return (
    <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.fixedHeader}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color="#131E1E"
              onPress={() => router.back()}
            />
            <Text style={styles.headerTitle}>Preview</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* A. Basic Details Section */}
              <View style={styles.formCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>A. Basic Details</Text>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => handleEdit("basic")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        editingSection === "basic"
                          ? "checkmark-circle"
                          : "pencil"
                      }
                      size={20}
                      color={editingSection === "basic" ? "#10B981" : "#6B7280"}
                    />
                  </TouchableOpacity>
                </View>

                <EditableDetailItem
                  label="Book Title"
                  value={uploadState.bookTitle}
                  isEditing={editingSection === "basic"}
                  onChangeText={(value) =>
                    handleBasicDetailChange("bookTitle", value)
                  }
                  styles={styles}
                />

                <EditableDropdownItem
                  label="Category"
                  value={getCategoryValue()}
                  displayValue={getCategoryDisplay()}
                  options={categories}
                  isEditing={editingSection === "basic"}
                  onSelect={(value) => handleDropdownSelect("category", value)}
                  isOpen={openDropdown === "category"}
                  onToggle={(open) => setOpenDropdown(open ? "category" : null)}
                  styles={styles}
                  customValue={customValues.category}
                  showCustomInput={isCategoryOthers}
                  onCustomInput={(text) =>
                    setCustomValues((prev) => ({ ...prev, category: text }))
                  }
                />

                <EditableDropdownItem
                  label="Class"
                  value={getClassValue()}
                  displayValue={getClassDisplay()}
                  options={classes}
                  isEditing={editingSection === "basic"}
                  onSelect={(value) => handleDropdownSelect("className", value)}
                  isOpen={openDropdown === "class"}
                  onToggle={(open) => setOpenDropdown(open ? "class" : null)}
                  styles={styles}
                  customValue={customValues.class}
                  showCustomInput={isClassOthers}
                  onCustomInput={(text) =>
                    setCustomValues((prev) => ({ ...prev, class: text }))
                  }
                />

                <EditableDropdownItem
                  label="Subject"
                  value={getSubjectValue()}
                  displayValue={getSubjectDisplay()}
                  options={subjects}
                  isEditing={editingSection === "basic"}
                  onSelect={(value) => handleDropdownSelect("subject", value)}
                  isOpen={openDropdown === "subject"}
                  onToggle={(open) => setOpenDropdown(open ? "subject" : null)}
                  styles={styles}
                  customValue={customValues.subject}
                  showCustomInput={isSubjectOthers}
                  onCustomInput={(text) =>
                    setCustomValues((prev) => ({ ...prev, subject: text }))
                  }
                />

                <EditableDetailItem
                  label="Author Name"
                  value={uploadState.authorName}
                  isEditing={editingSection === "basic"}
                  onChangeText={(value) =>
                    handleBasicDetailChange("authorName", value)
                  }
                  styles={styles}
                />

                <EditableDetailItem
                  label="Publisher Name"
                  value={uploadState.publisherName}
                  isEditing={editingSection === "basic"}
                  onChangeText={(value) =>
                    handleBasicDetailChange("publisherName", value)
                  }
                  styles={styles}
                />

                <EditableDetailItem
                  label="Edition"
                  value={uploadState.edition}
                  isEditing={editingSection === "basic"}
                  onChangeText={(value) =>
                    handleBasicDetailChange("edition", value)
                  }
                  styles={styles}
                />
              </View>

              {/* B. Book Condition & Description Section */}
              <View style={styles.formCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    B. Book Condition & Description
                  </Text>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => handleEdit("condition")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        editingSection === "condition"
                          ? "checkmark-circle"
                          : "pencil"
                      }
                      size={20}
                      color={
                        editingSection === "condition" ? "#10B981" : "#6B7280"
                      }
                    />
                  </TouchableOpacity>
                </View>

                <EditableDropdownItem
                  label="Book Condition"
                  value={uploadState.bookCondition}
                  displayValue={uploadState.bookCondition}
                  options={bookConditions}
                  isEditing={editingSection === "condition"}
                  onSelect={(value) =>
                    handleConditionChange("condition", value)
                  }
                  isOpen={openDropdown === "bookCondition"}
                  onToggle={(open) =>
                    setOpenDropdown(open ? "bookCondition" : null)
                  }
                  styles={styles}
                />

                <EditableDetailItem
                  label="About the Book Condition"
                  value={uploadState.conditionDescription}
                  isEditing={editingSection === "condition"}
                  onChangeText={(value) =>
                    handleConditionChange("description", value)
                  }
                  multiline
                  styles={styles}
                />

                <EditableDropdownItem
                  label="Any Writing/Marking Inside?"
                  value={uploadState.writingMarking}
                  displayValue={uploadState.writingMarking}
                  options={writingOptions}
                  isEditing={editingSection === "condition"}
                  onSelect={(value) => handleConditionChange("writing", value)}
                  isOpen={openDropdown === "writingMarking"}
                  onToggle={(open) =>
                    setOpenDropdown(open ? "writingMarking" : null)
                  }
                  styles={styles}
                />

                <EditableDropdownItem
                  label="Any Pages Missing or Torn?"
                  value={uploadState.pagesMissing}
                  displayValue={uploadState.pagesMissing}
                  options={pagesOptions}
                  isEditing={editingSection === "condition"}
                  onSelect={(value) => handleConditionChange("pages", value)}
                  isOpen={openDropdown === "pagesMissing"}
                  onToggle={(open) =>
                    setOpenDropdown(open ? "pagesMissing" : null)
                  }
                  styles={styles}
                />
              </View>

              {/* C. Price Section */}
              <View style={styles.formCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>C. Price</Text>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => handleEdit("price")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        editingSection === "price"
                          ? "checkmark-circle"
                          : "pencil"
                      }
                      size={20}
                      color={editingSection === "price" ? "#10B981" : "#6B7280"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.priceFieldWrap}>
                  <View style={styles.priceCheckbox}>
                    <Text style={styles.rupeeSymbol}>₹</Text>
                  </View>
                  {editingSection === "price" ? (
                    <View style={styles.priceInputWrapper}>
                      <TextInput
                        style={styles.priceInput}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        placeholder="Enter price"
                        placeholderTextColor="rgba(0,0,0,0.4)"
                      />
                    </View>
                  ) : (
                    <View style={styles.priceDisplay}>
                      <Text style={styles.priceText}>
                        {uploadState.originalPrice || "Not set"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Note Box */}
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>
                    <Text style={styles.noteBold}>Note:</Text> Enter the
                    original Retail Price (MRP) printed on the book cover.
                  </Text>
                </View>
              </View>

              {/* D. Uploaded Photos Section - READ ONLY */}
              <View style={styles.formCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>D. Uploaded Photos</Text>
                </View>

                <View
                  style={[
                    styles.photoGridContainer,
                    isEditing && styles.photoGridContainerDisabled,
                  ]}
                >
                  {uploadState.images.length > 0 ? (
                    <View style={styles.photoGrid}>
                      {uploadState.images.map((photo, index) => (
                        <View key={index} style={styles.photoContainer}>
                          <Image
                            source={{ uri: photo }}
                            style={styles.photoThumbnail}
                            resizeMode="cover"
                          />
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.uploadArea}>
                      <Ionicons
                        name="camera-outline"
                        size={32}
                        color="#374151"
                      />
                      <Text
                        style={[styles.uploadText, styles.uploadTextDisabled]}
                      >
                        No photos uploaded
                      </Text>
                      <Text style={styles.uploadSubtext}>
                        Photos are uploaded from previous screens
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* E. Pickup Location Section - READ ONLY */}
              <View style={styles.formCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>E. Pickup Location</Text>
                </View>

                <View style={styles.locationDisplayBox}>
                  <View style={styles.locationIconWrapper}>
                    <Ionicons name="location" size={22} color="#000" />
                  </View>
                  <Text style={styles.locationText}>
                    {uploadState.pickupAddressText || "No location set"}
                  </Text>
                </View>
              </View>

              {/* Upload Button */}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!isFormValid || isEditing) && styles.nextButtonDisabled, // ✅ Added isEditing check
                ]}
                onPress={handleUpload}
                disabled={!isFormValid || isEditing} // ✅ Added isEditing check
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.nextText,
                    !isFormValid && styles.nextTextDisabled,
                  ]}
                >
                  Upload
                </Text>
              </TouchableOpacity>

              {/* FIXED BOTTOM PADDING SPACER for Navigation Bar */}
              <View style={styles.buttonSpacer} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* Loading Modal */}
        {/*<Modal visible={isUploading} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Uploading...</Text>
            </View>
          </View>
        </Modal> */}

        {/* Loading Modal */}
        <Modal visible={isUploading} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.loadingContainer}>
              {/* Added Loading GIF */}
              <Image
                source={require("../../assets/images/loading.gif")}
                style={styles.loadingGif}
                resizeMode="contain"
              />
              <Text style={styles.loadingText}>Uploading...</Text>
            </View>
          </View>
        </Modal>

        {/* Price Preview Modal (BEFORE upload) */}
        <Modal
          visible={showPricePreviewModal}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.previewCard}>
              <View style={styles.successContent}>
                <Text style={styles.successMessage}>
                  Your book is estimated at{" "}
                  <Text style={styles.priceHighlight}>₹{estimatedPrice}</Text>
                </Text>
                <Text style={styles.previewSubtext}>
                  Upload to make it available for buyers?
                </Text>
              </View>

              <View style={styles.dividerLine} />

              <View style={styles.locationButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelUpload}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <View style={styles.verticalDivider} />

                <TouchableOpacity
                  style={styles.findBuyerButton}
                  onPress={confirmUpload}
                  activeOpacity={0.7}
                >
                  <Text style={styles.findBuyerButtonText}>Upload Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        {/* Success Modal (AFTER upload) */}
        <Modal visible={showSuccessModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.successCard}>
              <View style={styles.successContent}>
                <Text style={styles.successMessage}>
                  ✅ Upload Successful!{"\n"}
                  Your book is listed at{" "}
                  <Text style={styles.priceHighlight}>₹{estimatedPrice}</Text>
                </Text>
              </View>

              <View style={styles.dividerLine} />

              <View style={styles.locationButtons}>
                <TouchableOpacity
                  style={styles.viewListingsButton}
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.push("/(screen)/Dashboard"); // Redirect to dashboard
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewListingsButtonText}>
                    View My Listings
                  </Text>
                </TouchableOpacity>

                <View style={styles.verticalDivider} />

                <TouchableOpacity
                  style={styles.findBuyerButton}
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.push("/(screen)/Dashboard"); // Redirect to home
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.findBuyerButtonText}>Browse Books</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Updated EditableDropdownItem component with showCustomInput prop
const EditableDropdownItem = ({
  label,
  value,
  displayValue,
  options,
  isEditing,
  onSelect,
  isOpen,
  onToggle,
  styles,
  customValue = "",
  showCustomInput = false,
  onCustomInput,
}: {
  label: string;
  value: string;
  displayValue: string;
  options: string[];
  isEditing: boolean;
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  styles: ReturnType<typeof makeStyles>;
  customValue?: string;
  showCustomInput?: boolean;
  onCustomInput?: (text: string) => void;
}) => {
  const isFilled = value.length > 0;
  const isOthersSelected = value === "Others";

  return (
    <View style={styles.fieldContainer}>
      <View
        style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
      >
        <Text style={styles.floatingLabelText}>{label}</Text>
      </View>

      {isEditing ? (
        <>
          <TouchableOpacity
            style={[styles.dropdown, isFilled && styles.dropdownFilled]}
            onPress={() => onToggle(!isOpen)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dropdownText,
                isFilled && styles.dropdownTextFilled,
              ]}
            >
              {value || `Select ${label}`}
            </Text>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#444"
            />
          </TouchableOpacity>

          {isOpen && (
            <View style={styles.dropdownList}>
              <ScrollView
                style={styles.dropdownScrollView}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownItem,
                      option === value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(option);
                      onToggle(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        option === value && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {option === value && (
                      <Ionicons name="checkmark" size={20} color="#003EF9" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {(showCustomInput || isOthersSelected) && onCustomInput && (
            <View style={styles.customInputContainer}>
              <TextInput
                style={[styles.input, styles.customInput]}
                value={customValue}
                onChangeText={onCustomInput}
                placeholder={`Specify ${label}`}
                placeholderTextColor="rgba(0,0,0,0.4)"
              />
            </View>
          )}
        </>
      ) : (
        <View style={[styles.valueBox, isFilled && styles.valueBoxFilled]}>
          <Text style={styles.valueText}>{displayValue}</Text>
        </View>
      )}
    </View>
  );
};

// Keep the existing EditableDetailItem component as is
const EditableDetailItem = ({
  label,
  value,
  isEditing,
  onChangeText,
  multiline = false,
  styles,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  styles: ReturnType<typeof makeStyles>;
}) => {
  const isFilled = value.trim().length > 0;

  return (
    <View style={styles.fieldContainer}>
      <View
        style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
      >
        <Text style={styles.floatingLabelText}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={[
            styles.input,
            isFilled && styles.inputFilled,
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor="rgba(0,0,0,0.4)"
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
          blurOnSubmit={!multiline}
        />
      ) : (
        <View style={[styles.valueBox, isFilled && styles.valueBoxFilled]}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      )}
    </View>
  );
};
const makeStyles = (width: number, height: number) => {
  const s = (n: number) => (width / 375) * n;

  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 360 && width < 414;

  return StyleSheet.create({
    container: {
      flex: 1,
    },

    fixedHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,

      zIndex: 10,
    },

    keyboardView: {
      flex: 1,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 20,
    },

    // Header
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "500",
      color: "#000",
      marginLeft: 6,
    },

    // Form Card - Reduced side padding to match UploadScreen
    formCard: {
      backgroundColor: "#BDF4FF",
      marginHorizontal: 12, // Reduced from 16
      marginTop: 8, // Reduced
      marginBottom: 16, // Reduced
      borderRadius: 9,
      borderWidth: 1,
      borderColor: "#3DB9D4",
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#000000E0",
      flex: 1,
    },

    editIconButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#003EF9",
    },

    // Field Container
    fieldContainer: {
      marginBottom: 16,
      position: "relative",
    },

    // Floating Label
    floatingLabel: {
      position: "absolute",
      left: 15,
      top: -8,
      paddingHorizontal: 6,
      backgroundColor: "#D8D8D8",
      borderRadius: 5,
      zIndex: 2,
      borderWidth: 1,
      borderColor: "#44D6FF",
    },

    floatingLabelFilled: {
      borderColor: "#003EF9B0",
    },

    floatingLabelText: {
      fontSize: 10,
      fontWeight: "700",
      color: "rgba(0,0,0,0.65)",
    },

    // Value Box (Read-only)
    valueBox: {
      minHeight: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#44D6FF",
      backgroundColor: "rgba(255, 255, 255, 0.36)",
      paddingHorizontal: 14,
      paddingVertical: 14,
      justifyContent: "center",
    },

    valueBoxFilled: {
      borderColor: "#003EF9B0",
    },

    valueText: {
      fontSize: 14,
      color: "#0B0B0B",
      fontWeight: "500",
    },

    // Input Fields (Editing)
    input: {
      minHeight: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#44D6FF",
      backgroundColor: "rgba(255, 255, 255, 0.36)",
      paddingHorizontal: 14,
      fontSize: 14,
      color: "#0B0B0B",
      paddingTop: 14,
      paddingBottom: 14,
    },

    inputFilled: {
      borderColor: "#003EF9B0",
    },

    inputMultiline: {
      minHeight: 100,
      paddingTop: 12,
      paddingBottom: 12,
    },

    // Dropdown
    dropdown: {
      minHeight: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#44D6FF",
      backgroundColor: "rgba(255, 255, 255, 0.36)",
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 14,
      paddingBottom: 14,
    },

    dropdownFilled: {
      borderColor: "#003EF9B0",
    },

    dropdownText: {
      fontSize: 14,
      color: "rgba(0,0,0,0.5)",
      flex: 1,
    },

    dropdownTextFilled: {
      color: "#0B0B0B",
    },

    dropdownList: {
      marginTop: 4,
      backgroundColor: "#FFF",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#44D6FF",
      overflow: "hidden",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },

    dropdownScrollView: {
      maxHeight: 200,
    },

    dropdownItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
    },

    dropdownItemSelected: {
      backgroundColor: "#dbdee3ff",
    },

    dropdownItemText: {
      fontSize: 14,
      color: "#374151",
      flex: 1,
    },

    dropdownItemTextSelected: {
      color: "#003EF9",
      fontWeight: "600",
    },

    // Custom input styles for "Others" option
    customInputContainer: {
      marginTop: 8,
    },

    customInput: {
      borderColor: "#44D6FF",
      backgroundColor: "rgba(255, 255, 255, 0.36)",
    },

    // Price Section
    priceFieldWrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 16,
    },

    priceCheckbox: {
      paddingTop: 12,
    },

    rupeeSymbol: {
      fontSize: 20,
      fontWeight: "700",
      color: "#003EF9",
    },

    priceDisplay: {
      flex: 1,
      minHeight: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#003EF9B0",
      backgroundColor: "rgba(255, 255, 255, 0.36)",
      paddingHorizontal: 14,
      justifyContent: "center",
    },

    priceInputWrapper: {
      flex: 1,
    },

    priceInput: {
      minHeight: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#44D6FF",
      backgroundColor: "rgba(255, 255, 255, 0.36)",
      paddingHorizontal: 14,
      fontSize: 14,
      color: "#0B0B0B",
    },

    priceText: {
      fontSize: 14,
      color: "#0B0B0B",
      fontWeight: "500",
    },

    // Note Box
    noteBox: {
      backgroundColor: "rgba(207, 250, 254, 0.5)",
      borderWidth: 2,
      borderColor: "#44D6FF",
      borderRadius: 10,
      borderStyle: "dashed",
      padding: 12,
      marginTop: 8,
      marginBottom: 8,
    },

    noteText: {
      fontSize: 11,
      color: "#4b5563",
      lineHeight: 16,
      marginBottom: 4,
    },

    noteBold: {
      fontWeight: "700",
    },

    // Photo Section
    photoGridContainer: {
      borderWidth: 2,
      borderColor: "#44D6FF",
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 16,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      minHeight: 150,
    },

    photoGridContainerDisabled: {
      opacity: 0.5,
      backgroundColor: "rgba(200, 200, 200, 0.3)",
    },

    photoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 12,
    },

    photoContainer: {
      position: "relative",
      width: (width - 56 - 24) / 4, // Adjusted for reduced padding
      height: (width - 56 - 24) / 4,
    },

    photoThumbnail: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
      backgroundColor: "#4B5563",
    },

    removePhotoButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "#fff",
      borderRadius: 12,
    },

    uploadArea: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
    },

    uploadAreaDisabled: {
      opacity: 0.5,
    },

    uploadText: {
      fontSize: 14,
      color: "#374151",
      fontWeight: "600",
      marginTop: 8,
    },

    uploadTextDisabled: {
      color: "#9CA3AF",
    },

    uploadSubtext: {
      fontSize: 12,
      color: "#6B7280",
      marginTop: 4,
    },

    browseButton: {
      backgroundColor: "rgba(68, 214, 255, 0.5)",
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#44D6FF",
      marginTop: 12,
    },

    browseButtonText: {
      fontSize: 12,
      color: "#1f2937",
      fontWeight: "600",
    },

    photoCounter: {
      fontSize: 12,
      color: "#0c64f0ff",
      fontWeight: "600",
      textAlign: "center",
      marginTop: 8,
    },

    photoCounterWarning: {
      color: "#EF4444",
    },

    // Location Section
    locationDisplayBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingBottom: 12,
    },

    locationIconWrapper: {
      marginRight: 10,
      marginTop: 2,
    },

    locationText: {
      flex: 1,
      fontSize: 14,
      color: "#1f2937",
      lineHeight: 20,
      fontWeight: "400",
    },

    locationButtons: {
      flexDirection: "row",
      alignItems: "center",
      height: 52,
      backgroundColor: "rgba(255,255,255,0.4)",
    },

    changeLocationButton: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    changeLocationText: {
      fontSize: 14,
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
      fontSize: 14,
      color: "#16A34A",
      fontWeight: "600",
    },

    // Next Button
    nextButton: {
      backgroundColor: "rgba(20, 218, 232, 0.9)",
      marginHorizontal: 12, // Reduced from 16
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
      height: 40, // Reduced from 60
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },

    loadingContainer: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },

    loadingText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#374151",
      marginTop: 16,
    },
    loadingGif: {
      width: 120,
      height: 120,
    },
    successCard: {
      backgroundColor: "rgba(165, 243, 252, 1)",
      borderRadius: 16,
      width: "90%",
      maxWidth: 400,
      overflow: "hidden",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },

    successContent: {
      padding: 20,
      paddingBottom: 16,
    },

    successMessage: {
      fontSize: 15,
      fontWeight: "600",
      color: "#1f2937",
      textAlign: "center",
      lineHeight: 22,
    },

    priceHighlight: {
      fontSize: 20,
      fontWeight: "800",
      color: "#059669",
    },

    dividerLine: {
      height: 1,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },

    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#EF4444",
    },

    findBuyerButton: {
      flex: 1,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },

    findBuyerButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#003EF9",
    },
    // Price Preview Modal Styles
    previewCard: {
      backgroundColor: "rgba(255, 250, 230, 1)",
      borderRadius: 16,
      width: "90%",
      maxWidth: 400,
      overflow: "hidden",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      borderWidth: 2,
      borderColor: "#FBBF24",
    },

    previewSubtext: {
      fontSize: 13,
      color: "#666",
      textAlign: "center",
      marginTop: 12,
      lineHeight: 18,
    },

    confirmButton: {
      flex: 1,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#10B981",
    },

    confirmButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },

    viewListingsButton: {
      flex: 1,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#3B82F6",
    },

    viewListingsButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
};

export default Preview;
