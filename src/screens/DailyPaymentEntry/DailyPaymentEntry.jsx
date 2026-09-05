import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import InputField from "../../helper/InputField";
import Dropdown from "../../helper/Dropdown";
import CustomNavBar from "../../helper/CustomNavBar";
import { useDispatch, useSelector } from "react-redux";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";
import { createDailyPayment, editDailyPayment } from "../../store/slice/DailyPayment.slice";
import { getPaymentMethod } from "../../store/slice/DailyStockEntry.slice";

const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
};

const getDateObject = (dateString) => {
    if (!dateString) {
        return new Date();
    }

    // Already a Date object
    if (dateString instanceof Date) {
        return dateString;
    }

    const value = String(dateString).trim();

    // ---------------------------------------------
    // DB / API FORMAT
    // 8/28/2026 12:00:00 AM
    // ---------------------------------------------
    if (value.includes(" ")) {
        const datePart = value.split(" ")[0];

        const [month, day, year] =
            datePart.split("/").map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    }

    if (value.includes("/")) {
        const [day, month, year] =
            value.split("/").map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    }

    return new Date();
};

const formatFormDate = (dateString) => {
    const date = getDateObject(dateString);

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const DailyPaymentEntry = ({ navigation }) => {

    const route = useRoute();
    const dispatch = useDispatch();
    const { entry, isEdit } = route.params || {};

    const currUser = useSelector(state => state.auth.userData);
    const customerList = useSelector(state => state.customer.customerList);
    const paymentMethodList = useSelector(state => state.dailyEntry.paymentMethodList);
    const loading = useSelector(state => state.dailyPayment.loading);
    const comid = currUser?.Comid;

    const [form, setForm] = useState({
        customer: "",
        paymode: "",
        amount: "",
        date: getTodayDate(),
        customerId: "",
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customerDropdown, setCustomerDropdown] = useState(false);
    const [paymentDropdown, setPaymentDropdown] = useState(false);
    const [paymentType, setPaymentType] = useState("");


    const updateField = (field, value) => {

        setForm(prev => ({
            ...prev,
            [field]: value,
        }));

    };

    const handleCusotmerSelect = customer => {

        setForm(prev => ({
            ...prev,
            customerId: customer?.CustomerId || "",
            customer: customer?.CustomerName || "",
        }));

        setCustomerDropdown(false);
    };

    const handlePaymentSelect = payment => {

        setForm(prev => ({
            ...prev,
            paymode: payment?.Id || "",
        }));
        setPaymentType(payment?.Name || "");
        setPaymentDropdown(false);
    };

    const validateForm = () => {

        if (!form.customer.trim()) {

            Toast.show({
                type: "customNotificationError",
                text1: "Customer is required",
            });

            return false;
        }

        if (!form.amount) {

            Toast.show({
                type: "customNotificationError",
                text1: "Amount cannot be empty",
            });

            return false;
        }

        if (!form.paymode) {

            Toast.show({
                type: "customNotificationError",
                text1: "Please select a paymode",
            });

            return false;
        }


        return true;
    };

    useEffect(() => {

        const fetchPaymentMethods = async () => {
            if (!comid) {
                return;
            }
            await dispatch(getPaymentMethod(comid));
        };
        fetchPaymentMethods();

    }, [comid]);

    useEffect(() => {

        if (!isEdit || !entry) {
            setForm({
                customer: "",
                paymode: "",
                amount: "",
                date: getTodayDate(),
                customerId: "",
            })
            return;
        }

        const selectedCustomer =
            customerList?.find(
                customer =>
                    String(customer?.CustomerName || "")
                        .trim()
                        .toLowerCase() ===
                    String(entry?.Customer || "")
                        .trim()
                        .toLowerCase()
            );

        const selectedPayment =
            paymentMethodList?.find(
                payment =>
                    String(payment?.Name || "")
                        .trim()
                        .toLowerCase() ===
                    String(entry?.PaymentMode || "")
                        .trim()
                        .toLowerCase()
            );


        setForm({
            customer: selectedCustomer?.CustomerName || entry?.Customer || "",
            customerId: selectedCustomer?.CustomerId || "",
            paymode: selectedPayment?.Id || "",
            amount: String(entry?.Amount ?? ""),
            date: entry?.OrderDate ? formatFormDate(entry.OrderDate) : getTodayDate(),
        });

        setPaymentType(selectedPayment?.Name || entry?.PaymentMode || "");
    }, [
        isEdit,
        entry,
        customerList,
        paymentMethodList,
    ]);


    const handleAdd = async () => {

        if (!validateForm()) {
            return;
        }


        if (!comid || !currUser?.EmpId) {
            Toast.show({
                type: "customNotificationError",
                text1: "User information is missing",
            });
            return;
        }
        const [day, month, year] = form.date.split("/");

        const payload = {
            PayDate: `${year}-${month}-${day}`,
            CustomerId: form.customerId,
            PayMode: form.paymode,
            Amount: form.amount,
            Comid: comid,
            Uid: currUser.EmpId,
            EntryId: entry?.EntryID,
        };


        //  EDIT MODE

        if (isEdit) {
            const res = await dispatch(editDailyPayment(payload))

            if (res.type === "editDailyPayment/fulfilled" && res.payload?.[0]?.EntryId) {
                Toast.show({
                    type: "customNotificationSuccess",
                    text1: "Entry updated Successfully",
                });

                setForm({
                    customer: "",
                    paymode: "",
                    amount: "",
                    date: getTodayDate(),
                    customerId: "",
                });
                setPaymentType("");
                currUser.UserType == "Admin" && navigation.navigate("PaymentEntryList")
            } else {
                Toast.show({
                    type: "customNotificationError",
                    text1: "Something went wrong",
                });

            }

            return;
        }

        // CREATE
        const res = await dispatch(createDailyPayment(payload));
        if (res.type === "createDailyPayment/fulfilled" && res.payload?.[0]?.EntryId) {
            Toast.show({
                type: "customNotificationSuccess",
                text1: "Entry created successfully",
            });
            setForm({
                customer: "",
                paymode: "",
                amount: "",
                date: getTodayDate(),
                customerId: "",
            });
            currUser.UserType == "Admin" && navigation.navigate("PaymentEntryList")
            setPaymentType("");
        } else {
            Toast.show({
                type: "customNotificationError",
                text1: "Something went wrong",
            });

        }
    };

    return (
        <>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {/* HEADER */}
                <CustomNavBar
                    navName={
                        isEdit
                            ? "Edit Daily Payment Entry"
                            : "Daily Payment Entry"
                    }
                    subtitle={
                        isEdit
                            ? "Update the pending payment entries"
                            : "Daily payment entry"
                    }
                />
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >


                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >

                        {/* ================= CUSTOMER ================= */}
                        <View style={styles.section}>
                            {/* <View style={styles.sectionHeader}>
                                <View style={styles.sectionIcon}>
                                    <Icon
                                        name="user-group"
                                        size={14}
                                        color="#4A90E2"
                                    />
                                </View>

                                <View>
                                    <Text style={styles.sectionTitle}>
                                        Customer Details
                                    </Text>
                                    <Text style={styles.sectionSubtitle}>
                                        Select customer and payment method
                                    </Text>
                                </View>
                            </View> */}

                            {/* CUSTOMER */}
                            <View style={styles.halfField}>
                                <Dropdown
                                    icon="user"
                                    label="Customer"
                                    value={form.customer}
                                    placeholder="Select customer"
                                    open={customerDropdown}
                                    setOpen={setCustomerDropdown}
                                    data={customerList}
                                    onSelect={handleCusotmerSelect}
                                    displayKey="CustomerName"
                                />
                            </View>
                            <View style={styles.row}>


                                {/* PAYMENT */}
                                <View style={styles.halfField}>
                                    <Dropdown
                                        icon="wallet"
                                        label="Pay Mode"
                                        value={paymentType}
                                        placeholder="Select payment mode"
                                        open={paymentDropdown}
                                        setOpen={setPaymentDropdown}
                                        data={paymentMethodList}
                                        onSelect={handlePaymentSelect}
                                        displayKey="Name"
                                    />
                                </View>
                            </View>
                            <View style={styles.row}>

                                {/* DATE */}
                                <View style={styles.halfField}>
                                    <View style={styles.dateContainer}>
                                        <Text style={styles.inputLabel}>
                                            Date
                                        </Text>

                                        <TouchableOpacity
                                            style={styles.dateField}
                                            onPress={() => setShowDatePicker(true)}
                                            activeOpacity={0.8}
                                        >
                                            <Icon
                                                name="calendar"
                                                size={15}
                                                color="#777"
                                            />

                                            <Text
                                                style={[
                                                    styles.dateValue,
                                                    !form.date && styles.placeholder,
                                                ]}
                                            >
                                                {form.date || "Select date"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* AMOUNT */}
                                <View style={styles.halfField}>
                                    <InputField
                                        icon="indian-rupee-sign"
                                        label="Amount"
                                        value={form.amount}
                                        onChangeText={(value) =>
                                            updateField("amount", value)
                                        }
                                        placeholder="Enter amount"
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>


                            {/* DATE PICKER */}
                            {showDatePicker && (
                                <DateTimePicker
                                    value={getDateObject(form.date)}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);

                                        if (selectedDate) {
                                            const day = String(
                                                selectedDate.getDate()
                                            ).padStart(2, "0");

                                            const month = String(
                                                selectedDate.getMonth() + 1
                                            ).padStart(2, "0");

                                            const year =
                                                selectedDate.getFullYear();

                                            updateField(
                                                "date",
                                                `${day}/${month}/${year}`
                                            );
                                        }
                                    }}
                                />
                            )}
                        </View>


                        {/* ================= TRANSACTION ================= */}
                        {/* <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIcon}>
                                    <Icon
                                        name="arrow-right-arrow-left"
                                        size={14}
                                        color="#4A90E2"
                                    />
                                </View>

                                <View>
                                    <Text style={styles.sectionTitle}>
                                        Transaction Details
                                    </Text>
                                    <Text style={styles.sectionSubtitle}>
                                        Enter payment details
                                    </Text>
                                </View>
                            </View>


                     

                        </View> */}


                        {/* ================= SUBMIT ================= */}
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                loading && styles.disabledButton,
                            ]}
                            onPress={handleAdd}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Icon
                                        name={
                                            isEdit
                                                ? "pen-to-square"
                                                : "plus"
                                        }
                                        size={16}
                                        color="#fff"
                                    />

                                    <Text style={styles.addButtonText}>
                                        {isEdit
                                            ? "Update Transaction"
                                            : "Add Transaction"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                    </ScrollView>
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
        </>
    );
};


