import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";

import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import CustomNavBar from "../helper/CustomNavBar";
import InputField from "../helper/InputField";
import Dropdown from "../helper/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { createCustomer, getLocality, getState } from "../store/slice/Customer.slice";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const CreateCustomer = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const salesPersonList = useSelector((state) => state.sales.allSalesPersonList) || [];
    const userData = useSelector((state) => state.auth.userData);
    const stateList = useSelector((state) => state.customer.stateList) || []
    const localityList = useSelector((state) => state.customer.localityList) || []
    const comid = userData?.Comid
    const isAdmin = userData?.UserType === "Admin";

    const [form, setForm] = useState({
        CustomerName: "",
        Address: "",
        StateName: userData?.StateName || "",
        StateCode: userData?.StateCode || "",
        LocatlityId: "",
        ContactPerson: "",
        MobileNo: "",
        SalespersonId: userData?.Id || userData?.EmpId || "",
    });


    // const [states, setStates] = useState([]);
    // const [stateDropdown, setStateDropdown] = useState(false);
    // const [loadingStates, setLoadingStates] = useState(false);

    const [selectedUser, setSelectedUser] = useState(userData?.EmpId);
    const [localities, setLocalities] = useState([]);
    const [localityDropdown, setLocalityDropdown] = useState(false);
    const [loadingLocalities, setLoadingLocalities] = useState(false);
    const [saving, setSaving] = useState(false);


    const updateField = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    useEffect(() => {
        // dispatch(getState());
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

    // const selectedState = stateList.find(state => String(state?.GSTCode) === String(form.StateCode));
    const selectedLocality = localityList.find(locality => String(locality?.Id) === String(form.LocatlityId));

    const validateForm = () => {

        if (!form.CustomerName.trim()) {
            Toast.show({
                type: "customNotificationError",
                text1: "Customer name is required",
            });

            return false;
        }

        // if (!form.Address.trim()) {
        //     Toast.show({
        //         type: "customNotificationError",
        //         text1: "Address is required",
        //     });

        //     return false;
        // }

        if (!form.StateCode) {
            Toast.show({
                type: "customNotificationError",
                text1: "Please select a state",
            });

            return false;
        }

        if (!form.LocatlityId) {
            Toast.show({
                type: "customNotificationError",
                text1: "Please select a locality",
            });

            return false;
        }

        if (!form.ContactPerson.trim()) {
            Toast.show({
                type: "customNotificationError",
                text1: "Contact person is required",
            });

            return false;
        }

        if (!/^[0-9]{10}$/.test(form.MobileNo)) {
            Toast.show({
                type: "customNotificationError",
                text1: "Enter a valid mobile number",
            });

            return false;
        }

        return true;
    };

    const handleCreate = async () => {

        if (!validateForm()) {
            return;
        }
        try {
            setSaving(true);
            const payload = {
                CustomerName: form.CustomerName.trim(),
                StateName: form.StateName,
                StateCode: form.StateCode,
                LocatlityId: form.LocatlityId,
                ContactPerson: form.ContactPerson.trim(),
                MobileNo: form.MobileNo,
                SalespersonId: selectedUser,
                comid: comid,
            };
            const res = await dispatch(createCustomer(payload));

            if (res.type === "createCustomer/fulfilled" && res.payload[0].CustomerId) {
                Toast.show({
                    type: "customNotificationSuccess",
                    text1: "Customer created successfully",
                });
                setForm({
                    CustomerName: "",
                    Address: "",
                    StateName: userData?.StateName || "",
                    StateCode: userData?.StateCode || "",
                    LocatlityId: "",
                    ContactPerson: "",
                    MobileNo: "",
                    SalespersonId: userData?.Id || userData?.EmpId || "",
                })
            } else {
                const err = res.payload[0].Status
                Toast.show({
                    type: "customNotificationError",
                    text1: err || "Error creating Customer",
                });
                setForm({
                    CustomerName: "",
                    Address: "",
                    StateName: userData?.StateName || "",
                    StateCode: userData?.StateCode || "",
                    LocatlityId: "",
                    ContactPerson: "",
                    MobileNo: "",
                    SalespersonId: userData?.Id || userData?.EmpId || "",
                })
            }
        } catch (error) {
            Toast.show({
                type: "customNotificationError",
                text1: error?.response?.data?.message || "Unable to create customer",
            });
        } finally {
            setSaving(false);
        }
    };

    const selectedUserName = useMemo(() => {

        return (
            salesPersonList.find((u) => u?.Id === selectedUser)?.Name
        );
    }, [selectedUser, salesPersonList]);


    return (
        <View style={styles.container}>

            <CustomNavBar navName={"Create Customer"} subTitle={"Add a new customer"} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >

                    <Text style={styles.sectionTitle}>    Customer Information </Text>

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

                    <Text style={styles.sectionTitle}>    Location  </Text>

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
                        /> */}
                        {/* <InputField
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

                    <Text style={styles.sectionTitle}>  Contact Information  </Text>

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
                    {isAdmin && <>
                        <Text style={styles.sectionTitle}>Added by</Text>
                        <View style={styles.card}>

                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionLabel}>
                                    Sales Person
                                </Text>

                                {selectedUser !== "all" && (
                                    <Text
                                        style={
                                            styles.selectedFilterLabel
                                        }
                                    >
                                        {selectedUserName}
                                    </Text>
                                )}
                            </View>

                            {/*
                                Replaced FlatList with a plain ScrollView + map().
                                A FlatList (VirtualizedList) nested inside the outer
                                KeyboardAwareScrollView (also a vertical ScrollView)
                                triggers the "VirtualizedLists should never be nested
                                inside plain ScrollViews with the same orientation"
                                warning. This list is small and height-capped, so
                                virtualization isn't needed here.
                            */}
                            <View style={styles.dropdownBox}>
                                <ScrollView
                                    showsVerticalScrollIndicator={true}
                                    keyboardShouldPersistTaps="handled"
                                    nestedScrollEnabled={true}
                                >
                                    {salesPersonList.map((item) => {
                                        const active = String(selectedUser) === String(item.Id);

                                        return (
                                            <TouchableOpacity
                                                key={String(item.Id)}
                                                style={[
                                                    styles.userRow,
                                                    active && styles.userRowActive,
                                                ]}
                                                activeOpacity={0.7}
                                                onPress={() =>
                                                    setSelectedUser(String(item.Id))
                                                }
                                            >
                                                <View style={styles.userRowLeft}>
                                                    <View
                                                        style={[
                                                            styles.userAvatar,
                                                            active &&
                                                            styles.userAvatarActive,
                                                        ]}
                                                    >
                                                        <FontAwesome6
                                                            name={
                                                                item.Id === "all"
                                                                    ? "users"
                                                                    : "user"
                                                            }
                                                            size={11}
                                                            color={
                                                                active
                                                                    ? "#FFFFFF"
                                                                    : "#4A90E2"
                                                            }
                                                        />
                                                    </View>

                                                    <Text
                                                        style={[
                                                            styles.userRowText,
                                                            active &&
                                                            styles.userRowTextActive,
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {item.Name}
                                                    </Text>
                                                </View>

                                                {active && (
                                                    <FontAwesome6
                                                        name="circle-check"
                                                        size={15}
                                                        color="#4A90E2"
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    </>}

                    <View style={styles.bottomBtn}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.saveButton,
                                saving &&
                                styles.saveButtonDisabled,
                            ]}
                            onPress={handleCreate}
                            disabled={saving}
                        >

                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <FontAwesome6 name="user-plus" size={15} color="#FFFFFF" />
                                    <Text style={styles.saveButtonText} > Create Customer</Text>
                                </>
                            )}

                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            disabled={saving}
                        >

                            <Text style={styles.cancelButtonText} >   Cancel </Text>

                        </TouchableOpacity>
                    </View>
                    <View style={styles.bottomSpace} />

                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>

        </View>
    );
};

export default CreateCustomer;


// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
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
        fontFamily: "Merriweather_24pt_SemiCondensed-SemiBold",
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
        fontFamily: "Merriweather_24pt_SemiCondensed-SemiBold",
    },
    bottomSpace: {
        height: 20,
    },
    sectionHeaderRow: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",
    },

    sectionLabel: {
        fontSize: 9,
        color: "#64748B",
        marginTop: 8,
        marginBottom: 4,
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
        letterSpacing: 0.7,
        textTransform: "uppercase",
    },

    selectedFilterLabel: {
        fontSize: 8,

        color: "#4A90E2",

        marginTop: 14,
        marginBottom: 7,

        maxWidth: 150,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },
    // ====================================================
    // DROPDOWN BOX
    // ====================================================

    dropdownBox: {
        backgroundColor: "#F8FAFC",
        borderRadius: 13,
        borderWidth: 1,
        borderColor: "#EEF2F6",
        overflow: "hidden",
        height: 145,
    },


    // ====================================================
    // DROPDOWN ROWS
    // ====================================================

    userRow: {
        minHeight: 43,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#EDF1F5",
    },

    userRowActive: {
        backgroundColor: "#EAF3FF",
    },

    userRowLeft: {
        flexDirection: "row",

        alignItems: "center",

        flex: 1,
    },

    userAvatar: {
        width: 29,
        height: 29,

        borderRadius: 9,

        backgroundColor: "#EAF3FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 9,
    },

    userAvatarActive: {
        backgroundColor: "#4A90E2",
    },

    userRowText: {
        flex: 1,

        color: "#475569",

        fontSize: 9,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    userRowTextActive: {
        color: "#1D5FA7",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },


});
