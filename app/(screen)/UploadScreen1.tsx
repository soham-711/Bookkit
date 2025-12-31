
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, { useMemo, useState } from "react";
// import {
//   FlatList,
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
// import { SafeAreaView } from "react-native-safe-area-context";

// const UploadScreen1 = () => {
//   const { width, height } = useWindowDimensions();
//   const [isCategoryModal, setCategoryModal] = useState(false);
//   const [isClassModal, setClassModal] = useState(false);
//   const [isSubjectModal, setSubjectModal] = useState(false);

//   const [formData, setFormData] = useState({
//     bookTitle: "",
//     category: "",
//     class: "",
//     subject: "",
//     authorName: "",
//     publisherName: "",
//     edition: "",
//     categoryOther: "",
//     classOther: "",
//     subjectOther: "",
//   });

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

//   // Check if "Others" option is selected
//   const showCategoryOther = formData.category === "Others";
//   const showClassOther = formData.class === "Others";
//   const showSubjectOther = formData.subject === "Others";

//   // Form validation
//   const isFormValid = useMemo(() => {
//     // Basic fields validation
//     const basicFieldsValid =
//       formData.bookTitle.trim() !== "" &&
//       formData.category !== "" &&
//       formData.class !== "" &&
//       formData.subject !== "" &&
//       formData.authorName.trim() !== "" &&
//       formData.publisherName.trim() !== "" &&
//       formData.edition.trim() !== "";

//     // Validate "Other" fields if needed
//     const categoryOtherValid =
//       !showCategoryOther || formData.categoryOther.trim() !== "";
//     const classOtherValid =
//       !showClassOther || formData.classOther.trim() !== "";
//     const subjectOtherValid =
//       !showSubjectOther || formData.subjectOther.trim() !== "";

