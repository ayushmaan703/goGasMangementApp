import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
} from "react-native";

import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
    useNavigation,
    useRoute,
} from "@react-navigation/native";

import { useDispatch, useSelector } from "react-redux";

import CustomNavBar from "../../helper/CustomNavBar";

import {
    customerOrderEntry,
    editCustomerOrderEntry,
} from "../../store/slice/OrderingCustomer.slice";

import Toast from "react-native-toast-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


// =====================================================
// DATE
// =====================================================

const getTodayDate = () => {

    const today = new Date();

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
};


const dateToApiDate = (date) => {

    const months = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
    ];

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const month =
        months[date.getMonth()];

    const year =
        date.getFullYear();

    return `${day}-${month}-${year}`;
};


const dateToFormDate = (date) => {

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}/${month}/${year}`;
};


const parseDate = (value) => {

    if (!value) {
        return new Date();
    }

    if (value instanceof Date) {
        return value;
    }

    const stringValue =
        String(value);

    if (stringValue.includes(" ")) {

        const datePart =
            stringValue.split(" ")[0];

        const [
            month,
            day,
            year,
        ] = datePart
            .split("/")
            .map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    }

    if (stringValue.includes("/")) {

        const parts =
            stringValue
                .split("/")
                .map(Number);

        // dd/mm/yyyy
        if (parts[0] <= 31) {

            return new Date(
                parts[2],
                parts[1] - 1,
                parts[0]
            );
        }
    }

    return new Date();
};


// =====================================================
// SCREEN
// =====================================================

const CustomerOrderForm = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();

    const currUser = useSelector(
        state => state.auth.userData
    );

    const loading = useSelector(
        state => state.orderingCustomer.loading
    );

    const order =
        route?.params?.order || null;

    const isEdit =
        route?.params?.mode === "edit" &&
        !!order;


    const [orderDate, setOrderDate] =
        useState(
            isEdit
                ? parseDate(order?.OrderDate)
                : new Date()
        );

    const [quantity, setQuantity] = useState(isEdit ? String(order?.OrderQty || "") : "");

    const [showDatePicker, setShowDatePicker] =
        useState(false);


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async () => {

        if (!quantity.trim()) {

            Toast.show({
                type: "customNotificationError",
                text1: "Quantity Required",
                text2: "Please enter cylinder quantity.",
                visibilityTime: 2000
            });

            return;
        }


        const numericQuantity =
            Number(quantity);

        if (
            !Number.isInteger(
                numericQuantity
            ) ||
            numericQuantity <= 0
        ) {

            Toast.show({
                type: "customNotificationError",
                text1: "Invalid Quantity",
                text2: "Enter a valid cylinder quantity.",
                visibilityTime: 2000
            });

            return;
        }


        if (!currUser?.EmpId) {

            Toast.show({
                type: "customNotificationError",
                text1: "Customer information unavailable",
                visibilityTime: 2000
            });

            return;
        }


        const payload = {

            OrderDate:
                dateToApiDate(orderDate),

            CustomerId:
                currUser.EmpId,

            OrderCycQty:
                numericQuantity,

            Comid:
                currUser.Comid,

            Uid:
                currUser.EmpId,
        };


        let result;


        // =============================================
        // UPDATE
        // =============================================

        if (isEdit) {

            result = await dispatch(
                editCustomerOrderEntry({
                    ...payload,

                    EntryId:
                        order?.EntryID ??
                        order?.EntryId,
                })
            );

        }

        // =============================================
        // CREATE
        // =============================================

        else {

            result = await dispatch(
                customerOrderEntry(
                    payload
                )
            );

        }


        if (
            result.type === (isEdit ? "editCustomerOrderEntry/fulfilled" : "customerOrderEntry/fulfilled")
        ) {

            Toast.show({
                type: "customNotificationSuccess",

                text1:
                    isEdit
                        ? "Order Updated"
                        : "Order Placed",

                text2:
                    isEdit
                        ? "Your order was updated successfully."
                        : "Your cylinder order was placed successfully.",
            });

            navigation.goBack();

        } else {

            Toast.show({
                type: "customNotificationError",
                text1: "Something went wrong",
                text2: "Unable to save your order.",
            });

        }
    };


    return (

        <SafeAreaView style={styles.container}>

            <CustomNavBar
                navName={
                    isEdit
                        ? "Edit Order"
                        : "Place Order"
                }
                subtitle={
                    isEdit
                        ? "Update your cylinder order"
                        : "Place a new cylinder order"
                }
            />


            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : undefined
                }
            >

                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.content}
                    enableOnAndroid={true}
                >

                    {/* INTRO */}

                    <View style={styles.introCard}>

                        <View style={styles.introIcon}>

                            <MaterialIcons
                                name="propane-tank"
                                size={23}
                                color="#5B21B6"
                            />

                        </View>

                        <View style={styles.introText}>

                            <Text style={styles.introTitle}>
                                Cylinder Order
                            </Text>

                            <Text style={styles.introSubtitle}>
                                Enter the details below to place
                                your cylinder order.
                            </Text>

                        </View>

                    </View>


                    {/* CUSTOMER */}

                    <View style={styles.section}>

                        <Text style={styles.sectionTitle}>
                            Customer
                        </Text>

                        <View style={styles.customerCard}>

                            <View style={styles.customerIcon}>

                                <FontAwesome6
                                    name="user"
                                    size={16}
                                    color="#5B21B6"
                                />

                            </View>

                            <View style={{ flex: 1 }}>

                                <Text style={styles.customerLabel}>
                                    Logged in as
                                </Text>

                                <Text style={styles.customerValue}>
                                    {currUser?.Emp || "Customer"}
                                </Text>

                            </View>

                            <FontAwesome6
                                name="circle-check"
                                size={17}
                                color="#16A34A"
                            />

                        </View>

                    </View>


                    {/* ORDER DATE */}

                    <View style={styles.section}>

                        <Text style={styles.sectionTitle}>
                            Order Details
                        </Text>


                        <Text style={styles.inputLabel}>
                            Order Date
                        </Text>


                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.dateInput}
                            onPress={() =>
                                setShowDatePicker(true)
                            }
                        >

                            <View style={styles.inputIcon}>

                                <FontAwesome6
                                    name="calendar-days"
                                    size={15}
                                    color="#5B21B6"
                                />

                            </View>

                            <Text style={styles.dateText}>
                                {dateToFormDate(
                                    orderDate
                                )}
                            </Text>

                            <FontAwesome6
                                name="chevron-down"
                                size={11}
                                color="#9AA3AF"
                            />

                        </TouchableOpacity>


                        {showDatePicker && (

                            <DateTimePicker
                                value={orderDate}
                                mode="date"
                                display={
                                    Platform.OS === "ios"
                                        ? "spinner"
                                        : "default"
                                }
                                minimumDate={
                                    new Date()
                                }
                                onChange={(
                                    event,
                                    selectedDate
                                ) => {

                                    setShowDatePicker(
                                        false
                                    );

                                    if (
                                        selectedDate
                                    ) {

                                        setOrderDate(
                                            selectedDate
                                        );

                                    }

                                }}
                            />

                        )}


                        {/* QUANTITY */}

                        <Text
                            style={[
                                styles.inputLabel,
                                {
                                    marginTop: 18,
                                },
                            ]}
                        >
                            Cylinder Quantity
                        </Text>


                        <View style={styles.quantityInput}>

                            <View style={styles.quantityIcon}>

                                <FontAwesome6
                                    name="gas-pump"
                                    size={15}
                                    color="#5B21B6"
                                />

                            </View>


                            <TextInput
                                value={quantity}
                                onChangeText={text => {

                                    const clean =
                                        text.replace(
                                            /[^0-9]/g,
                                            ""
                                        );

                                    setQuantity(
                                        clean
                                    );

                                }}
                                placeholder="Enter quantity"
                                placeholderTextColor="#9AA3AF"
                                keyboardType="number-pad"
                                style={styles.textInput}
                                maxLength={3}
                            />


                            <Text style={styles.unitText}>
                                Cylinders
                            </Text>

                        </View>


                        <Text style={styles.helperText}>
                            Enter the number of cylinders you
                            want to order.
                        </Text>

                    </View>


                    {/* SUBMIT */}

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[
                            styles.submitButton,
                            loading &&
                            styles.disabledButton,
                        ]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >

                        {loading ? (

                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />

                        ) : (

                            <>

                                <FontAwesome6
                                    name={
                                        isEdit
                                            ? "floppy-disk"
                                            : "paper-plane"
                                    }
                                    size={15}
                                    color="#FFFFFF"
                                />

                                <Text style={styles.submitText}>
                                    {isEdit
                                        ? "Update Order"
                                        : "Place Order"}
                                </Text>

                            </>

                        )}

                    </TouchableOpacity>


                    <Text style={styles.bottomNote}>
                        Please check your quantity before
                        submitting the order.
                    </Text>

                </KeyboardAwareScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};


export default CustomerOrderForm;


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },

    content: {
        padding: 16,
        paddingBottom: 80,
    },

    introCard: {
        backgroundColor: "#F3EEFF",
        borderRadius: 16,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#8B5CF6",
    },

    introIcon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    introText: {
        flex: 1,
        marginLeft: 12,
    },

    introTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#253142",
    },

    introSubtitle: {
        marginTop: 4,
        fontSize: 11,
        color: "#7A8493",
        lineHeight: 16,
    },

    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginTop: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#253142",
        marginBottom: 14,
    },

    customerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
    },

    customerIcon: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: "#F3EEFF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },

    customerLabel: {
        fontSize: 10,
        color: "#8A94A3",
    },

    customerValue: {
        marginTop: 2,
        fontSize: 14,
        fontWeight: "700",
        color: "#354052",
    },

    inputLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#596474",
        marginBottom: 7,
    },

    dateInput: {
        height: 50,
        borderWidth: 1,
        borderColor: "#E1E7EE",
        borderRadius: 11,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
    },

    inputIcon: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: "#F3EEFF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },

    dateText: {
        flex: 1,
        fontSize: 13,
        color: "#354052",
        fontWeight: "600",
    },

    quantityInput: {
        height: 52,
        borderWidth: 1,
        borderColor: "#E1E7EE",
        borderRadius: 11,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },

    quantityIcon: {
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: "#F3EEFF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 7,
    },

    textInput: {
        flex: 1,
        fontSize: 14,
        color: "#253142",
        paddingVertical: 0,
    },

    unitText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#8A94A3",
    },

    helperText: {
        marginTop: 7,
        fontSize: 10,
        color: "#9AA3AF",
    },

    submitButton: {
        height: 52,
        borderRadius: 13,
        backgroundColor: "#5B21B6",
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        elevation: 2,
    },

    disabledButton: {
        opacity: 0.65,
    },

    submitText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },

    bottomNote: {
        textAlign: "center",
        marginTop: 10,
        fontSize: 10,
        color: "#9AA3AF",
    },

});