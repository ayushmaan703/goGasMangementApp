import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Modal,
    Pressable,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import CustomNavBar from "../helper/CustomNavBar";
import { editCustomer, getLocality, getState } from "../store/slice/Customer.slice";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../helper/InputField";
import Dropdown from "../helper/Dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { pickImage } from "../helper/ImagePicker.js";
import { uploadImage } from "../services/Cloudinary.js";

const EditCustomer = ({ route }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const userData = useSelector(state => state.auth.userData)
    const customer = route?.params?.customer || {};
    const comid = userData?.Comid
    const existingImageUrl = customer?.custImg || "";

    const [form, setForm] = useState({
        CustomerName: customer?.CustomerName || "",
        // Address: customer?.Address || "",
        StateName: userData?.StateName || "",
        StateCode: userData?.StateCode || userData?.GSTCode || "",
        LocatlityId: customer?.LocatlityId || customer?.LocalityId || "",
        ContactPerson: customer?.ContactPerson || "",
        MobileNo: customer?.MobileNo || customer?.ContactNo || "",
        SalespersonId: userData?.EmpId || userData?.Id || "",
    });

    // const stateList = useSelector((state) => state.customer.stateList) || []
    // const [states, setStates] = useState({});
    // const [stateDropdown, setStateDropdown] = useState(false);
    // const [loadingStates, setLoadingStates] = useState(false);

    const localityList = useSelector((state) => state.customer.localityList) || []

    const [localities, setLocalities] = useState({});
    const [localityDropdown, setLocalityDropdown] = useState(false);
    const [loadingLocalities, setLoadingLocalities] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const previewImage = selectedImage?.uri || (!imageRemoved ? existingImageUrl : "");

    const updateField = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    useEffect(() => {
        dispatch(getState(comid));
        dispatch(getLocality(comid));
    }, []);

    const handleStateSelect = state => {
        setForm(prev => ({
            ...prev,
            StateName: state?.StateName || "",
            StateCode: state?.GSTCode || "",
        }));

        setStateDropdown(false);
    };

    const handleLocalitySelect = locality => {
        setForm(prev => ({
            ...prev,
            LocatlityId: locality?.Id || "",
        }));

        setLocalityDropdown(false);
    };

    // const selectedState = stateList?.find(state => String(state?.GSTCode) === String(form.StateCode));
    const selectedLocality = localityList?.find(locality => String(locality?.Id) === String(form.LocatlityId));

    const handleSave = async () => {
        try {
            setSaving(true);

            const payload = {
                CustomerId: customer?.CustomerId,
                CustomerName: form.CustomerName.trim(),
                // Address: form.Address.trim(),
                StateName: form.StateName,
                StateCode: form.StateCode,
                LocatlityId: form.LocatlityId,
                ContactPerson: form.ContactPerson.trim(),
                ContactNo: form.MobileNo,
                SalespersonId: form.SalespersonId,
                comid: comid,
                custImg: existingImageUrl
            };

            if (selectedImage) {
                setUploadingImage(true);
                const imageData = await uploadImage(selectedImage);
                payload.custImg = imageData || null;
                setUploadingImage(false);
            }

            const res = await dispatch(editCustomer(payload));

            if (res.type === "editCustomer/fulfilled") {
                Toast.show({
                    type: "customNotificationSuccess",
                    text1: "Customer updated successfully",
                });

                navigation.goBack();
            } else {
                Toast.show({
                    type: "customNotificationError",
                    text1:
                        res?.payload?.message ||
                        res?.error?.message ||
                        "Unable to update customer",
                });
            }

        } catch (error) {
            Toast.show({
                type: "customNotificationError",
                text1:
                    error?.message ||
                    error?.response?.data?.message ||
                    "Unable to update customer",
            });

        } finally {
            setUploadingImage(false);
            setSaving(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const image = await pickImage();

            if (image) {
                setSelectedImage(image);
                setImageRemoved(false);
            }
        } catch (error) {
            Toast.show({
                type: "customNotificationError",
                text1: error?.message || "Unable to select image",
            });
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImageRemoved(true);
    };

    const handleOpenImage = () => {
        if (previewImage) {
            setShowImageModal(true);
        }
    };

    return (
        <View style={styles.container}>

            <CustomNavBar
                navName="Edit Customer"
                subtitle="Update customer details" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <KeyboardAwareScrollView
                    contentContainerStyle={
                        styles.scrollContainer
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                        nestedScrollEnabled={true}

                    >
                        <Text style={styles.sectionTitle}>
                            Customer Image
                        </Text>

                        <View style={styles.imageCard}>
                            {previewImage ? (
                                <View style={styles.imagePreviewContainer}>

                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={handleOpenImage}
                                    >
                                        <View style={styles.imagePreviewWrapper}>

                                            <Image
                                                source={{ uri: previewImage }}
                                                style={styles.imagePreview}
                                            />

                                            <View style={styles.imageExpandBadge}>
                                                <FontAwesome6
                                                    name="expand"
                                                    size={11}
                                                    color="#FFFFFF"
                                                />
                                            </View>

                                        </View>
                                    </TouchableOpacity>

                                    <Text style={styles.imageHint}>
                                        Tap image to view full size
                                    </Text>

                                    <View style={styles.imageActions}>

                                        {/* CHANGE */}

                                        <TouchableOpacity
                                            style={styles.changeImageButton}
                                            onPress={handlePickImage}
                                            activeOpacity={0.8}
                                            disabled={saving}
                                        >
                                            <FontAwesome6
                                                name="pen"
                                                size={12}
                                                color="#4A90E2"
                                            />

                                            <Text style={styles.changeImageText}>
                                                Change Image
                                            </Text>
                                        </TouchableOpacity>


                                        {/* REMOVE */}

                                        {/* <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={handleRemoveImage}
                                            activeOpacity={0.8}
                                            disabled={saving}
                                        >
                                            <FontAwesome6
                                                name="trash"
                                                size={12}
                                                color="#EF4444"
                                            />

                                            <Text style={styles.removeImageText}>
                                                Remove
                                            </Text>
                                        </TouchableOpacity> */}

                                    </View>
                                </View>

                            ) : (

                                <TouchableOpacity
                                    style={styles.uploadImageButton}
                                    onPress={handlePickImage}
                                    activeOpacity={0.8}
                                    disabled={saving}
                                >

                                    <View style={styles.uploadIconContainer}>
                                        <FontAwesome6
                                            name="cloud-arrow-up"
                                            size={22}
                                            color="#4A90E2"
                                        />
                                    </View>

                                    <View style={styles.uploadTextContainer}>
                                        <Text style={styles.uploadTitle}>
                                            Upload Customer Image
                                        </Text>

                                        <Text style={styles.uploadSubtitle}>
                                            JPG, PNG or WEBP
                                        </Text>
                                    </View>

                                    <FontAwesome6
                                        name="chevron-right"
                                        size={13}
                                        color="#94A3B8"
                                    />

                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.sectionTitle}>
                            Customer Information
                        </Text>

                        <View style={styles.card}>

                            <InputField
                                icon="building"
                                label="Customer Name"
                                value={form.CustomerName}
                                onChangeText={value => updateField("CustomerName", value)}
                                placeholder="Enter customer name"
                            />

                            {/* <InputField
                                icon="location-dot"
                                label="Address"
                                value={form.Address}
                                onChangeText={value => updateField("Address", value)}
                                placeholder="Enter address"
                                multiline
                            /> */}

                        </View>

                        {/* CUSTOMER IMAGE */}



                        {/* LOCATION */}

                        <Text style={styles.sectionTitle}>
                            Location
                        </Text>

                        <View style={styles.card}>

                            {/* <Dropdown
                                icon="map-location-dot"
                                label="State"
                                value={selectedState?.StateName || form.StateName}
                                placeholder="Select state"
                                open={stateDropdown}
                                setOpen={setStateDropdown}
                                data={stateList}
                                onSelect={handleStateSelect}
                                displayKey="StateName"
                                loading={loadingStates}
                            />
                            <InputField
                                icon="hashtag"
                                label="State Code"
                                value={form.StateCode}
                                onChangeText={value => updateField("StateCode", value)}
                                placeholder="Enter state code"
                                disabled={true}
                            /> */}

                            <Dropdown
                                icon="location-dot"
                                label="Locality"
                                value={selectedLocality?.Locality || ""}
                                placeholder="Select locality"
                                open={localityDropdown}
                                setOpen={setLocalityDropdown}
                                data={localityList}
                                onSelect={handleLocalitySelect}
                                displayKey="Locality"
                                loading={loadingLocalities}
                            />

                        </View>

                        {/* CONTACT */}

                        <Text style={styles.sectionTitle}>
                            Contact Information
                        </Text>

                        <View style={styles.card}>

                            <InputField
                                icon="user-tie"
                                label="Contact Person"
                                value={form.ContactPerson}
                                onChangeText={value => updateField("ContactPerson", value)}
                                placeholder="Enter contact person"
                            />

                            <InputField
                                icon="phone"
                                label="Mobile Number"
                                value={form.MobileNo}
                                onChangeText={value => updateField("MobileNo", value.replace(/[^0-9]/g, ""))}
                                placeholder="Enter mobile number"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                        </View>

                        {/* SAVE */}

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.saveButton,
                                saving &&
                                styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={saving || uploadingImage}
                        >
                            {(saving || uploadingImage) ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <>
                                    <FontAwesome6
                                        name="floppy-disk"
                                        size={15}
                                        color="#FFFFFF"
                                    />

                                    <Text
                                        style={
                                            styles.saveButtonText
                                        }
                                    >
                                        Save Changes
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* CANCEL */}

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.cancelButton}
                            onPress={() =>
                                navigation.goBack()
                            }
                            disabled={saving}
                        >
                            <Text
                                style={
                                    styles.cancelButtonText
                                }
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <View
                            style={styles.bottomSpace}
                        />

                    </ScrollView>
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
            {/* FULL IMAGE MODAL */}

            <Modal
                visible={showImageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowImageModal(false)}
            >
                <View style={styles.imageModalContainer}>

                    {/* CLOSE */}

                    <Pressable
                        style={styles.imageModalClose}
                        onPress={() => setShowImageModal(false)}
                    >
                        <FontAwesome6
                            name="xmark"
                            size={18}
                            color="#FFFFFF"
                        />
                    </Pressable>


                    {/* IMAGE */}

                    <Pressable
                        style={styles.fullImageWrapper}
                        onPress={() => setShowImageModal(false)}
                    >
                        <Image
                            source={{ uri: previewImage }}
                            style={styles.fullCustomerImage}
                            resizeMode="contain"
                        />
                    </Pressable>

                </View>
            </Modal>
        </View >
    );
};

export default EditCustomer;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 30,
    },
    scrollContainer: {
        flexGrow: 1,
        position: "relative",
        paddingBottom: 35,
    },
    sectionTitle: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 7,
        marginBottom: 9,
        marginLeft: 3,
        textTransform: "uppercase",
        letterSpacing: 0.7,
        fontFamily: "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "#EDF1F6",
        shadowColor: "#1E293B",
        shadowOpacity: 0.035,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 2,
    },

    saveButton: {
        height: 55,
        borderRadius: 17,
        backgroundColor: "#4A90E2",
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4A90E2",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        elevation: 5,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },

    saveButtonText: {
        color: "#FFFFFF",

        fontSize: 12,

        marginLeft: 9,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 0.3,
    },

    cancelButton: {
        height: 48,

        borderRadius: 15,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E2E8F0",

        marginTop: 10,

        justifyContent: "center",
        alignItems: "center",
    },

    cancelButtonText: {
        fontSize: 10,

        color: "#64748B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    bottomSpace: {
        height: 20,
    },
    // =========================================================
    // CUSTOMER IMAGE
    // =========================================================

    imageCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: "#EDF1F6",

        shadowColor: "#1E293B",
        shadowOpacity: 0.035,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 3,
        },

        elevation: 2,
    },

    uploadImageButton: {
        minHeight: 82,
        borderRadius: 15,

        backgroundColor: "#F8FAFC",

        borderWidth: 1,
        borderColor: "#E5EDF7",
        borderStyle: "dashed",

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 14,
    },

    uploadIconContainer: {
        width: 44,
        height: 44,

        borderRadius: 13,

        backgroundColor: "#EAF3FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 12,
    },

    uploadTextContainer: {
        flex: 1,
    },

    uploadTitle: {
        fontSize: 10,
        color: "#334155",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    uploadSubtitle: {
        fontSize: 8,
        color: "#94A3B8",

        marginTop: 4,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    imagePreviewContainer: {
        alignItems: "center",
    },

    imagePreviewWrapper: {
        width: 170,
        height: 170,

        borderRadius: 18,

        overflow: "hidden",

        backgroundColor: "#F1F5F9",

        borderWidth: 1,
        borderColor: "#E2E8F0",

        position: "relative",
    },

    imagePreview: {
        width: "100%",
        height: "100%",
    },

    imageExpandBadge: {
        position: "absolute",

        right: 8,
        bottom: 8,

        width: 28,
        height: 28,

        borderRadius: 9,

        backgroundColor: "rgba(0, 0, 0, 0.55)",

        alignItems: "center",
        justifyContent: "center",
    },

    imageHint: {
        fontSize: 8,
        color: "#94A3B8",

        marginTop: 7,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },

    imageActions: {
        flexDirection: "row",

        marginTop: 12,

        gap: 10,
    },

    changeImageButton: {
        height: 38,

        paddingHorizontal: 14,

        borderRadius: 11,

        backgroundColor: "#EAF3FF",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    changeImageText: {
        color: "#4A90E2",

        fontSize: 9,

        marginLeft: 7,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    removeImageButton: {
        height: 38,

        paddingHorizontal: 14,

        borderRadius: 11,

        backgroundColor: "#FEF2F2",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    removeImageText: {
        color: "#EF4444",

        fontSize: 9,

        marginLeft: 7,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    // =========================================================
    // FULL IMAGE MODAL
    // =========================================================

    imageModalContainer: {
        flex: 1,

        backgroundColor: "rgba(0, 0, 0, 0.95)",

        justifyContent: "center",
        alignItems: "center",
    },

    fullImageWrapper: {
        width: "100%",
        height: "100%",

        justifyContent: "center",
        alignItems: "center",
    },

    fullCustomerImage: {
        width: "100%",
        height: "85%",
    },

    imageModalClose: {
        position: "absolute",

        top: 45,
        right: 20,

        width: 42,
        height: 42,

        borderRadius: 14,

        backgroundColor: "rgba(255, 255, 255, 0.15)",

        alignItems: "center",
        justifyContent: "center",

        zIndex: 10,
    },
});