import React, { useEffect, useRef, useState } from "react";
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
import { getPaymentMethod } from "../../store/slice/DailyStockEntry.slice";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";
import {
    adminApprovalPaymentSubmit,
    editAdminApprovalPaymentSubmit,
    editDailyPayment,
} from "../../store/slice/DailyPayment.slice";

const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
};
  
const getDateObject = (dateString) => {
    if (!dateString) return new Date();
    if (dateString instanceof Date) return dateString;

    const value = String(dateString).trim();

    if (value.includes(" ")) {
        const datePart = value.split(" ")[0];
        const [month, day, year] = datePart.split("/").map(Number);
        return new Date(year, month - 1, day);
    }

    if (value.includes("/")) {
        const [day, month, year] = value.split("/").map(Number);
        return new Date(year, month - 1, day);
    }

    return new Date();
};

const formatFormDate = (dateString) => {
    const date = getDateObject(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const AdminApprovalAndEditPayment = ({ navigation }) => {
    const route = useRoute();
    const dispatch = useDispatch();
    const amountRef = useRef(null);

    const { entry, isApproved } = route.params || {};
    const isApprovedEntry = Number(isApproved) === 1;

    const currUser = useSelector((state) => state.auth.userData);
    const customerList = useSelector((state) => state.customer.customerList);
    const paymentMethodList = useSelector((state) => state.dailyEntry.paymentMethodList);
    const loading = useSelector((state) => state.dailyPayment.loading);
    const comid = currUser?.Comid;

    const [form, setForm] = useState({
        customer: "",
        customerId: "",
        paymode: "",
        amount: "",
        PayDate: getTodayDate(),
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customerDropdown, setCustomerDropdown] = useState(false);
    const [paymentDropdown, setPaymentDropdown] = useState(false);
    const [paymentType, setPaymentType] = useState("");
    const [submitAction, setSubmitAction] = useState(null); // "save" | "approve" | null

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCustomerSelect = (customer) => {
        setForm((prev) => ({
            ...prev,
            customerId: customer?.CustomerId || "",
            customer: customer?.CustomerName || "",
        }));
        setCustomerDropdown(false);
    };

    const handlePaymentSelect = (payment) => {
        setForm((prev) => ({
            ...prev,
            paymode: payment?.Id || "",
        }));
        setPaymentType(payment?.Name || "");
        setPaymentDropdown(false);
    };

    const validateForm = () => {
        if (!form.customer.trim() && !form.customerId) {
            Toast.show({
                type: "customNotificationError",
                text1: "Please select a customer",
                visibilityTime: 2000,
            });
            return false;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            Toast.show({
                type: "customNotificationError",
                text1: "Please enter a valid amount",
                visibilityTime: 2000,
            });
            return false;
        }

        if (!form.paymode) {
            Toast.show({
                type: "customNotificationError",
                text1: "Please select a payment mode",
                visibilityTime: 2000,
            });
            return false;
        }

        return true;
    };

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            if (!comid) return;
            await dispatch(getPaymentMethod(comid));
        };
        fetchPaymentMethods();
    }, [comid]);

    useEffect(() => {
        if (!entry) {
            setForm({
                customer: "",
                customerId: "",
                paymode: "",
                amount: "",
                PayDate: getTodayDate(),
            });
            return;
        }

        const selectedCustomer = customerList?.find(
            (customer) =>
                String(customer?.CustomerName || "").trim().toLowerCase() ===
                String(entry?.Customer || "").trim().toLowerCase()
        );

        const selectedPayment = paymentMethodList?.find(
            (payment) =>
                String(payment?.Name || "").trim().toLowerCase() ===
                String(entry?.PaymentMode || "").trim().toLowerCase()
        );

        setForm({
            customer: selectedCustomer?.CustomerName || entry?.Customer || "",
            customerId: selectedCustomer?.CustomerId || entry?.CustomerId || "",
            paymode: selectedPayment?.Id || "",
            amount: String(entry?.Amount ?? ""),
            PayDate: entry?.payDate ? formatFormDate(entry.payDate) : getTodayDate(),
        });

        setPaymentType(selectedPayment?.Name || entry?.PaymentMode || "");
    }, [entry, customerList, paymentMethodList]);

    const submitEntry = async (approveNow) => {
        if (!validateForm()) return;

        if (!comid || !currUser?.EmpId) {
            Toast.show({
                type: "customNotificationError",
                text1: "User information is missing",
                visibilityTime: 2000,
            });
            return;
        }

        setSubmitAction(approveNow ? "approve" : "save");

        try {
            const [day, month, year] = form.PayDate.split("/");
            const payload = {
                PayDate: `${year}-${month}-${day}`,
                CustomerId: form.customerId,
                PayMode: form.paymode,
                Amount: form.amount,
                Comid: comid,
                Uid: currUser.EmpId,
                EntryId: entry?.EntryID,
                transid: entry?.transid,
            };

            let res;
            if (approveNow && isApproved == 0) {
                res = await dispatch(adminApprovalPaymentSubmit(payload));
            } else if (isApproved == 1) {
                res = await dispatch(editAdminApprovalPaymentSubmit(payload));
            } else {
                res = await dispatch(editDailyPayment(payload));
            }

            if (res.type === "adminApprovalPaymentSubmit/fulfilled" && res.payload?.[0]?.transId && approveNow) {
                Toast.show({
                    type: "customNotificationSuccess",
                    text1: "Payment approved successfully",
                    visibilityTime: 2000,
                });
                navigation.navigate("PaymentEntryList");
            } else if (
                (res.type === "editDailyPayment/fulfilled" || res.type === "editAdminApprovalPaymentSubmit/fulfilled") &&
                !approveNow
            ) {
                Toast.show({
                    type: "customNotificationSuccess",
                    text1: "Payment entry updated successfully",
                    visibilityTime: 2000,
                });
                navigation.navigate("PaymentEntryList");
            } else {
                const err = res.payload?.[0]?.status || res.payload?.[0]?.message || "Something went wrong";
                Toast.show({
                    type: "customNotificationError",
                    text1: err,
                    visibilityTime: 2000,
                });
            }
        } finally {
            setSubmitAction(null);
        }
    };

    const handleSave = () => submitEntry(false);
    const handleApprove = () => submitEntry(true);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <CustomNavBar
                navName={
                    isApprovedEntry
                        ? "Edit Approved Payment Entry"
                        : "Edit and Approve Payment"
                }
                subtitle={
                    isApprovedEntry
                        ? "Update the approved payment entry"
                        : "Update and approve the pending payment entry"
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
                    <View style={styles.section}>
                        {/* CUSTOMER */}
                        <View style={styles.fieldContainer}>
                            <Dropdown
                                icon="user"
                                label="Customer"
                                value={form.customer}
                                placeholder="Select customer"
                                open={customerDropdown}
                                setOpen={setCustomerDropdown}
                                data={customerList}
                                onSelect={handleCustomerSelect}
                                displayKey="CustomerName"
                            />
                        </View>

                        {/* DATE */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.inputLabel}>Date</Text>
                            <TouchableOpacity
                                style={styles.dateField}
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.8}
                            >
                                <Icon name="calendar" size={15} color="#777" />
                                <Text style={[styles.dateValue, !form.PayDate && styles.placeholder]}>
                                    {form.PayDate || "Select date"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* PAY MODE */}
                        <View style={styles.fieldContainer}>
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

                        {/* AMOUNT */}
                        <View style={styles.fieldContainer}>
                            <InputField
                                ref={amountRef}
                                icon="indian-rupee-sign"
                                label="Amount"
                                value={form.amount}
                                onChangeText={(value) => updateField("amount", value)}
                                placeholder="Enter amount"
                                keyboardType="decimal-pad"
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    {/* DATE PICKER */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={getDateObject(form.PayDate)}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    const day = String(selectedDate.getDate()).padStart(2, "0");
                                    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                                    const year = selectedDate.getFullYear();
                                    updateField("PayDate", `${day}/${month}/${year}`);
                                }
                            }}
                        />
                    )}

                    {/* SAVE / UPDATE */}
                    <TouchableOpacity
                        style={[styles.addButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading && submitAction === "save" ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Icon name="pen-to-square" size={16} color="#fff" />
                                <Text style={styles.addButtonText}>Update Entry</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* APPROVE (Pending Only) */}
                    {!isApprovedEntry && (
                        <TouchableOpacity
                            style={[styles.approveButton, loading && styles.disabledButton]}
                            onPress={handleApprove}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading && submitAction === "approve" ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Icon name="circle-check" size={16} color="#fff" />
                                    <Text style={styles.addButtonText}>Approve Entry</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
    );
};

export default AdminApprovalAndEditPayment;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
        paddingBottom: 40,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 30,
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
    fieldContainer: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 8,
        color: "#64748B",
        marginBottom: 4,
        marginLeft: 2,
        fontFamily: "Merriweather_24pt_SemiCondensed-SemiBold",
    },
    dateField: {
        height: 51,
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
    approveButton: {
        height: 54,
        borderRadius: 14,
        backgroundColor: "#22A06B",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        marginTop: 12,
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