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
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import InputField from "../../helper/InputField";
import CustomNavBar from "../../helper/CustomNavBar";
import { submitDailyStockEntry } from "../../store/slice/DailyStockEntry.slice";
import { submitDailyPayment } from "../../store/slice/DailyPayment.slice";


// DATE HELPERS
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

    const [day, month, year] =
        dateString.split("/").map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
};
const formatApiDate = (dateString) => {
    const date = getDateObject(dateString);

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

const PaymentSubmitForm = ({ navigation }) => {

    const dispatch = useDispatch()

    const currUser = useSelector(state => state.auth.userData);
    const comid = currUser?.Comid;

    const [form, setForm] = useState({
        payDate: getTodayDate(),
        TotalAmount: "",
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const loading = useSelector(state => state.dailyPayment.loading) || false;

    const updateField = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));

    };

    const validateForm = () => {

        if (!form.payDate) {

            Toast.show({
                type: "customNotificationError",
                text1: "Pay date is required",
            });
            return false;
        }


        if (!form.TotalAmount) {
            Toast.show({
                type: "customNotificationError",
                text1: "Balance cycle is required",
            });

            return false;
        }

        return true;
    };

    const handleSubmit = async () => {

        if (!validateForm()) {
            return;
        }

        if (!comid) {
            Toast.show({
                type: "customNotificationError",
                text1: "Company information is missing",
            });
            return;
        }


        const data = {
            PayDate: formatApiDate(form.payDate),
            TotalAmount: form.TotalAmount,
            Comid: comid,
        };

        const res = await dispatch(submitDailyPayment(data))
        if (res.type === "submitDailyPayment/fulfilled" && res.payload[0].Status == "Sucess") {
            Toast.show({
                type: "customNotificationSuccess",
                text1: "Entries submitted successfully",
            });
            setForm({
                payDate: getTodayDate(),
                balanceCyc: "",
                balanceEmpty: "",
                totalCash: "",
            })
        } else {
            Toast.show({
                type: "customNotificationError",
                text1: "Failed to submit entries",
            });
        }
    };

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
                contentContainerStyle={
                    styles.scrollContainer
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >

                <CustomNavBar
                    navName="Submit Daily Entries"
                    subtitle="Submit your pending daily payment entries"
                />


                <View style={styles.content}>


                    {/* PAY DATE */}

                    <View style={styles.section}>

                        <Text style={styles.sectionTitle}>
                            Submission Details
                        </Text>


                        <TouchableOpacity
                            style={styles.dateField}
                            onPress={() =>
                                setShowDatePicker(true)
                            }
                        >

                            <Icon
                                name="calendar-days"
                                size={17}
                                color="#777"
                            />


                            <View style={{ flex: 1 }}>

                                <Text
                                    style={
                                        styles.dateLabel
                                    }
                                >
                                    Pay Date
                                </Text>


                                <Text
                                    style={
                                        styles.dateValue
                                    }
                                >
                                    {form.payDate}
                                </Text>

                            </View>


                            <Icon
                                name="chevron-down"
                                size={13}
                                color="#999"
                            />

                        </TouchableOpacity>


                        {showDatePicker && (

                            <DateTimePicker
                                value={
                                    getDateObject(
                                        form.payDate
                                    )
                                }

                                mode="date"

                                display="default"

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

                                        const day =
                                            String(
                                                selectedDate.getDate()
                                            ).padStart(
                                                2,
                                                "0"
                                            );

                                        const month =
                                            String(
                                                selectedDate.getMonth() + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            );

                                        const year =
                                            selectedDate.getFullYear();


                                        updateField(
                                            "payDate",
                                            `${day}/${month}/${year}`
                                        );

                                    }

                                }}
                            />

                        )}

                        <InputField
                            icon="rotate"
                            label="Total Amount"
                            value={form.TotalAmount}
                            onChangeText={value => updateField("TotalAmount", value)}
                            placeholder="Enter balance cycle"
                            keyboardType="numeric"
                        />

                    </View>


                    {/* SUBMIT BUTTON */}

                    <TouchableOpacity
                        style={[
                            styles.submitButton,

                            loading &&
                            styles.disabledButton,
                        ]}

                        onPress={
                            handleSubmit
                        }

                        disabled={
                            loading
                        }

                        activeOpacity={0.8}
                    >

                        {loading ? (

                            <ActivityIndicator
                                color="#fff"
                            />

                        ) : (

                            <>

                                <Icon
                                    name="paper-plane"
                                    size={16}
                                    color="#fff"
                                />

                                <Text
                                    style={
                                        styles.submitButtonText
                                    }
                                >
                                    Submit Entries
                                </Text>

                            </>

                        )}

                    </TouchableOpacity>

                </View>

            </KeyboardAwareScrollView>

        </KeyboardAvoidingView>
    );
};


export default PaymentSubmitForm;


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


    dateField: {
        height: 58,
        borderWidth: 1,
        borderColor: "#E1E4E8",
        borderRadius: 12,
        paddingHorizontal: 14,

        flexDirection: "row",
        alignItems: "center",

        gap: 12,

        marginBottom: 16,

        backgroundColor: "#fff",
    },


    dateLabel: {
        fontSize: 12,
        color: "#777",
        marginBottom: 2,
    },


    dateValue: {
        fontSize: 15,
        color: "#222",
        fontWeight: "500",
    },


    submitButton: {
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


    disabledButton: {
        opacity: 0.7,
    },


    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

});