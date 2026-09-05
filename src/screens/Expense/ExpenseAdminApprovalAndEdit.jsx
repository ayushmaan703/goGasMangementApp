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
import {
    editDailyExpense,
    getExpenseMaster,
    confirmDailyExpense,
    editconfirmDailyExpense,
} from "../../store/slice/Expence.slice";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";

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

const ExpenseAdminApprovalAndEdit = ({ navigation }) => {
    const route = useRoute();
    const dispatch = useDispatch();
    const amountRef = useRef(null);

    const { entry, isApproved } = route.params || {};
    const isApprovedEntry = Number(isApproved) === 1;

    const currUser = useSelector((state) => state.auth.userData);
    const paymentMethodList = useSelector((state) => state.dailyEntry.paymentMethodList);
    const expenseMasterList = useSelector((state) => state.expense.expenseMaster);
    const loading = useSelector((state) => state.expense.loading);
    const comid = currUser?.Comid;

    const [form, setForm] = useState({
        PayDate: getTodayDate(),
        ExpenceId: "",
        amount: "",
        paymode: "",
    });

    const [expenseDropdown, setExpenseDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [paymentDropdown, setPaymentDropdown] = useState(false);
    const [paymentType, setPaymentType] = useState("");
    const [submitAction, setSubmitAction] = useState(null); // "save" | "approve" | null

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
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
        if (!form.ExpenceId) {
            Toast.show({
                type: "customNotificationError",
                text1: "Please select an expense type",
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

        if (!form.paymode && Number(form.amount) > 0) {
            Toast.show({
                type: "customNotificationError",
                text1: "Please select a paymode",
                visibilityTime: 2000,
            });
            return false;
        }

        return true;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!comid) return;
            await dispatch(getPaymentMethod(comid));
            await dispatch(getExpenseMaster(comid));
        };
        fetchData();
    }, [comid]);

    useEffect(() => {
        if (!entry) {
            setForm({
                PayDate: getTodayDate(),
                ExpenceId: "",
                amount: "",
                paymode: "",
            });
            return;
        }

        const selectedPayment = paymentMethodList?.find(
            (payment) =>
                String(payment?.Name || "").trim().toLowerCase() ===
                String(entry?.PaymentMode || "").trim().toLowerCase()
        );

        const selectedExpenseType = expenseMasterList?.find(
            (expense) =>
                String(expense?.Name || "").trim().toLowerCase() ===
                String(entry?.Customer || "").trim().toLowerCase()
        );

        setForm({
            ExpenceId: selectedExpenseType?.Id || "",
            paymode: selectedPayment?.Id || "",
            amount: String(entry?.Amount ?? ""),
            PayDate: entry?.payDate ? formatFormDate(entry.payDate) : getTodayDate(),
        });

        setPaymentType(selectedPayment?.Name || entry?.PaymentMode || "");
    }, [entry, expenseMasterList, paymentMethodList]);

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
                EntryId: entry?.EntryID,
                PayDate: `${year}-${month}-${day}`,
                ExpenceId: form.ExpenceId || "",
                Amount: form.amount || "0",
                Comid: comid,
                Uid: currUser.EmpId,
                PayMode: form.paymode || "0",
                transid: entry?.transid,
            };

            let res;
            if (approveNow && isApproved == 0) {
                // If your store slice uses confirmDailyExpense, keep this action
                res = await dispatch(confirmDailyExpense ? confirmDailyExpense(payload) : editDailyExpense(payload)
                );
            } else if (isApproved == 1) {
                res = await dispatch(editconfirmDailyExpense ? editconfirmDailyExpense(payload) : editDailyExpense(payload)
                );
            } else {
                res = await dispatch(editDailyExpense(payload));
            }

            const isSuccess =
                res?.type?.includes("fulfilled") &&
                (res.payload?.[0]?.EntryId || res.payload?.[0]?.transId || res.payload?.[0]?.EntryID);

            if (isSuccess) {
                Toast.show({
                    type: "customNotificationSuccess",
                    text1: approveNow ? "Expense approved successfully" : "Expense updated successfully",
                    visibilityTime: 2000,
                });
                navigation.navigate("ExpenseEntryList");
            } else {
                const err = res?.payload?.[0]?.status || res?.payload?.[0]?.message || "Something went wrong";
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
                navName={isApprovedEntry ? "Edit Approved Expense" : "Edit and Approve Expense"}
                subtitle={
                    isApprovedEntry
                        ? "Update the approved expense entry"
                        : "Update and approve the pending expense entry"
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
                        {/* DATE */}
                        <View style={styles.halfField}>
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

                        {/* EXPENSE TYPE */}
                        <View style={styles.halfField}>
                            <Dropdown
                                icon="receipt"
                                label="Expense Type"
                                value={
                                    expenseMasterList?.find(
                                        (item) => String(item?.Id) === String(form.ExpenceId)
                                    )?.Name || ""
                                }
                                placeholder="Select expense type"
                                open={expenseDropdown}
                                setOpen={setExpenseDropdown}
                                data={expenseMasterList || []}
                                onSelect={(expense) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        ExpenceId: expense?.Id || "",
                                    }));
                                    setExpenseDropdown(false);
                                }}
                                displayKey="Name"
                            />
                        </View>

                        {/* PAY MODE */}
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

                        {/* AMOUNT */}
                        <View style={styles.halfField}>
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
                                <Text style={styles.addButtonText}>Update Expense</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* APPROVE BUTTON (Pending entries only) */}
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
                                    <Text style={styles.addButtonText}>Approve Expense</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
    );
};

export default ExpenseAdminApprovalAndEdit;

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
    halfField: {
        flex: 1,
        minWidth: 0,
        marginBottom: 8,
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