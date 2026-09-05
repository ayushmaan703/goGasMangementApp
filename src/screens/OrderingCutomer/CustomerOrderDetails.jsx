import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import CustomNavBar from "../../helper/CustomNavBar";
import { customerOrderEntryDone } from "../../store/slice/OrderingCustomer.slice";
import Toast from "react-native-toast-message";
import InputField from "../../helper/InputField";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// =====================================================
// HELPERS
// =====================================================
const PURPLE = "#8B5CF6";
const DARK_PURPLE = "#5B21B6";
const LIGHT_PURPLE = "#F3EEFF";

const formatDate = (dateString) => {
    if (!dateString) return "";

    const value = String(dateString).trim();
    const match = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);

    if (match) {
        const [, month, day, year] = match;
        return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString;
    }

    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

const DetailRow = ({ icon, label, value }) => {
    return (
        <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
                <FontAwesome6 name={icon} size={14} color="#5B21B6" />
            </View>
            <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value || "Not Available"}</Text>
            </View>
        </View>
    );
};

const CustomerOrderDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();

    const currUser = useSelector((state) => state.auth.userData);
    const loading = useSelector((state) => state.orderingCustomer.loading);

    const [markingDone, setMarkingDone] = useState(false);
    const order = route?.params?.order || {};
    const complete = route?.params?.complete || false;

    const status = order?.OrderStatus || 0;
    const entryId = order?.EntryID;
    const quantity = order?.OrderQty || 0;

    // Keep deliveredQuantity as a string to handle text input changes accurately
    const [deliveredQuantity, setDeliveredQuantity] = useState(String(quantity));

    // =================================================
    // EDIT
    // =================================================
    const handleEdit = () => {
        navigation.navigate("CustomerOrderForm", {
            mode: "edit",
            order,
        });
    };

    // =================================================
    // MARK DONE
    // =================================================
    const handleMarkDone = async () => {
        if (!entryId) {
            Toast.show({
                type: "customNotificationError",
                text1: "Order ID not found",
            });
            return;
        }

        const numericQty = Number(deliveredQuantity);
        if (isNaN(numericQty) || numericQty < 0) {
            Toast.show({
                type: "customNotificationError",
                text1: "Invalid Quantity",
                text2: "Please enter a valid delivered quantity.",
            });
            return;
        }

        setMarkingDone(true);

        const result = await dispatch(
            customerOrderEntryDone({
                EntryId: entryId,
                Comid: currUser?.Comid,
                Uid: currUser?.EmpId,
                OrderCycQty: numericQty,
            })
        );

        setMarkingDone(false);

        if (result.type === "customerOrderEntryDone/fulfilled") {
            Toast.show({
                type: "customNotificationSuccess",
                text1: "Order Completed",
                text2: "Your order has been marked as completed.",
            });
            navigation.navigate("ApproveCustomerOrder");
        } else {
            Toast.show({
                type: "customNotificationError",
                text1: "Unable to complete order",
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomNavBar navName="Order Details" subtitle="View your cylinder order" />

            <KeyboardAvoidingView
                style={styles.flexOne}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* STATUS CARD */}
                    <View style={styles.statusCard}>
                        <View
                            style={[
                                styles.statusIcon,
                                status == 1 ? styles.completedIcon : styles.pendingIcon,
                            ]}
                        >
                            <FontAwesome6
                                name={status == 1 ? "circle-check" : "clock"}
                                size={25}
                                color={status == 1 ? "#16A34A" : "#5B21B6"}
                            />
                        </View>

                        <View style={styles.statusInfo}>
                            <Text style={styles.statusTitle}>
                                {status == 1 ? "Order Completed" : "Order Pending"}
                            </Text>
                            <Text style={styles.statusSubtitle}>
                                {status == 1
                                    ? "This order has been completed."
                                    : "Your order is currently being processed."}
                            </Text>
                        </View>
                    </View>

                    {/* ORDER SUMMARY */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>

                        <DetailRow
                            icon="hashtag"
                            label="Order ID"
                            value={entryId ? `#${entryId}` : "Not Available"}
                        />

                        <View style={styles.divider} />

                        <DetailRow
                            icon="calendar-days"
                            label="Order Date"
                            value={formatDate(order?.OrderDate)}
                        />

                        <View style={styles.divider} />

                        {complete ? (
                            <View style={styles.quantityAdjustmentCard}>
                                <View style={styles.quantityHeader}>
                                    <View style={styles.quantityIcon}>
                                        <MaterialIcons
                                            name="propane-tank"
                                            size={19}
                                            color={PURPLE}
                                        />
                                    </View>

                                    <View style={styles.quantityHeaderText}>
                                        <Text style={styles.quantityTitle}>
                                            Delivered Quantity
                                        </Text>
                                        <Text style={styles.quantitySubtitle}>
                                            Adjust if the quantity changes during delivery
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.quantityInputRow}>
                                    <View style={styles.quantityInputWrapper}>
                                        <InputField
                                            icon="bottle-water"
                                            label="Actual Quantity"
                                            value={deliveredQuantity}
                                            onChangeText={setDeliveredQuantity}
                                            placeholder="Enter quantity"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.originalQuantity}>
                                    <FontAwesome6
                                        name="circle-info"
                                        size={12}
                                        color="#777"
                                    />
                                    <Text style={styles.originalQuantityText}>
                                        Order quantity: {quantity} Cylinders
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <DetailRow
                                icon="bottle-water"
                                label="Cylinder Quantity"
                                value={`${quantity} Cylinders`}
                            />
                        )}
                    </View>

                    {/* CUSTOMER */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Customer Details</Text>

                        <DetailRow
                            icon="user"
                            label="Customer"
                            value={complete ? order?.Customer : currUser?.Emp || "Customer"}
                        />

                        {!complete && <View style={styles.divider} />}

                        {!complete && (
                            <DetailRow
                                icon="id-card"
                                label="Customer ID"
                                value={currUser?.EmpId ? String(currUser.EmpId) : "Not Available"}
                            />
                        )}
                    </View>

                    {/* ACTIONS */}
                    {status == 0 && (
                        <View style={styles.actionContainer}>
                            {currUser?.UserType == "Customer" && (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={handleEdit}
                                    activeOpacity={0.85}
                                >
                                    <FontAwesome6 name="pen" size={14} color="#5B21B6" />
                                    <Text style={styles.editButtonText}>Edit Order</Text>
                                </TouchableOpacity>
                            )}

                            {currUser?.UserType !== "Customer" && (
                                <TouchableOpacity
                                    style={[
                                        styles.completeButton,
                                        markingDone && styles.disabledButton,
                                    ]}
                                    onPress={handleMarkDone}
                                    disabled={markingDone}
                                    activeOpacity={0.85}
                                >
                                    {markingDone ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <FontAwesome6
                                                name="circle-check"
                                                size={14}
                                                color="#FFFFFF"
                                            />
                                            <Text style={styles.completeButtonText}>
                                                Mark as Completed
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {status == 1 && (
                        <View style={styles.completedMessage}>
                            <FontAwesome6 name="circle-check" size={17} color="#16A34A" />
                            <Text style={styles.completedMessageText}>
                                This order has already been completed.
                            </Text>
                        </View>
                    )}
                </KeyboardAwareScrollView>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CustomerOrderDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },
    flexOne: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    statusCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statusIcon: {
        width: 54,
        height: 54,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
    },
    pendingIcon: {
        backgroundColor: "#F3EEFF",
    },
    completedIcon: {
        backgroundColor: "#ECFDF3",
    },
    statusInfo: {
        flex: 1,
        marginLeft: 13,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#253142",
    },
    statusSubtitle: {
        marginTop: 4,
        fontSize: 11,
        color: "#8A94A3",
        lineHeight: 16,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginTop: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#253142",
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: "#F3EEFF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 11,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        color: "#9AA3AF",
        marginBottom: 3,
    },
    detailValue: {
        fontSize: 13,
        color: "#354052",
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: "#EEF2F6",
        marginVertical: 13,
    },
    actionContainer: {
        marginTop: 18,
        gap: 10,
    },
    editButton: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#5B21B6",
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    editButtonText: {
        color: "#5B21B6",
        fontSize: 13,
        fontWeight: "800",
    },
    completeButton: {
        height: 50,
        borderRadius: 12,
        backgroundColor: "#16A34A",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    completeButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "800",
    },
    disabledButton: {
        opacity: 0.65,
    },
    completedMessage: {
        marginTop: 18,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#ECFDF3",
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },
    completedMessageText: {
        flex: 1,
        fontSize: 11,
        color: "#15803D",
        fontWeight: "600",
        lineHeight: 16,
    },
    quantityAdjustmentCard: {
        backgroundColor: "#F8F6FC",
        borderRadius: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: "#E8E2F3",
    },
    quantityHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    quantityIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#EEE8FA",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 11,
    },
    quantityHeaderText: {
        flex: 1,
    },
    quantityTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#25212D",
    },
    quantitySubtitle: {
        fontSize: 11.5,
        color: "#77727F",
        marginTop: 3,
    },
    quantityInputRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    quantityInputWrapper: {
        flex: 1,
    },
    originalQuantity: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    originalQuantityText: {
        fontSize: 11,
        color: "#777",
        marginLeft: 6,
    },
});