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
import {
    adminApprovalDailySubmit,
    createDailyStockEntry,
    editDailyStockEntry,
    getDailyStockEntry,
    getPaymentMethod,
} from "../../store/slice/DailyStockEntry.slice";
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

const AdminApprovalAndEdit = ({ navigation }) => {

    const route = useRoute();
    const dispatch = useDispatch();
    const inRef = useRef(null);
    const outRef = useRef(null);
    const regulatorRef = useRef(null);
    const balEmptyRef = useRef(null);
    const amountRef = useRef(null);

    const { entry, isApproved } = route.params || {};
    console.log(entry);

    // ----------------------------------------------------------
    // APPROVAL STATE
    // This screen used to be driven by a hardcoded `isEdit` flag.
    // It's now driven by the entry's approval status instead:
    //   - approved   -> "Edit Approved Entry" heading, only the
    //                    Save/Update button is shown (no Approve).
    //   - not approved -> "Edit and Approve" heading, both the
    //                    Save/Update and Approve buttons are shown.
    // ----------------------------------------------------------
    const isApprovedEntry = Number(isApproved) === 1;

    const currUser = useSelector(state => state.auth.userData);
    const customerList = useSelector(state => state.customer.customerList);
    const paymentMethodList = useSelector(state => state.dailyEntry.paymentMethodList);
    const loading = useSelector(state => state.dailyPayment.loading);
    const comid = currUser?.Comid;

    const [form, setForm] = useState({
        customer: "",
        paymode: "",
        in: "",
        out: "",
        regulator: "",
        balEmpty: "",
        amount: "",
        date: getTodayDate(),
        customerId: "",
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customerDropdown, setCustomerDropdown] = useState(false);
    const [paymentDropdown, setPaymentDropdown] = useState(false);
    const [paymentType, setPaymentType] = useState("");

    // Tracks which action is in-flight so only the pressed button
    // shows a spinner instead of both at once.
    const [submitAction, setSubmitAction] = useState(null); // "save" | "approve" | null


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


        if (!form.in || Number(form.in) == 0 || Number(form.in) < 1) {

            Toast.show({
                type: "customNotificationError",
                text1: "In cannot be empty",
            });

            return false;
        }


        // if (!form.out) {

        //     Toast.show({
        //         type: "customNotificationError",
        //         text1: "Out cannot be empty",
        //     });

        //     return false;
        // }


        // if (!form.amount) {

        //     Toast.show({
        //         type: "customNotificationError",
        //         text1: "Amount cannot be empty",
        //     });

        //     return false;
        // }


        if (!form.balEmpty || Number(form.balEmpty) == 0 || Number(form.balEmpty) < 1) {

            Toast.show({
                type: "customNotificationError",
                text1: "Balance cannot be empty",
            });

            return false;
        }


        // if (!form.regulator) {

        //     Toast.show({
        //         type: "customNotificationError",
        //         text1: "Regulator cannot be empty",
        //     });

        //     return false;
        // }


        // if (!form.paymode && Number(form.amount) > 0) {

        //     Toast.show({
        //         type: "customNotificationError",
        //         text1: "Please select a paymode",
        //     });

        //     return false;
        // }


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

        if (!entry) {
            setForm({
                customer: "",
                paymode: "",
                in: "",
                out: "",
                regulator: "",
                balEmpty: "",
                amount: "",
                date: getTodayDate(),
                customerId: "",
            })
            return;
        }


        // ----------------------------------------------
        // CUSTOMER
        // ----------------------------------------------

        const selectedCustomer =
            customerList?.find(
                customer =>
                    String(
                        customer?.CustomerName || ""
                    )
                        .trim()
                        .toLowerCase() ===
                    String(
                        entry?.Customer || ""
                    )
                        .trim()
                        .toLowerCase()
            );


        // ----------------------------------------------
        // PAYMENT MODE
        // ----------------------------------------------

        const selectedPayment = paymentMethodList?.find(payment => String(payment?.Name || "")
            .trim()
            .toLowerCase() === String(entry?.PaymentMode || "").trim().toLowerCase()
        );

        setForm({
            customer: selectedCustomer?.CustomerName || entry?.Customer || "",
            customerId: selectedCustomer?.CustomerId || "",
            paymode: selectedPayment?.Id || "",
            in: String(entry?.CycIn ?? ""),
            out: String(entry?.CycOut ?? ""),
            regulator: String(entry?.Regulator ?? ""),
            balEmpty: String(entry?.BalCyc ?? ""),
            amount: String(entry?.Amount ?? ""),
            date: entry?.OrderDate ? formatFormDate(entry.OrderDate) : getTodayDate(),
        });


        setPaymentType(
            selectedPayment?.Name ||
            entry?.PaymentMode ||
            ""
        );

    }, [
        entry,
        customerList,
        paymentMethodList,
    ]);

    // ----------------------------------------------------------
    // SUBMIT
    // `approveNow` controls whether this submission also marks
    // the entry as approved.
    //   - Save/Update button  -> approveNow = false (approval
    //                             status is left as-is)
    //   - Approve button      -> approveNow = true
    //
    // NOTE: if your backend exposes a dedicated "approve" action
    // instead of an editable field on the entry, swap the
    // `IsApproved` field below (and the dispatch call) for that
    // action instead.
    // ----------------------------------------------------------
    const submitEntry = async (approveNow) => {

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

        setSubmitAction(approveNow ? "approve" : "save");

        try {
            const [day, month, year] = form.date.split("/");
            const payload = {
                PayDate: `${year}-${month}-${day}`,
                OrderDate: `${year}-${month}-${day}`,
                CustomerId: form.customerId,
                InQty: form.in,
                OutQty: form.out || "0",
                CycIn: form.in,
                CycOut: form.out || "0",
                BalCyc: form.balEmpty,
                Regulator: form.regulator || "0",
                PayMode: form.paymode || "0",
                Amount: form.amount || "0",
                Comid: comid,
                Uid: currUser.EmpId,
                EntryId: entry?.EntryID,
            };
            let res
            if (approveNow)
                res = await dispatch(adminApprovalDailySubmit(payload));
            else {
                if (!form.paymode && Number(form.amount) > 0) {

                    Toast.show({
                        type: "customNotificationError",
                        text1: "Please select a paymode",
                    });

                    return;
                }
                res = await dispatch(editDailyStockEntry(payload))
            }

            if (res.type === "adminApprovalDailySubmit/fulfilled" && res.payload?.[0]?.transId && approveNow) {
                Toast.show({
                    type: "customNotificationSuccess",
                    text1: "Entry approved successfully"
                });
                navigation.navigate("EntryList");
            }
            else if (res.type === "editDailyStockEntry/fulfilled" && res.payload?.[0]?.EntryId && !approveNow) {
                Toast.show({
                    type: "customNotificationSuccess",
                    text1: "Entry updated successfully",
                });
                navigation.navigate("EntryList");
            } else {
                Toast.show({
                    type: "customNotificationError",
                    text1: "Something went wrong",
                });
            }
        } finally {
            setSubmitAction(null);
        }

    };

    const handleSave = () => submitEntry(false);
    const handleApprove = () => submitEntry(true);

    return (
        <>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {/* HEADER */}
                <CustomNavBar
                    navName={
                        isApprovedEntry
                            ? "Edit Approved Entry"
                            : "Edit and Approve"
                    }
                    subtitle={
                        isApprovedEntry
                            ? "Update the approved stock entry"
                            : "Update and approve the pending stock entry"
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


                            </View>


                            {/* IN + OUT */}
                            <View style={styles.row}>

                                <View style={styles.halfField}>
                                    <InputField
                                        ref={inRef}
                                        icon="arrow-down"
                                        label="In"
                                        value={form.in}
                                        onChangeText={(value) =>
                                            updateField("in", value)
                                        }
                                        placeholder="Enter in quantity"
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                        onSubmitEditing={() => outRef.current?.focus()}
                                    />
                                </View>

                                <View style={styles.halfField}>
                                    <InputField
                                        ref={outRef}
                                        icon="arrow-up"
                                        label="Out"
                                        value={form.out}
                                        onChangeText={(value) =>
                                            updateField("out", value)
                                        }
                                        placeholder="Enter out quantity"
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                        onSubmitEditing={() => regulatorRef.current?.focus()}
                                    />
                                </View>
                            </View>

                            {/* REGULATOR + EMPTY BALANCE */}
                            <View style={styles.row}>

                                <View style={styles.halfField}>
                                    <InputField
                                        ref={regulatorRef}
                                        icon="gauge"
                                        label="Regulator"
                                        value={form.regulator}
                                        onChangeText={(value) =>
                                            updateField("regulator", value)
                                        }
                                        placeholder="Enter regulator"
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                        onSubmitEditing={() => balEmptyRef.current?.focus()}
                                    />
                                </View>

                                <View style={styles.halfField}>
                                    <InputField
                                        ref={balEmptyRef}
                                        icon="box-open"
                                        label="Empty Balance"
                                        value={form.balEmpty}
                                        onChangeText={(value) =>
                                            updateField("balEmpty", value)
                                        }
                                        placeholder="Enter empty balance"
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                        onSubmitEditing={() => amountRef.current?.focus()}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>

                                {/* AMOUNT */}
                                <View style={styles.halfField}>
                                    <InputField
                                        ref={amountRef}
                                        icon="indian-rupee-sign"
                                        label="Amount"
                                        value={form.amount}
                                        onChangeText={(value) =>
                                            updateField("amount", value)
                                        }
                                        placeholder="Enter amount"
                                        keyboardType="decimal-pad"
                                        returnKeyType="done"
                                    // onSubmitEditing={() => outRef.current?.focus()}
                                    />
                                </View>
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



                        {/* ================= SAVE / UPDATE ================= */}
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                loading && styles.disabledButton,
                            ]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading && submitAction === "save" ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Icon
                                        name="pen-to-square"
                                        size={16}
                                        color="#fff"
                                    />

                                    <Text style={styles.addButtonText}>
                                        Update Entry
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* ================= APPROVE ================= */}
                        {/* Only shown while the entry is not yet approved */}
                        {!isApprovedEntry && (
                            <TouchableOpacity
                                style={[
                                    styles.approveButton,
                                    loading && styles.disabledButton,
                                ]}
                                onPress={handleApprove}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading && submitAction === "approve" ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Icon
                                            name="circle-check"
                                            size={16}
                                            color="#fff"
                                        />

                                        <Text style={styles.addButtonText}>
                                            Approve Entry
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                    </ScrollView>
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
        </>
    );
};


export default AdminApprovalAndEdit;


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
    // SUBMIT BUTTONS
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
