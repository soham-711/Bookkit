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
// const UploadScreen2 = () => {
//   const { width } = useWindowDimensions();
//   const [isConditionModal, setConditionModal] = useState(false);
//   const [isWritingModal, setWritingModal] = useState(false);
//   const [isPagesModal, setPagesModal] = useState(false);
// const { state } = useUpload();

//   const [formData, setFormData] = useState({
//     bookCondition: "",
//     conditionDescription: "",
//     writingMarking: "",
//     pagesMissing: "",
//     originalPrice: "",
//   });

//   // Dropdown options
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

//   // Form validation
//   const isFormValid = useMemo(() => {
//     return (
//       formData.bookCondition.trim() !== "" &&
//       formData.conditionDescription.trim() !== "" &&
//       formData.writingMarking.trim() !== "" &&
//       formData.pagesMissing.trim() !== "" &&
//       formData.originalPrice.trim() !== "" &&
//       !isNaN(Number(formData.originalPrice))
//     );
//   }, [formData]);

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSelectOption = (field: string, value: string) => {
//     handleInputChange(field, value);

//     // Close the modal
//     if (field === "bookCondition") setConditionModal(false);
//     if (field === "writingMarking") setWritingModal(false);
//     if (field === "pagesMissing") setPagesModal(false);
//   };

//   const handleNext = () => {
//     if (isFormValid) {
//       console.log("Book Condition Data:", formData);
//       // Navigate to next screen or submit form
//        router.push("/(screen)/UploadScreen3");
//     }
//   };

//   const handleBack = () => {
//     router.back();
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
//     keyboardType = "default",
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
//           keyboardType={keyboardType}
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
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={{ flex: 1 }}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//         >
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={{ flex: 1 }}>
//               {/* ---------- FIXED HEADER ---------- */}
//               <View style={styles.header}>
//                 <Ionicons
//                   name="arrow-back-outline"
//                   size={24}
//                   color="#131E1E"
//                   onPress={handleBack}
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
//                 contentContainerStyle={styles.scrollContent}
//                 showsVerticalScrollIndicator={false}
//                 keyboardShouldPersistTaps="handled"
//                 style={styles.scrollView}
//               >
//                 {/* ---------- FORM CARD ---------- */}
//                 <View style={styles.formCard}>
//                   <Text style={styles.sectionTitle}>
//                     B. Book Condition & Description
//                   </Text>

//                   {/* Book Condition */}
//                   <DropdownField
//                     label="Book Condition"
//                     placeholder="Select Book Condition"
//                     value={formData.bookCondition}
//                     onPress={() => setConditionModal(true)}
//                   />

//                   {/* Condition Description */}
//                   <InputField
//                     label="Book Description"
//                     placeholder="About the Book Condition"
//                     value={formData.conditionDescription}
//                     onChangeText={handleInputChange}
//                     field="conditionDescription"
//                     multiline
//                   />

//                   {/* Writing/Marking */}
//                   <DropdownField
//                     label="Any Writing/Marking Inside?"
//                     placeholder="Select Any Writing/Marking Inside?"
//                     value={formData.writingMarking}
//                     onPress={() => setWritingModal(true)}
//                   />

//                   {/* Pages Missing/Torn */}
//                   <DropdownField
//                     label="Any Pages Missing or Torn?"
//                     placeholder="Select Any Pages Missing or Torn?"
//                     value={formData.pagesMissing}
//                     onPress={() => setPagesModal(true)}
//                   />

//                   {/* ---------- PRICE SECTION ---------- */}
//                   <View style={styles.priceSection}>
//                     <Text style={styles.sectionTitle}>C. Price</Text>

//                     {/* Original Price */}
//                     <InputField
//                       label="Original MRP Printed"
//                       placeholder="Enter original MRP price"
//                       value={formData.originalPrice}
//                       onChangeText={handleInputChange}
//                       field="originalPrice"
//                       keyboardType="numeric"
//                     />

//                     <View style={styles.noteBox}>
//                       <Text style={styles.noteText}>
//                         <Text style={styles.noteBold}>Note:</Text> Enter the
//                         original Maximum Retail Price (MRP) printed on the book
//                         cover. Your selling price will be calculated based on
//                         book condition.
//                       </Text>
//                     </View>
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
//               </ScrollView>
//             </View>
//           </TouchableWithoutFeedback>

//           {/* ---------- DROPDOWN MODALS ---------- */}
//           <DropdownModal
//             visible={isConditionModal}
//             onClose={() => setConditionModal(false)}
//             data={bookConditions}
//             field="bookCondition"
//             title="Select Book Condition"
//           />

//           <DropdownModal
//             visible={isWritingModal}
//             onClose={() => setWritingModal(false)}
//             data={writingOptions}
//             field="writingMarking"
//             title="Select Writing/Marking"
//           />

//           <DropdownModal
//             visible={isPagesModal}
//             onClose={() => setPagesModal(false)}
//             data={pagesOptions}
//             field="pagesMissing"
//             title="Select Pages Condition"
//           />
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// export default UploadScreen2;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: Platform.OS === "ios" ? 20 : 10, // Minimal padding
//   },

//   /* Header */
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "transparent",
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
//     borderWidth: 2,
//     borderColor: "#003EF9",
//     elevation: 10,
//   },

//   /* Form Card */
//   formCard: {
//     backgroundColor: "#BDF4FF",
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: Platform.OS === "ios" ? 20 : 10, // Minimal bottom margin
//     borderRadius: 14,
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

//   /* Price Section */
//   priceSection: {
//     marginTop: 20,
//     paddingTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: "rgba(0, 62, 249, 0.2)",
//   },

//   /* Field Container */
//   fieldContainer: {
//     marginBottom: 16,
//     position: "relative",
//   },

//   /* Floating Label */
//   floatingLabel: {
//     position: "absolute",
//     left: 12,
//     top: -8,
//     paddingHorizontal: 6,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 6,
//     zIndex: 2,
//     borderWidth: 1,
//     borderColor: "#44D6FF",
//   },
//   floatingLabelFilled: {
//     borderColor: "#003EF9",
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
//     borderColor: "#003EF9",
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
//     borderColor: "#003EF9",
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

//   /* Next Button */
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
// });

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
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

const UploadScreen2 = () => {
  const { width } = useWindowDimensions();
  const { state, dispatch } = useUpload();

  const [openDropdown, setOpenDropdown] = useState<
    "bookCondition" | "writingMarking" | "pagesMissing" | null
  >(null);

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      state.bookCondition.trim() !== "" &&
      state.conditionDescription.trim() !== "" &&
      state.writingMarking.trim() !== "" &&
      state.pagesMissing.trim() !== "" &&
      state.originalPrice !== null &&
      state.originalPrice > 0
    );
  }, [state]);

  const handleInputChange = (
    field: keyof typeof state,
    value: string | number | null
  ) => {
    dispatch({
      type: "SET_FIELD",
      field,
      value,
    });
  };

  const handleSelectOption = (
    field: "bookCondition" | "writingMarking" | "pagesMissing",
    value: string
  ) => {
    dispatch({
      type: "SET_FIELD",
      field,
      value,
    });
    setOpenDropdown(null);
  };

  const handleNext = () => {
    if (isFormValid) {
      console.log("Book Condition Data from Context:", {
        bookCondition: state.bookCondition,
        conditionDescription: state.conditionDescription,
        writingMarking: state.writingMarking,
        pagesMissing: state.pagesMissing,
        originalPrice: state.originalPrice,
      });
      router.push("/(screen)/UploadScreen3");
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Dropdown options
  const bookConditions = [
    "Brand New",
    "Like New",
    "Very Good",
    "Good",
    "Fair",
    "Poor",
  ] as const;

  const writingOptions = [
    "None",
    "Minimal (Few pages)",
    "Moderate (Some pages)",
    "Heavy (Most pages)",
    "Highlighted Text",
  ] as const;

  const pagesOptions = [
    "None - All pages intact",
    "Few pages missing",
    "Some pages torn",
    "Many pages missing",
    "Cover damaged",
  ] as const;

  // Reusable Input Field
  const InputField = ({
    label,
    placeholder,
    value,
    onChange,
    multiline = false,
    keyboardType = "default",
  }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (text: string) => void;
    multiline?: boolean;
    keyboardType?: "default" | "numeric";
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
          onChangeText={onChange}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
          keyboardType={keyboardType}
        />
      </View>
    );
  };

  // Inline Dropdown Field (same style as UploadScreen1)
  const InlineDropdownField = ({
    label,
    placeholder,
    value,
    data,
    field,
  }: {
    label: string;
    placeholder: string;
    value: string;
    data: readonly string[];
    field: "bookCondition" | "writingMarking" | "pagesMissing";
  }) => {
    const isFilled = value.length > 0;
    const isOpen = openDropdown === field;

    return (
      <View style={styles.fieldContainer}>
        <View
          style={[styles.floatingLabel, isFilled && styles.floatingLabelFilled]}
        >
          <Text style={styles.floatingLabelText}>{label}</Text>
        </View>

        <TouchableOpacity
          style={[styles.dropdown, isFilled && styles.dropdownFilled]}
          onPress={() => setOpenDropdown(isOpen ? null : field)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.dropdownText, isFilled && styles.dropdownTextFilled]}
          >
            {value || placeholder}
          </Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#444"
          />
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.inlineDropdownContainer}>
            <ScrollView
              style={styles.dropdownList}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {data.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectOption(field, item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                  {value === item && (
                    <Ionicons name="checkmark" size={20} color="#003EF9" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#ffffff", "#f2fbfbff"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Header */}
              <View style={styles.header}>
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color="#131E1E"
                  onPress={handleBack}
                />
                <Text style={styles.headerTitle}>Sell Books</Text>
              </View>

              {/* Banner */}
              <View style={styles.bannerWrapper}>
                <Image
                  source={require("../../assets/images/donate-book2.png")}
                  style={[styles.bannerImage, { width: width - 32 }]}
                  resizeMode="stretch"
                />
              </View>

              {/* Form */}
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scrollView}
              >
                <View style={styles.formCard}>
                  <Text style={styles.sectionTitle}>
                    B. Book Condition & Description
                  </Text>

                  {/* Book Condition */}
                  <InlineDropdownField
                    label="Book Condition"
                    placeholder="Select Book Condition"
                    value={state.bookCondition}
                    data={bookConditions}
                    field="bookCondition"
                  />

                  {/* Condition Description */}
                  <InputField
                    label="Book Description"
                    placeholder="About the Book Condition"
                    value={state.conditionDescription}
                    onChange={(text) =>
                      handleInputChange("conditionDescription", text)
                    }
                    multiline
                  />

                  {/* Writing/Marking */}
                  <InlineDropdownField
                    label="Any Writing/Marking Inside?"
                    placeholder="Select Writing/Marking"
                    value={state.writingMarking}
                    data={writingOptions}
                    field="writingMarking"
                  />

                  {/* Pages Missing/Torn */}
                  <InlineDropdownField
                    label="Any Pages Missing or Torn?"
                    placeholder="Select Pages Condition"
                    value={state.pagesMissing}
                    data={pagesOptions}
                    field="pagesMissing"
                  />

                  {/* Price Section */}
                  <View style={styles.priceSection}>
                    <Text style={styles.sectionTitle}>C. Price</Text>

                    <View style={styles.fieldContainer}>
                      <View
                        style={[
                          styles.floatingLabel,
                          state.originalPrice !== null &&
                            styles.floatingLabelFilled,
                        ]}
                      >
                        <Text style={styles.floatingLabelText}>
                          Original MRP Printed
                        </Text>
                      </View>
                      <TextInput
                        style={[
                          styles.input,
                          state.originalPrice !== null && styles.inputFilled,
                        ]}
                        placeholder="Enter original MRP price"
                        placeholderTextColor="rgba(0,0,0,0.4)"
                        value={
                          state.originalPrice
                            ? state.originalPrice.toString()
                            : ""
                        }
                        onChangeText={(text) => {
                          const numValue = text ? parseFloat(text) : null;
                          handleInputChange("originalPrice", numValue);
                        }}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.noteBox}>
                      <Text style={styles.noteText}>
                        <Text style={styles.noteBold}>Note:</Text> Enter the
                        original Maximum Retail Price (MRP) printed on the book
                        cover. Your selling price will be calculated based on
                        book condition.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Next Button */}
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
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default UploadScreen2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

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

  priceSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 62, 249, 0.2)",
  },

  fieldContainer: {
    marginBottom: 16,
    position: "relative",
  },

  floatingLabel: {
    position: "absolute",
    left: 12,
    top: -8,
    paddingHorizontal: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    zIndex: 2,
    borderWidth: 1,
    borderColor: "#44D6FF",
  },
  floatingLabelFilled: {
    borderColor: "#003EF9",
  },
  floatingLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(0,0,0,0.65)",
  },

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
    borderColor: "#003EF9",
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },

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
    borderColor: "#003EF9",
  },
  dropdownText: {
    fontSize: 14,
    color: "rgba(0,0,0,0.5)",
    flex: 1,
  },
  dropdownTextFilled: {
    color: "#0B0B0B",
  },

  inlineDropdownContainer: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#44D6FF",
    backgroundColor: "#fff",
    maxHeight: 240,
    overflow: "hidden",
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