//     return (
//       basicFieldsValid &&
//       categoryOtherValid &&
//       classOtherValid &&
//       subjectOtherValid
//     );
//   }, [formData, showCategoryOther, showClassOther, showSubjectOther]);

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSelectOption = (field: string, value: string) => {
//     // If selecting a non-"Others" option, clear the corresponding "Other" field
//     if (value !== "Others") {
//       if (field === "category") {
//         setFormData((prev) => ({ ...prev, categoryOther: "" }));
//       } else if (field === "class") {
//         setFormData((prev) => ({ ...prev, classOther: "" }));
//       } else if (field === "subject") {
//         setFormData((prev) => ({ ...prev, subjectOther: "" }));
//       }
//     }

//     handleInputChange(field, value);

//     // Close the modal
//     if (field === "category") setCategoryModal(false);
//     if (field === "class") setClassModal(false);
//     if (field === "subject") setSubjectModal(false);
//   };

//   const handleNext = () => {
//     if (isFormValid) {
//       console.log("Form Data:", formData);
//       // Prepare final data for backend
//       const finalData = {
//         bookTitle: formData.bookTitle,
//         category:
//           formData.category === "Others"
//             ? formData.categoryOther
//             : formData.category,
//         class:
//           formData.class === "Others" ? formData.classOther : formData.class,
//         subject:
//           formData.subject === "Others"
//             ? formData.subjectOther
//             : formData.subject,
//         authorName: formData.authorName,
//         publisherName: formData.publisherName,
//         edition: formData.edition,
//       };
//       console.log("Final Data for Backend:", finalData);
//       // Add your navigation or backend logic here
//       // router.push("/upload-screen2");
//     }
//     router.push('/(screen)/UploadScreen2')
//   };

//   // Reusable Dropdown Component
//   const DropdownModal = ({ visible, onClose, data, field, title }: any) => (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { width: width * 0.9 }]}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{title}</Text>
//               <TouchableOpacity onPress={onClose}>
//                 <Ionicons name="close" size={24} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={data}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.dropdownItem}
//                   onPress={() => handleSelectOption(field, item)}
//                 >
//                   <Text style={styles.dropdownItemText}>{item}</Text>
//                   {formData[field as keyof typeof formData] === item && (
//                     <Ionicons name="checkmark" size={20} color="#003EF9" />
//                   )}
//                 </TouchableOpacity>
//               )}
//               showsVerticalScrollIndicator={false}
//               style={styles.dropdownList}
//             />
//           </View>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );

//   // Reusable Input Field Component
//   const InputField = ({
//     label,
//     placeholder,
//     value,
//     onChangeText,
//     field,
//     multiline = false,
//   }: any) => {
//     const isFilled = value.trim().length > 0;

//     return (
//       <View style={styles.fieldContainer}>
//         <View
//           style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
//         >
//           <Text style={styles.floatingLabelText}>{label}</Text>
//         </View>
//         <TextInput
//           style={[
//             styles.input,
//             isFilled && styles.inputFilled,
//             multiline && styles.inputMultiline,
//           ]}
//           placeholder={placeholder}
//           placeholderTextColor="rgba(0,0,0,0.4)"
//           value={value}
//           onChangeText={(text) => onChangeText(field, text)}
//           multiline={multiline}
//           numberOfLines={multiline ? 4 : 1}
//           textAlignVertical={multiline ? "top" : "center"}
//         />
//       </View>
//     );
//   };

//   // Reusable Dropdown Field Component
//   const DropdownField = ({ label, placeholder, value, onPress }: any) => {
//     const isFilled = value.length > 0;

//     return (
//       <View style={styles.fieldContainer}>
//         <View
//           style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
//         >
//           <Text style={styles.floatingLabelText}>{label}</Text>
//         </View>
//         <TouchableOpacity
//           style={[styles.dropdown, isFilled && styles.dropdownFilled]}
//           onPress={onPress}
//         >
//           <Text
//             style={[styles.dropdownText, isFilled && styles.dropdownTextFilled]}
//           >
//             {value || placeholder}
//           </Text>
//           <Ionicons name="chevron-down" size={18} color="#444" />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//          behavior={Platform.OS === "ios" ? "padding" : 'height'}
//           style={{ flex: 1 }}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
//         >
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={{ flex: 1 }}>
//               {/* ---------- FIXED HEADER ---------- */}
//               <View style={styles.header}>
//                 <Ionicons
//                   name="arrow-back-outline"
//                   size={24}
//                   color="#131E1E"
//                   onPress={() => router.back()}
//                 />
//                 <Text style={styles.headerTitle}>Shear Books</Text>
//               </View>

//               {/* ---------- FIXED BANNER ---------- */}
//               <View style={styles.bannerWrapper}>
//                 <Image
//                   source={require("../../assets/images/donate-book.png")}
//                   style={[styles.bannerImage, { width: width - 32 }]}
//                   resizeMode="cover"
//                 />
//               </View>

//               {/* ---------- SCROLLABLE FORM ---------- */}
//               <ScrollView
//                 style={styles.scrollView}
//                 contentContainerStyle={styles.scrollContent}
//                 showsVerticalScrollIndicator={false}
//                 keyboardShouldPersistTaps="handled"
//               >
//                 {/* ---------- FORM CARD ---------- */}
//                 <View style={[styles.formCard, { minHeight: height * 0.6 }]}>
//                   <Text style={styles.sectionTitle}>A. Basic Details</Text>

//                   {/* Book Title */}
//                   <InputField
//                     label="Book Title"
//                     placeholder="Book Name and Full Description"
//                     value={formData.bookTitle}
//                     onChangeText={handleInputChange}
//                     field="bookTitle"
//                   />

//                   {/* Category */}
//                   <DropdownField
//                     label="Category"
//                     placeholder="Select Book Category"
//                     value={formData.category}
//                     onPress={() => setCategoryModal(true)}
//                   />

//                   {/* Category Other Field - Only shows when "Others" is selected */}
//                   {showCategoryOther && (
//                     <InputField
//                       label="Specify Category"
//                       placeholder="Enter custom category"
//                       value={formData.categoryOther}
//                       onChangeText={handleInputChange}
//                       field="categoryOther"
//                     />
//                   )}

//                   {/* Class */}
//                   <DropdownField
//                     label="Class"
//                     placeholder="Select Book Class"
//                     value={formData.class}
//                     onPress={() => setClassModal(true)}
//                   />

//                   {/* Class Other Field - Only shows when "Others" is selected */}
//                   {showClassOther && (
//                     <InputField
//                       label="Specify Class"
//                       placeholder="Enter custom class"
//                       value={formData.classOther}
//                       onChangeText={handleInputChange}
//                       field="classOther"
//                     />
//                   )}

//                   {/* Subject */}
//                   <DropdownField
//                     label="Subject"
//                     placeholder="Select Subject"
//                     value={formData.subject}
//                     onPress={() => setSubjectModal(true)}
//                   />

//                   {/* Subject Other Field - Only shows when "Others" is selected */}
//                   {showSubjectOther && (
//                     <InputField
//                       label="Specify Subject"
//                       placeholder="Enter custom subject"
//                       value={formData.subjectOther}
//                       onChangeText={handleInputChange}
//                       field="subjectOther"
//                     />
//                   )}

//                   {/* Author */}
//                   <InputField
//                     label="Author Name"
//                     placeholder="Author Name"
//                     value={formData.authorName}
//                     onChangeText={handleInputChange}
//                     field="authorName"
//                   />

//                   {/* Publisher */}
//                   <InputField
//                     label="Publisher Name"
//                     placeholder="Publisher Name"
//                     value={formData.publisherName}
//                     onChangeText={handleInputChange}
//                     field="publisherName"
//                   />

//                   {/* Edition */}
//                   <InputField
//                     label="Edition"
//                     placeholder="Edition (e.g., 2021, 3rd Edition)"
//                     value={formData.edition}
//                     onChangeText={handleInputChange}
//                     field="edition"
//                   />

//                   {/* Note */}
//                   <View style={styles.noteBox}>
//                     <Text style={styles.noteText}>
//                       <Text style={styles.noteBold}>Note:</Text> If your
//                       category, class, or subject is not in the list, select
//                       "Others" and specify it in the field that appears.
//                     </Text>
//                     <Text style={styles.noteExample}>
//                       Example: Select "Others" for Category, then enter
//                       "Biography" in the "Specify Category" field
//                     </Text>
//                   </View>
//                 </View>

//                 {/* ---------- NEXT BUTTON ---------- */}
//                 <TouchableOpacity
//                   style={[
//                     styles.nextButton,
//                     !isFormValid && styles.nextButtonDisabled,
//                   ]}
//                   onPress={handleNext}
//                   disabled={!isFormValid}
//                 >
//                   <Text
//                     style={[
//                       styles.nextText,
//                       !isFormValid && styles.nextTextDisabled,
//                     ]}
//                   >
//                     Next
//                   </Text>
//                 </TouchableOpacity>
//                  <View style={styles.buttonSpacer} />
//               </ScrollView>
//             </View>
//           </TouchableWithoutFeedback>

//           {/* ---------- DROPDOWN MODALS ---------- */}
//           <DropdownModal
//             visible={isCategoryModal}
//             onClose={() => setCategoryModal(false)}
//             data={categories}
//             field="category"
//             title="Select Category"
//           />

//           <DropdownModal
//             visible={isClassModal}
//             onClose={() => setClassModal(false)}
//             data={classes}
//             field="class"
//             title="Select Class"
//           />

//           <DropdownModal
//             visible={isSubjectModal}
//             onClose={() => setSubjectModal(false)}
//             data={subjects}
//             field="subject"
//             title="Select Subject"
//           />
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// export default UploadScreen1;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },

//   /* Header */
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "transparent",
//   },
//     buttonSpacer: {
//     height: 60, // Same height as button container
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "400",
//     marginLeft: 10,
//   },

//   /* Banner */
//   bannerWrapper: {
//     alignItems: "center",
//     marginVertical: 8,
//     backgroundColor: "transparent",
//   },
//   bannerImage: {
//     height: 160,
//     borderRadius: 9,
//     maxHeight: 200,
//     borderWidth: 2,
//     borderColor: "#003EF9",
//     elevation: 10,
//   },

//   /* Form Card */
//   formCard: {
//     backgroundColor: "#BDF4FF",
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 20,
//     borderRadius: 9,
//     borderWidth:1,
//     borderColor:'#3DB9D4',
//     padding: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     marginBottom: 20,
//     color: "#000000E0",
//   },

//   /* Field Container */
//   fieldContainer: {
//     marginBottom: 16,
//     position: "relative",
//   },

//   /* Floating Label */
//   floatingLabel: {
//     position: "absolute",
//     left: 15,
//     top: -8,
//     paddingHorizontal: 6,
//     backgroundColor: "#D8D8D8",
//     borderRadius: 5,
//     zIndex: 2,
//     borderWidth: 1,
//     borderColor: "#44D6FF",
//   },
//   floatingLabelFilled: {
//     borderColor: "#003EF9B0",
//   },
//   floatingLabelText: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: "rgba(0,0,0,0.65)",
//   },

//   /* Input Fields */
//   input: {
//     minHeight: 48,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#44D6FF",
//     backgroundColor: "rgba(255, 255, 255, 0.36)",
//     paddingHorizontal: 14,
//     fontSize: 14,
//     color: "#0B0B0B",
//     paddingTop: 14,
//     paddingBottom: 14,
//   },
//   inputFilled: {
//     borderColor: "#003EF9B0",
//   },
//   inputMultiline: {
//     minHeight: 100,
//     paddingTop: 12,
//     paddingBottom: 12,
//   },

//   /* Dropdown */
//   dropdown: {
//     minHeight: 48,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#44D6FF",
//     backgroundColor: "rgba(255, 255, 255, 0.36)",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: 14,
//     paddingBottom: 14,
//   },
//   dropdownFilled: {
//     borderColor: "#003EF9B0",
//   },
//   dropdownText: {
//     fontSize: 14,
//     color: "rgba(0,0,0,0.5)",
//     flex: 1,
//   },
//   dropdownTextFilled: {
//     color: "#0B0B0B",
//   },

//   /* Note Box */
//   noteBox: {
//     backgroundColor: "rgba(207, 250, 254, 0.5)",
//     borderWidth: 2,
//     borderColor: "#44D6FF",
//     borderRadius: 10,
//     borderStyle: "dashed",
//     padding: 12,
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   noteText: {
//     fontSize: 11,
//     color: "#4b5563",
//     lineHeight: 16,
//     marginBottom: 4,
//   },
//   noteBold: {
//     fontWeight: "700",
//   },
//   noteExample: {
//     fontSize: 10,
//     color: "#666",
//     fontStyle: "italic",
//     lineHeight: 14,
//   },

//   /* Modal Styles */
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#FFF",
//     borderRadius: 16,
//     maxHeight: "60%",
//     overflow: "hidden",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   dropdownList: {
//     maxHeight: 300,
//   },
//   dropdownItem: {
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   dropdownItemText: {
//     fontSize: 16,
//     color: "#333",
//     flex: 1,
//   },

//   /* Next Button */
//   nextButton: {
//     backgroundColor: "rgba(20, 218, 232, 0.9)",
//     marginHorizontal: 16,
//     marginTop: 10,
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(0,0,0,0.08)",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.07,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//   },
//   nextButtonDisabled: {
//     backgroundColor: "rgba(156, 163, 175, 0.5)",
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   nextText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "rgba(255,255,255,0.78)",
//   },
//   nextTextDisabled: {
//     color: "rgba(107, 114, 128, 0.7)",
//   },
// });


// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React, { useMemo, useState } from "react";
// import {
//   FlatList,
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
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useUpload } from "../../Context/UploadContext";

// const UploadScreen1 = () => {
//   const { width, height } = useWindowDimensions();
//   const { state, dispatch } = useUpload(); // ✅ GLOBAL STATE
  
//   const [isCategoryModal, setCategoryModal] = useState(false);
//   const [isClassModal, setClassModal] = useState(false);
//   const [isSubjectModal, setSubjectModal] = useState(false);
  
//   // These "other" fields should be managed locally since they're not in the UploadState
//   const [categoryOther, setCategoryOther] = useState("");
//   const [classOther, setClassOther] = useState("");
//   const [subjectOther, setSubjectOther] = useState("");

//   // Check if "Others" option is selected
//   const showCategoryOther = state.category === "Others";
//   const showClassOther = state.className === "Others";
//   const showSubjectOther = state.subject === "Others";

//   // Form validation
//   const isFormValid = useMemo(() => {
//     return (
//       state.bookTitle.trim() &&
//       state.category &&
//       state.className &&
//       state.subject &&
//       state.authorName.trim() &&
//       state.publisherName.trim() &&
//       state.edition.trim() &&
//       (!showCategoryOther || categoryOther.trim()) &&
//       (!showClassOther || classOther.trim()) &&
//       (!showSubjectOther || subjectOther.trim())
//     );
//   }, [
//     state,
//     categoryOther,
//     classOther,
//     subjectOther,
//     showCategoryOther,
//     showClassOther,
//     showSubjectOther,
//   ]);

//   const handleInputChange = (field: keyof typeof state, value: string) => {
//     dispatch({
//       type: "SET_FIELD",
//       field,
//       value,
//     });
//   };

//   const handleSelectOption = (field: keyof typeof state, value: string) => {
//     // Update the global state
//     dispatch({
//       type: "SET_FIELD",
//       field,
//       value,
//     });

//     // If selecting a non-"Others" option, clear the corresponding "Other" field
//     if (value !== "Others") {
//       if (field === "category") {
//         setCategoryOther("");
//       } else if (field === "className") {
//         setClassOther("");
//       } else if (field === "subject") {
//         setSubjectOther("");
//       }
//     }

//     // Close the modal
//     if (field === "category") setCategoryModal(false);
//     if (field === "className") setClassModal(false);
//     if (field === "subject") setSubjectModal(false);
//   };

//   const handleNext = () => {
//     if (isFormValid) {
//       // Prepare final data for backend
//       const finalData = {
//         bookTitle: state.bookTitle,
//         category:
//           state.category === "Others" ? categoryOther : state.category,
//         class:
//           state.className === "Others" ? classOther : state.className,
//         subject:
//           state.subject === "Others" ? subjectOther : state.subject,
//         authorName: state.authorName,
//         publisherName: state.publisherName,
//         edition: state.edition,
//       };
//       console.log("Final Data for Backend:", finalData);
//       // Add your navigation or backend logic here
//       router.push('/(screen)/UploadScreen2');
//     }
//   };

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

//   // Reusable Dropdown Component
//   const DropdownModal = ({ 
//     visible, 
//     onClose, 
//     data, 
//     field, 
//     title 
//   }: { 
//     visible: boolean; 
//     onClose: () => void; 
//     data: string[]; 
//     field: keyof typeof state; 
//     title: string; 
//   }) => (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { width: width * 0.9 }]}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{title}</Text>
//               <TouchableOpacity onPress={onClose}>
//                 <Ionicons name="close" size={24} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={data}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.dropdownItem}
//                   onPress={() => handleSelectOption(field, item)}
//                 >
//                   <Text style={styles.dropdownItemText}>{item}</Text>
//                   {state[field] === item && (
//                     <Ionicons name="checkmark" size={20} color="#003EF9" />
//                   )}
//                 </TouchableOpacity>
//               )}
//               showsVerticalScrollIndicator={false}
//               style={styles.dropdownList}
//             />
//           </View>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );

//   // Reusable Input Field Component
//   const InputField = ({
//     label,
//     placeholder,
//     value,
//     field,
//     multiline = false,
//   }: {
//     label: string;
//     placeholder: string;
//     value: string;
//     field: keyof typeof state;
//     multiline?: boolean;
//   }) => {
//     const isFilled = value.trim().length > 0;

//     return (
//       <View style={styles.fieldContainer}>
//         <View
//           style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
//         >
//           <Text style={styles.floatingLabelText}>{label}</Text>
//         </View>
//         <TextInput
//           style={[
//             styles.input,
//             isFilled && styles.inputFilled,
//             multiline && styles.inputMultiline,
//           ]}
//           placeholder={placeholder}
//           placeholderTextColor="rgba(0,0,0,0.4)"
//           value={value}
//           onChangeText={(text) => handleInputChange(field, text)}
//           multiline={multiline}
//           numberOfLines={multiline ? 4 : 1}
//           textAlignVertical={multiline ? "top" : "center"}
//         />
//       </View>
//     );
//   };

//   // Reusable Dropdown Field Component
//   const DropdownField = ({ 
//     label, 
//     placeholder, 
//     value, 
//     onPress 
//   }: { 
//     label: string; 
//     placeholder: string; 
//     value: string; 
//     onPress: () => void; 
//   }) => {
//     const isFilled = value.length > 0;

//     return (
//       <View style={styles.fieldContainer}>
//         <View
//           style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
//         >
//           <Text style={styles.floatingLabelText}>{label}</Text>
//         </View>
//         <TouchableOpacity
//           style={[styles.dropdown, isFilled && styles.dropdownFilled]}
//           onPress={onPress}
//         >
//           <Text
//             style={[styles.dropdownText, isFilled && styles.dropdownTextFilled]}
//           >
//             {value || placeholder}
//           </Text>
//           <Ionicons name="chevron-down" size={18} color="#444" />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={{ flex: 1 }}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
//         >
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={{ flex: 1 }}>
//               {/* ---------- FIXED HEADER ---------- */}
//               <View style={styles.header}>
//                 <Ionicons
//                   name="arrow-back-outline"
//                   size={24}
//                   color="#131E1E"
//                   onPress={() => router.back()}
//                 />
//                 <Text style={styles.headerTitle}>Shear Books</Text>
//               </View>

//               {/* ---------- FIXED BANNER ---------- */}
//               <View style={styles.bannerWrapper}>
//                 <Image
//                   source={require("../../assets/images/donate-book.png")}
//                   style={[styles.bannerImage, { width: width - 32 }]}
//                   resizeMode="cover"
//                 />
//               </View>

//               {/* ---------- SCROLLABLE FORM ---------- */}
//               <ScrollView
//                 style={styles.scrollView}
//                 contentContainerStyle={styles.scrollContent}
//                 showsVerticalScrollIndicator={false}
//                 keyboardShouldPersistTaps="handled"
//               >
//                 {/* ---------- FORM CARD ---------- */}
//                 <View style={[styles.formCard, { minHeight: height * 0.6 }]}>
//                   <Text style={styles.sectionTitle}>A. Basic Details</Text>

//                   {/* Book Title */}
//                   <InputField
//                     label="Book Title"
//                     placeholder="Book Name and Full Description"
//                     value={state.bookTitle}
//                     field="bookTitle"
//                   />

//                   {/* Category */}
//                   <DropdownField
//                     label="Category"
//                     placeholder="Select Book Category"
//                     value={state.category}
//                     onPress={() => setCategoryModal(true)}
//                   />

//                   {/* Category Other Field - Only shows when "Others" is selected */}
//                   {showCategoryOther && (
//                     <View style={styles.fieldContainer}>
//                       <View style={[styles.floatingLabel, categoryOther.trim() && styles.floatingLabelFilled]}>
//                         <Text style={styles.floatingLabelText}>Specify Category</Text>
//                       </View>
//                       <TextInput
//                         style={[styles.input, categoryOther.trim() && styles.inputFilled]}
//                         placeholder="Enter custom category"
//                         placeholderTextColor="rgba(0,0,0,0.4)"
//                         value={categoryOther}
//                         onChangeText={setCategoryOther}
//                       />
//                     </View>
//                   )}

//                   {/* Class */}
//                   <DropdownField
//                     label="Class"
//                     placeholder="Select Book Class"
//                     value={state.className}
//                     onPress={() => setClassModal(true)}
//                   />

//                   {/* Class Other Field - Only shows when "Others" is selected */}
//                   {showClassOther && (
//                     <View style={styles.fieldContainer}>
//                       <View style={[styles.floatingLabel, classOther.trim() && styles.floatingLabelFilled]}>
//                         <Text style={styles.floatingLabelText}>Specify Class</Text>
//                       </View>
//                       <TextInput
//                         style={[styles.input, classOther.trim() && styles.inputFilled]}
//                         placeholder="Enter custom class"
//                         placeholderTextColor="rgba(0,0,0,0.4)"
//                         value={classOther}
//                         onChangeText={setClassOther}
//                       />
//                     </View>
//                   )}

//                   {/* Subject */}
//                   <DropdownField
//                     label="Subject"
//                     placeholder="Select Subject"
//                     value={state.subject}
//                     onPress={() => setSubjectModal(true)}
//                   />

//                   {/* Subject Other Field - Only shows when "Others" is selected */}
//                   {showSubjectOther && (
//                     <View style={styles.fieldContainer}>
//                       <View style={[styles.floatingLabel, subjectOther.trim() && styles.floatingLabelFilled]}>
//                         <Text style={styles.floatingLabelText}>Specify Subject</Text>
//                       </View>
//                       <TextInput
//                         style={[styles.input, subjectOther.trim() && styles.inputFilled]}
//                         placeholder="Enter custom subject"
//                         placeholderTextColor="rgba(0,0,0,0.4)"
//                         value={subjectOther}
//                         onChangeText={setSubjectOther}
//                       />
//                     </View>
//                   )}

//                   {/* Author */}
//                   <InputField
//                     label="Author Name"
//                     placeholder="Author Name"
//                     value={state.authorName}
//                     field="authorName"
//                   />

//                   {/* Publisher */}
//                   <InputField
//                     label="Publisher Name"
//                     placeholder="Publisher Name"
//                     value={state.publisherName}
//                     field="publisherName"
//                   />

//                   {/* Edition */}
//                   <InputField
//                     label="Edition"
//                     placeholder="Edition (e.g., 2021, 3rd Edition)"
//                     value={state.edition}
//                     field="edition"
//                   />

//                   {/* Note */}
//                   <View style={styles.noteBox}>
//                     <Text style={styles.noteText}>
//                       <Text style={styles.noteBold}>Note:</Text> If your
//                       category, class, or subject is not in the list, select
//                       "Others" and specify it in the field that appears.
//                     </Text>
//                     <Text style={styles.noteExample}>
//                       Example: Select "Others" for Category, then enter
//                       "Biography" in the "Specify Category" field
//                     </Text>
//                   </View>
//                 </View>

//                 {/* ---------- NEXT BUTTON ---------- */}
//                 <TouchableOpacity
//                   style={[
//                     styles.nextButton,
//                     !isFormValid && styles.nextButtonDisabled,
//                   ]}
//                   onPress={handleNext}
//                   disabled={!isFormValid}
//                 >
//                   <Text
//                     style={[
//                       styles.nextText,
//                       !isFormValid && styles.nextTextDisabled,
//                     ]}
//                   >
//                     Next
//                   </Text>
//                 </TouchableOpacity>
//                 <View style={styles.buttonSpacer} />
//               </ScrollView>
//             </View>
//           </TouchableWithoutFeedback>

//           {/* ---------- DROPDOWN MODALS ---------- */}
//           <DropdownModal
//             visible={isCategoryModal}
//             onClose={() => setCategoryModal(false)}
//             data={categories}
//             field="category"
//             title="Select Category"
//           />

//           <DropdownModal
//             visible={isClassModal}
//             onClose={() => setClassModal(false)}
//             data={classes}
//             field="className"
//             title="Select Class"
//           />

//           <DropdownModal
//             visible={isSubjectModal}
//             onClose={() => setSubjectModal(false)}
//             data={subjects}
//             field="subject"
//             title="Select Subject"
//           />
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// export default UploadScreen1;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },

//   /* Header */
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "transparent",
//   },
//   buttonSpacer: {
//     height: 60,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "400",
//     marginLeft: 10,
//   },

//   /* Banner */
//   bannerWrapper: {
//     alignItems: "center",
//     marginVertical: 8,
//     backgroundColor: "transparent",
//   },
//   bannerImage: {
//     height: 160,
//     borderRadius: 9,
//     maxHeight: 200,
//     borderWidth: 2,
//     borderColor: "#003EF9",
//     elevation: 10,
//   },

//   /* Form Card */
//   formCard: {
//     backgroundColor: "#BDF4FF",
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 20,
//     borderRadius: 9,
//     borderWidth: 1,
//     borderColor: "#3DB9D4",
//     padding: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     marginBottom: 20,
//     color: "#000000E0",
//   },

//   /* Field Container */
//   fieldContainer: {
//     marginBottom: 16,
//     position: "relative",
//   },

//   /* Floating Label */
//   floatingLabel: {
//     position: "absolute",
//     left: 15,
//     top: -8,
//     paddingHorizontal: 6,
//     backgroundColor: "#D8D8D8",
//     borderRadius: 5,
//     zIndex: 2,
//     borderWidth: 1,
//     borderColor: "#44D6FF",
//   },
//   floatingLabelFilled: {
//     borderColor: "#003EF9B0",
//   },
//   floatingLabelText: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: "rgba(0,0,0,0.65)",
//   },

//   /* Input Fields */
//   input: {
//     minHeight: 48,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#44D6FF",
//     backgroundColor: "rgba(255, 255, 255, 0.36)",
//     paddingHorizontal: 14,
//     fontSize: 14,
//     color: "#0B0B0B",
//     paddingTop: 14,
//     paddingBottom: 14,
//   },
//   inputFilled: {
//     borderColor: "#003EF9B0",
//   },
//   inputMultiline: {
//     minHeight: 100,
//     paddingTop: 12,
//     paddingBottom: 12,
//   },

//   /* Dropdown */
//   dropdown: {
//     minHeight: 48,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#44D6FF",
//     backgroundColor: "rgba(255, 255, 255, 0.36)",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: 14,
//     paddingBottom: 14,
//   },
//   dropdownFilled: {
//     borderColor: "#003EF9B0",
//   },
//   dropdownText: {
//     fontSize: 14,
//     color: "rgba(0,0,0,0.5)",
//     flex: 1,
//   },
//   dropdownTextFilled: {
//     color: "#0B0B0B",
//   },

//   /* Note Box */
//   noteBox: {
//     backgroundColor: "rgba(207, 250, 254, 0.5)",
//     borderWidth: 2,
//     borderColor: "#44D6FF",
//     borderRadius: 10,
//     borderStyle: "dashed",
//     padding: 12,
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   noteText: {
//     fontSize: 11,
//     color: "#4b5563",
//     lineHeight: 16,
//     marginBottom: 4,
//   },
//   noteBold: {
//     fontWeight: "700",
//   },
//   noteExample: {
//     fontSize: 10,
//     color: "#666",
//     fontStyle: "italic",
//     lineHeight: 14,
//   },

//   /* Modal Styles */
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#FFF",
//     borderRadius: 16,
//     maxHeight: "60%",
//     overflow: "hidden",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   dropdownList: {
//     maxHeight: 300,
//   },
//   dropdownItem: {
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   dropdownItemText: {
//     fontSize: 16,
//     color: "#333",
//     flex: 1,
//   },

//   /* Next Button */
//   nextButton: {
//     backgroundColor: "rgba(20, 218, 232, 0.9)",
//     marginHorizontal: 16,
//     marginTop: 10,
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(0,0,0,0.08)",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.07,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//   },
//   nextButtonDisabled: {
//     backgroundColor: "rgba(156, 163, 175, 0.5)",
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   nextText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "rgba(255,255,255,0.78)",
//   },
//   nextTextDisabled: {
//     color: "rgba(107, 114, 128, 0.7)",
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
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
import { useUpload } from "../../Context/UploadContext";

const UploadScreen1 = () => {
  const { width, height } = useWindowDimensions();
  const { state, dispatch } = useUpload(); // ✅ GLOBAL STATE
  
  const [isCategoryModal, setCategoryModal] = useState(false);
  const [isClassModal, setClassModal] = useState(false);
  const [isSubjectModal, setSubjectModal] = useState(false);
  
  // These "other" fields are managed locally until Next is pressed
  const [categoryOther, setCategoryOther] = useState("");
  const [classOther, setClassOther] = useState("");
  const [subjectOther, setSubjectOther] = useState("");

  // Check if "Others" option is selected
  const showCategoryOther = state.category === "Others";
  const showClassOther = state.className === "Others";
  const showSubjectOther = state.subject === "Others";

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      state.bookTitle.trim() &&
      state.category &&
      state.className &&
      state.subject &&
      state.authorName.trim() &&
      state.publisherName.trim() &&
      state.edition.trim() &&
      (!showCategoryOther || categoryOther.trim()) &&
      (!showClassOther || classOther.trim()) &&
      (!showSubjectOther || subjectOther.trim())
    );
  }, [
    state,
    categoryOther,
    classOther,
    subjectOther,
    showCategoryOther,
    showClassOther,
    showSubjectOther,
  ]);

  const handleInputChange = (field: keyof typeof state, value: string) => {
    dispatch({
      type: "SET_FIELD",
      field,
      value,
    });
  };

  const handleSelectOption = (field: keyof typeof state, value: string) => {
    // Update the global state
    dispatch({
      type: "SET_FIELD",
      field,
      value,
    });

    // If selecting a non-"Others" option, clear the corresponding "Other" field
    if (value !== "Others") {
      if (field === "category") {
        setCategoryOther("");
      } else if (field === "className") {
        setClassOther("");
      } else if (field === "subject") {
        setSubjectOther("");
      }
    }

    // Close the modal
    if (field === "category") setCategoryModal(false);
    if (field === "className") setClassModal(false);
    if (field === "subject") setSubjectModal(false);
  };

  const handleNext = () => {
    if (isFormValid) {
      // Create a copy of current state
      const updatedState = { ...state };
      
      // If "Others" is selected with custom value, save the custom value to context
      if (showCategoryOther && categoryOther.trim()) {
        updatedState.category = categoryOther.trim();
      }
      
      if (showClassOther && classOther.trim()) {
        updatedState.className = classOther.trim();
      }
      
      if (showSubjectOther && subjectOther.trim()) {
        updatedState.subject = subjectOther.trim();
      }
      
      // Update all fields in context
      Object.entries(updatedState).forEach(([field, value]) => {
        if (field !== 'images' && field !== 'generatedPrice' && field !== 'originalPrice') {
          dispatch({
            type: "SET_FIELD",
            field: field as keyof typeof state,
            value,
          });
        }
      });

      // Prepare final data for backend
      const finalData = {
        bookTitle: updatedState.bookTitle,
        category: updatedState.category,
        class: updatedState.className,
        subject: updatedState.subject,
        authorName: updatedState.authorName,
        publisherName: updatedState.publisherName,
        edition: updatedState.edition,
      };
      
      console.log("Final Data for Backend:", finalData);
      console.log("UPLOAD CONTEXT STATE:", updatedState);
      
      // Navigate to next screen
      router.push('/(screen)/UploadScreen2');
    }
  };

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

  // Reusable Dropdown Component
  const DropdownModal = ({ 
    visible, 
    onClose, 
    data, 
    field, 
    title 
  }: { 
    visible: boolean; 
    onClose: () => void; 
    data: string[]; 
    field: keyof typeof state; 
    title: string; 
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: width * 0.9 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelectOption(field, item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                  {state[field] === item && (
                    <Ionicons name="checkmark" size={20} color="#003EF9" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.dropdownList}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Reusable Input Field Component
  const InputField = ({
    label,
    placeholder,
    value,
    field,
    multiline = false,
  }: {
    label: string;
    placeholder: string;
    value: string;
    field: keyof typeof state;
    multiline?: boolean;
  }) => {
    const isFilled = value.trim().length > 0;

    return (
      <View style={styles.fieldContainer}>
        <View
          style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
        >
          <Text style={styles.floatingLabelText}>{label}</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            isFilled && styles.inputFilled,
            multiline && styles.inputMultiline,
          ]}
          placeholder={placeholder}
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={value}
          onChangeText={(text) => handleInputChange(field, text)}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    );
  };

  // Reusable Dropdown Field Component
  const DropdownField = ({ 
    label, 
    placeholder, 
    value, 
    onPress 
  }: { 
    label: string; 
    placeholder: string; 
    value: string; 
    onPress: () => void; 
  }) => {
    const isFilled = value.length > 0;

    return (
      <View style={styles.fieldContainer}>
        <View
          style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
        >
          <Text style={styles.floatingLabelText}>{label}</Text>
        </View>
        <TouchableOpacity
          style={[styles.dropdown, isFilled && styles.dropdownFilled]}
          onPress={onPress}
        >
          <Text
            style={[styles.dropdownText, isFilled && styles.dropdownTextFilled]}
          >
            {value || placeholder}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* ---------- FIXED HEADER ---------- */}
              <View style={styles.header}>
                <Ionicons
                  name="arrow-back-outline"
                  size={24}
                  color="#131E1E"
                  onPress={() => router.back()}
                />
                <Text style={styles.headerTitle}>Shear Books</Text>
              </View>

              {/* ---------- FIXED BANNER ---------- */}
              <View style={styles.bannerWrapper}>
                <Image
                  source={require("../../assets/images/donate-book.png")}
                  style={[styles.bannerImage, { width: width - 32 }]}
                  resizeMode="cover"
                />
              </View>

              {/* ---------- SCROLLABLE FORM ---------- */}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* ---------- FORM CARD ---------- */}
                <View style={[styles.formCard, { minHeight: height * 0.6 }]}>
                  <Text style={styles.sectionTitle}>A. Basic Details</Text>

                  {/* Book Title */}
                  <InputField
                    label="Book Title"
                    placeholder="Book Name and Full Description"
                    value={state.bookTitle}
                    field="bookTitle"
                  />

                  {/* Category */}
                  <DropdownField
                    label="Category"
                    placeholder="Select Book Category"
                    value={state.category}
                    onPress={() => setCategoryModal(true)}
                  />

                  {/* Category Other Field - Only shows when "Others" is selected */}
                  {showCategoryOther && (
                    <View style={styles.fieldContainer}>
                      <View style={[styles.floatingLabel, categoryOther.trim() && styles.floatingLabelFilled]}>
                        <Text style={styles.floatingLabelText}>Specify Category</Text>
                      </View>
                      <TextInput
                        style={[styles.input, categoryOther.trim() && styles.inputFilled]}
                        placeholder="Enter custom category"
                        placeholderTextColor="rgba(0,0,0,0.4)"
                        value={categoryOther}
                        onChangeText={setCategoryOther}
                      />
                    </View>
                  )}

                  {/* Class */}
                  <DropdownField
                    label="Class"
                    placeholder="Select Book Class"
                    value={state.className}
                    onPress={() => setClassModal(true)}
                  />

                  {/* Class Other Field - Only shows when "Others" is selected */}
                  {showClassOther && (
                    <View style={styles.fieldContainer}>
                      <View style={[styles.floatingLabel, classOther.trim() && styles.floatingLabelFilled]}>
                        <Text style={styles.floatingLabelText}>Specify Class</Text>
                      </View>
                      <TextInput
                        style={[styles.input, classOther.trim() && styles.inputFilled]}
                        placeholder="Enter custom class"
                        placeholderTextColor="rgba(0,0,0,0.4)"
                        value={classOther}
                        onChangeText={setClassOther}
                      />
                    </View>
                  )}

                  {/* Subject */}
                  <DropdownField
                    label="Subject"
                    placeholder="Select Subject"
                    value={state.subject}
                    onPress={() => setSubjectModal(true)}
                  />

                  {/* Subject Other Field - Only shows when "Others" is selected */}
                  {showSubjectOther && (
                    <View style={styles.fieldContainer}>
                      <View style={[styles.floatingLabel, subjectOther.trim() && styles.floatingLabelFilled]}>
                        <Text style={styles.floatingLabelText}>Specify Subject</Text>
                      </View>
                      <TextInput
                        style={[styles.input, subjectOther.trim() && styles.inputFilled]}
                        placeholder="Enter custom subject"
                        placeholderTextColor="rgba(0,0,0,0.4)"
                        value={subjectOther}
                        onChangeText={setSubjectOther}
                      />
                    </View>
                  )}

                  {/* Author */}
                  <InputField
                    label="Author Name"
                    placeholder="Author Name"
                    value={state.authorName}
                    field="authorName"
                  />

                  {/* Publisher */}
                  <InputField
                    label="Publisher Name"
                    placeholder="Publisher Name"
                    value={state.publisherName}
                    field="publisherName"
                  />

                  {/* Edition */}
                  <InputField
                    label="Edition"
                    placeholder="Edition (e.g., 2021, 3rd Edition)"
                    value={state.edition}
                    field="edition"
                  />

                  {/* Note */}
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>
                      <Text style={styles.noteBold}>Note:</Text> If your
                      category, class, or subject is not in the list, select
                      "Others" and specify it in the field that appears.
                    </Text>
                    <Text style={styles.noteExample}>
                      Example: Select "Others" for Category, then enter
                      "Biography" in the "Specify Category" field
                    </Text>
                  </View>
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

          {/* ---------- DROPDOWN MODALS ---------- */}
          <DropdownModal
            visible={isCategoryModal}
            onClose={() => setCategoryModal(false)}
            data={categories}
            field="category"
            title="Select Category"
          />

          <DropdownModal
            visible={isClassModal}
            onClose={() => setClassModal(false)}
            data={classes}
            field="className"
            title="Select Class"
          />

          <DropdownModal
            visible={isSubjectModal}
            onClose={() => setSubjectModal(false)}
            data={subjects}
            field="subject"
            title="Select Subject"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default UploadScreen1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  buttonSpacer: {
    height: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "400",
    marginLeft: 10,
  },

  /* Banner */
  bannerWrapper: {
    alignItems: "center",
    marginVertical: 8,
    backgroundColor: "transparent",
  },
  bannerImage: {
    height: 160,
    borderRadius: 9,
    maxHeight: 200,
    borderWidth: 2,
    borderColor: "#003EF9",
    elevation: 10,
  },

  /* Form Card */
  formCard: {
    backgroundColor: "#BDF4FF",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#3DB9D4",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000000E0",
  },

  /* Field Container */
  fieldContainer: {
    marginBottom: 16,
    position: "relative",
  },

  /* Floating Label */
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

  /* Input Fields */
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

  /* Dropdown */
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

  /* Note Box */
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
  noteExample: {
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 14,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    maxHeight: "60%",
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },

  /* Next Button */
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
});