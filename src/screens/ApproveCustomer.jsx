import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import Icon from "react-native-vector-icons/FontAwesome6";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";

import InputField from "../helper/InputField";
import Dropdown from "../helper/Dropdown";
import CustomNavBar from "../helper/CustomNavBar";
import { GST_SLAB } from "../../Cosntants";
import { verifyCustomers } from "../store/slice/Admin.slice";
import { useRoute } from "@react-navigation/native";


const ApproveCustomer = ({ navigation }) => {

    const route = useRoute();
    const dispatch = useDispatch();
    const { accountId } = route.params || {};

    const currUser = useSelector(state => state.auth.userData);
    const loading = useSelector(state => state.admin.loading);

    const comid = currUser?.Comid;

    const [form, setForm] = useState({
        accountName: "",
        gstNo: "",
        gstSlab: "5",
        openingBal: "0",
    });
    const [accountDropdown, setAccountDropdown] = useState(false);
    const [gstDropdown, setGstDropdown] = useState(false);

    const updateField = (field, value) => {

        setForm(prev => ({
            ...prev,
            [field]: value,
        }));

    };

    const handleAccountSelect = account => {

        /*
         * Adjust these property names if your
         * Customer API uses different names.
         */

        const accountId =
            account?.AccountId ??
            account?.CustomerId ??
            account?.Id ??
            "";

        const accountName =
            account?.CustomerName ??
            account?.Customer ??
            account?.Name ??
            "";


        updateField(
            "accountId",
            String(accountId)
        );

        updateField(
            "accountName",
            accountName
        );


        setAccountDropdown(false);
    };

    const handleGSTSelect = gst => {

        const gstNo =
            gst?.GSTNo ??
            gst?.GstNo ??
            gst?.GSTIN ??
            gst?.Gstin ??
            gst?.value ??
            "";
        updateField(
            "gstSlab",
            String(gstNo)
        );


        setGstDropdown(false);
    };
    const gstOptions = GST_SLAB

    const validateForm = () => {



        if (!form.gstNo) {

            Toast.show({
                type: "customNotificationError",
                text1: "Please select GST number",
            });

            return false;
        }


        if (!form.gstSlab) {

            Toast.show({
                type: "customNotificationError",
                text1: "GST slab is required",
            });

            return false;
        }


        if (
            form.openingBal === "" ||
            form.openingBal === null
        ) {

            Toast.show({
                type: "customNotificationError",
                text1: "Opening balance is required",
            });

            return false;
        }


        return true;
    };

    const handleApprove = async () => {

        if (!validateForm()) {
            return;
        }

        const data = {
            AccountId: accountId,
            GSTNo: form.gstNo,
            GstSlab: form.gstSlab,
            OpeningBal: form.openingBal,
        };

        const res = await dispatch(verifyCustomers(data))
        if (res.type === "verifyCustomers/fulfilled" && res.payload[0].CustomerId) {
            Toast.show({
                type: "customNotificationSuccess",
                text1: "Account approved successfully",
            });
            setForm({
                accountName: "",
                gstNo: "",
                gstSlab: "5",
                openingBal: "0",

            })
            navigation.goBack()
        } else {
            Toast.show({
                type: "customNotificationError",
                text1: "Failed to approve account",
            });

        }





    };


    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (

        <KeyboardAvoidingView
            style={styles.container}
            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }
        >

            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >

                <CustomNavBar navName="Approve Customer" subtitle="Approve customer account details" />

                <View style={styles.content}>


                    {/* ACCOUNT DETAILS */}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}> Approval Details</Text>
                        {/* GST */}

                        <Dropdown
                            icon="file-invoice"
                            label="GST Slab"
                            value={form.gstSlab}
                            placeholder="Select GST Slab"
                            open={gstDropdown}
                            setOpen={setGstDropdown}
                            data={gstOptions}
                            onSelect={handleGSTSelect}
                            displayKey="GSTNo"
                        />

                        <InputField
                            icon="percent"
                            label="GST No."
                            value={form.gstNo}
                            onChangeText={value => updateField("gstNo", value)}
                            placeholder="Enter GST number"
                            keyboardType="numeric"
                        />


                        {/* OPENING BALANCE */}

                        <InputField
                            icon="indian-rupee-sign"
                            label="Opening Balance"
                            value={form.openingBal}
                            onChangeText={value => updateField("openingBal", value)}
                            placeholder="Enter opening balance"
                            keyboardType="decimal-pad"
                        />
                    </View>
                    {/* APPROVE BUTTON */}

                    <TouchableOpacity
                        style={[
                            styles.approveButton,
                            loading &&
                            styles.disabledButton,
                        ]}
                        onPress={handleApprove}
                        disabled={loading}
                        activeOpacity={0.8}
                    >

                        {loading ? (

                            <ActivityIndicator
                                color="#fff"
                            />

                        ) : (

                            <>

                                <Icon
                                    name="user-check"
                                    size={16}
                                    color="#fff"
                                />

                                <Text
                                    style={
                                        styles.approveButtonText
                                    }
                                >
                                    Approve Customer
                                </Text>

                            </>

                        )}

                    </TouchableOpacity>

                </View>

            </KeyboardAwareScrollView>

        </KeyboardAvoidingView >
    );
};


export default ApproveCustomer;


// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },


    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30,
    },


    content: {
        padding: 16,
    },


    section: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,

        elevation: 1,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 5,

        shadowOffset: {
            width: 0,
            height: 2,
        },
    },


    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#252B35",
        marginBottom: 16,
    },


    approveButton: {
        height: 54,
        borderRadius: 14,
        backgroundColor: "#28A745",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: 9,

        marginTop: 4,

        elevation: 3,

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 5,

        shadowOffset: {
            width: 0,
            height: 3,
        },
    },


    disabledButton: {
        opacity: 0.7,
    },


    approveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

});