export default DailyPaymentEntry;


// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({

    // =========================
    // MAIN
    // =========================

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },

    scrollContainer: {
        flexGrow: 1,
        marginBottom: 30,
    },

    content: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 30,
    },


    // =========================
    // SECTION CARD
    // =========================

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

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },

    sectionIcon: {
        width: 30,
        height: 30,
        borderRadius: 8,

        backgroundColor: "#EAF3FF",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 10,
    },

    sectionTitle: {
        color: "#252B35",
        fontSize: 16,
        fontWeight: "700",
    },

    sectionSubtitle: {
        color: "#7A8493",
        fontSize: 11,
        marginTop: 2,
    },


    // =========================
    // TWO COLUMN GRID
    // =========================

    row: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
        marginBottom: 0,
    },
    halfField: {
        flex: 1,
        minWidth: 0,
    },


    // =========================
    // DATE
    // =========================


    inputLabel: {
        fontSize: 8,
        color: "#64748B",
        marginBottom: 4,
        marginLeft: 2,
        fontFamily: "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    dateField: {
        height: 58,
        gap: 10,
        minHeight: 51,
        borderRadius: 14,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E6EBF2",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 9,
    },

    dateValue: {
        flex: 1,
        fontSize: 15,
        color: "#222",
    },

    placeholder: {
        color: "#999",
    },


    // =========================
    // SUBMIT BUTTON
    // =========================

    addButton: {
        height: 54,

        borderRadius: 14,

        backgroundColor: "#4A90E2",

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

    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    disabledButton: {
        opacity: 0.7,
    },
});