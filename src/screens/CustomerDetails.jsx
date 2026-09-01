import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from "react-native";

import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import CustomNavBar from "../helper/CustomNavBar";
import { useDispatch, useSelector } from "react-redux";
import { delCustomer, getCustomers } from "../store/slice/Customer.slice";
import ConfirmModal from "../helper/ConfirmModal";
import Toast from "react-native-toast-message";

const DetailItem = ({
    icon,
    label,
    value,
    onPress,
    last = false,
}) => {
    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            disabled={!onPress}
            style={[
                styles.detailItem,
                last && styles.detailItemLast,
            ]}
        >
            <View style={styles.detailIcon}>
                <FontAwesome6
                    name={icon}
                    size={15}
                    color="#4A90E2"
                />
            </View>

            <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                    {label}
                </Text>

                <Text
                    style={[
                        styles.detailValue,
                        onPress && styles.clickableValue,
                    ]}
                    numberOfLines={2}
                    selectable
                >
                    {value || "Not Available"}
                </Text>
            </View>

            {onPress && (
                <FontAwesome6
                    name="chevron-right"
                    size={10}
                    color="#CBD5E1"
                />
            )}
        </TouchableOpacity>
    );
};

const CustomerDetails = ({ route }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const isFocused = useIsFocused();

    const customerId = route?.params?.customer?.CustomerId || {};
    const customer = useSelector(state => state.customer.customerData) || {};
    const loading = useSelector(state => state.customer.loading) || false;

    const customerName = customer?.CustomerName || "Unnamed Customer";
    const contactNumber = customer?.ContactNo || "";
    const contactLocality = customer?.Locality || "";
    const contactPerson = customer?.ContactPerson || "Not Available";
    const status = customer?.Status || "Unknown";
    const salesperson = customer?.Salesperson || "Not Assigned";
    // const customerId = customer?.CustomerId || "Not Available";
    const salespersonId = customer?.SalespersonId || "Not Available";
    const createdDate = customer?.Createddate || "Not Available";
    const isApproved = status?.toLowerCase() === "approved";
    const currentUser = useSelector((state) => state.auth.userData);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isAdmin = currentUser?.UserType === "Admin";
    const comid = currentUser?.Comid

    const handleCall = () => {
        if (!contactNumber) return;

        Linking.openURL(
            `tel:${contactNumber}`
        );
    };

    const handleEdit = () => {
        navigation.navigate(
            "EditCustomer",
            {
                customer,
            }
        );
    };

    const getStatusColors = () => {
        switch (status?.toLowerCase()) {
            case "approved":
            case "active":
                return {
                    background: "#ECFDF3",
                    border: "#BBF7D0",
                    text: "#15803D",
                    icon: "#16A34A",
                };

            case "inactive":
                return {
                    background: "#FEF2F2",
                    border: "#FECACA",
                    text: "#B91C1C",
                    icon: "#DC2626",
                };

            case "new":
            case "pending":
                return {
                    background: "#FFF7ED",
                    border: "#FED7AA",
                    text: "#C2410C",
                    icon: "#EA580C",
                };

            default:
                return {
                    background: "#F1F5F9",
                    border: "#E2E8F0",
                    text: "#64748B",
                    icon: "#64748B",
                };
        }
    };

    const handleDelete = async () => {
        const res = await dispatch(delCustomer({ comid, id: customerId }));
        console.log(res);
        if (res.type === 'deleteCustomer/rejected') {
            Toast.show({
                type: 'customNotificationError',
                text1: res?.error?.message || 'Error Occured',
                visibilityTime: 2000,
            });
            setShowDeleteModal(false);
            return;
        } else {
            Toast.show({
                type: 'customNotificationSuccess',
                text1: 'Customer Deleted Successfully',
                visibilityTime: 2000,
            });
            setShowDeleteModal(false);
            navigation.goBack();
        }
    }

    const statusColors = getStatusColors();

    const fetch = async () => {
        await dispatch(getCustomers({ comid, id: customerId }))
    }
    // useEffect(() => {
    //     fetch()
    // }, [])

    useEffect(() => {
        if (isFocused) {
            fetch();
        }
    }, [isFocused]);
    return (
        <View style={styles.container}>
            <CustomNavBar navName="Customer Details" subtitle="Customer profile, status and information" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.heroCard}>
                    <View style={styles.customerAvatar}>
                        <FontAwesome6 name="building" size={25} color="#4A90E2" />
                    </View>
                    <Text
                        style={styles.customerName}
                        numberOfLines={2}
                    >
                        {customerName}
                    </Text>

                    {/* <View style={styles.customerIdRow}>
                        <FontAwesome6 name="hashtag" size={9} color="#94A3B8" />
                        <Text style={styles.customerId}>
                            {customerId}
                        </Text>
                    </View> */}

                    {/* STATUS */}

                    {isAdmin && <View
                        style={[styles.statusBadge,
                        {
                            backgroundColor: statusColors.background,
                            borderColor: statusColors.border,
                        },
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                {
                                    backgroundColor: statusColors.icon,
                                },
                            ]}
                        />

                        <FontAwesome6
                            name={
                                isApproved ? "circle-check" : "circle-info"}
                            size={12}
                            color={statusColors.icon}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: statusColors.text,
                                },
                            ]}
                        >
                            {status}
                        </Text>
                    </View>}
                </View>


                <View style={styles.quickActions}>

                    <TouchableOpacity
                        style={styles.quickAction}
                        activeOpacity={0.8}
                        onPress={handleCall}
                        disabled={!contactNumber}
                    >
                        <View
                            style={[
                                styles.quickIcon,
                                {
                                    backgroundColor: "#EAF3FF",
                                },
                            ]}
                        >
                            <FontAwesome6 name="phone" size={15} color="#4A90E2" />
                        </View>

                        <Text style={styles.quickText}>
                            Call
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.quickDivider} />

                    <TouchableOpacity
                        style={styles.quickAction}
                        activeOpacity={0.8}
                        onPress={handleEdit}
                    >
                        <View
                            style={[
                                styles.quickIcon,
                                {
                                    backgroundColor: "#F0FDF4",
                                },
                            ]}
                        >
                            <FontAwesome6 name="pen" size={14} color="#16A34A" />
                        </View>

                        <Text style={styles.quickText} >
                            Edit
                        </Text>
                    </TouchableOpacity>


                    {isAdmin && !isApproved &&
                        <><View style={styles.quickDivider} />
                            <TouchableOpacity
                                style={styles.quickAction}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate("ApproveCustomer", { accountId: customerId })}
                            >
                                <View
                                    style={[
                                        styles.quickIcon,
                                        {
                                            backgroundColor: "#EAF3FF",
                                        },
                                    ]}
                                >
                                    <FontAwesome6 name="user-check" size={14} color="#4A90E2" />
                                </View>

                                <Text style={styles.quickText} >
                                    Approve
                                </Text>
                            </TouchableOpacity>
                        </>}
                    <View style={styles.quickDivider} />

                    <TouchableOpacity
                        style={styles.quickAction}
                        activeOpacity={0.8}
                        onPress={() => setShowDeleteModal(true)}
                    >
                        <View
                            style={[
                                styles.quickIcon,
                                {
                                    backgroundColor: "#F0FDF4",
                                },
                            ]}
                        >
                            <FontAwesome6 name="trash" size={14} color="#DC2626" />
                        </View>

                        <Text style={styles.quickText} >
                            Delete
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>
                    Contact Information
                </Text>

                <View style={styles.detailsCard}>

                    <DetailItem
                        icon="user-tie"
                        label="Contact Person"
                        value={contactPerson}
                    />

                    <DetailItem
                        icon="phone"
                        label="Contact Number"
                        value={contactNumber}
                        onPress={contactNumber ? handleCall : undefined}
                    />

                    {/* <DetailItem
                        icon="user"
                        label="Salesperson"
                        value={salesperson}
                    />

                    <DetailItem
                        icon="id-badge"
                        label="Salesperson ID"
                        value={salespersonId}
                        last
                    /> */}

                </View>

                <Text style={styles.sectionTitle}>
                    Customer Information
                </Text>

                <View style={styles.detailsCard}>

                    <DetailItem
                        icon="hashtag"
                        label="Customer ID"
                        value={customerId}
                    />
                    {/*<DetailItem
                        icon="calendar"
                        label="Created Date"
                        value={createdDate}
                    /> */}

                    {isAdmin &&
                        <DetailItem
                            icon="circle-check"
                            label="Current Status"
                            value={status}
                        />
                    }
                    <DetailItem
                        icon="location-dot"
                        label="Locality"
                        value={contactLocality}
                        last
                    />

                </View>

                <Text style={styles.sectionTitle}>
                    Sales Information
                </Text>

                <View style={styles.salesCard}>

                    <View style={styles.salesIcon}>
                        <FontAwesome6
                            name="user-tie"
                            size={18}
                            color="#4A90E2"
                        />
                    </View>

                    <View
                        style={styles.salesContent}
                    >
                        <Text style={styles.salesLabel}>
                            Assigned Salesperson
                        </Text>

                        <Text style={styles.salesName}>
                            {salesperson}
                        </Text>

                        {/* <Text style={styles.salesId} >
                            ID: {salespersonId}
                        </Text> */}
                    </View>

                    {/* <FontAwesome6 name="chevron-right" size={11} color="#CBD5E1" /> */}

                </View>

                <View style={styles.bottomSpace} />

            </ScrollView >
            <ConfirmModal
                visible={showDeleteModal}
                title="Delete Customer?"
                message="Are you sure you want to delete this customer? This action cannot be undone."
                confirmText="Delete"
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={loading}
            />
        </View >
    );
};

export default CustomerDetails;


// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },

    // =========================================================
    // TOP BAR
    // =========================================================

    topBar: {
        height: 72,

        backgroundColor: "#FFFFFF",

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 16,

        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,

        shadowColor: "#1E293B",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 4,
    },

    backButton: {
        width: 42,
        height: 42,

        borderRadius: 14,

        backgroundColor: "#F1F5F9",

        alignItems: "center",
        justifyContent: "center",
    },

    topBarTitle: {
        flex: 1,
        marginLeft: 12,
    },

    topTitle: {
        fontSize: 15,
        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    topSubtitle: {
        fontSize: 8,
        color: "#94A3B8",

        marginTop: 2,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },

    editTopButton: {
        width: 42,
        height: 42,

        borderRadius: 14,

        backgroundColor: "#EAF3FF",

        alignItems: "center",
        justifyContent: "center",
    },

    // =========================================================
    // SCROLL
    // =========================================================

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 30,
    },

    // =========================================================
    // HERO
    // =========================================================

    heroCard: {
        backgroundColor: "#FFFFFF",

        borderRadius: 24,

        paddingVertical: 24,
        paddingHorizontal: 18,

        alignItems: "center",

        borderWidth: 1,
        borderColor: "#EDF1F6",

        shadowColor: "#1E293B",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 3,
    },

    customerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 25,

        backgroundColor: "#EAF3FF",

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 13,
    },

    customerName: {
        fontSize: 22,

        color: "#1E293B",

        textAlign: "center",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        lineHeight: 30,

        maxWidth: "90%",
    },

    customerIdRow: {
        flexDirection: "row",
        alignItems: "center",

        marginTop: 6,
    },

    customerId: {
        fontSize: 9,

        color: "#94A3B8",

        marginLeft: 4,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",

        borderWidth: 1,

        borderRadius: 20,

        paddingHorizontal: 12,
        paddingVertical: 7,

        marginTop: 14,
    },

    statusDot: {
        width: 6,
        height: 6,

        borderRadius: 3,

        marginRight: 6,
    },

    statusText: {
        fontSize: 10,

        marginLeft: 6,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    // =========================================================
    // QUICK ACTIONS
    // =========================================================

    quickActions: {
        flexDirection: "row",

        height: 70,

        backgroundColor: "#FFFFFF",

        borderRadius: 19,

        marginTop: 12,

        borderWidth: 1,
        borderColor: "#EDF1F6",

        alignItems: "center",

        shadowColor: "#1E293B",
        shadowOpacity: 0.035,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 3,
        },

        elevation: 2,
    },

    quickAction: {
        flex: 1,

        alignItems: "center",
        justifyContent: "center",

        flexDirection: "row",
    },

    quickIcon: {
        width: 34,
        height: 34,

        borderRadius: 11,

        alignItems: "center",
        justifyContent: "center",

        marginRight: 8,
    },

    quickText: {
        fontSize: 10,

        color: "#475569",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    quickDivider: {
        width: 1,
        height: 30,

        backgroundColor: "#E8EDF3",
    },

    // =========================================================
    // SECTION
    // =========================================================

    sectionTitle: {
        fontSize: 11,

        color: "#64748B",

        marginTop: 22,
        marginBottom: 9,

        marginLeft: 3,

        textTransform: "uppercase",

        letterSpacing: 0.7,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    // =========================================================
    // DETAILS
    // =========================================================

    detailsCard: {
        backgroundColor: "#FFFFFF",

        borderRadius: 19,

        paddingHorizontal: 14,

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

    detailItem: {
        minHeight: 68,

        flexDirection: "row",
        alignItems: "center",

        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },

    detailItemLast: {
        borderBottomWidth: 0,
    },

    detailIcon: {
        width: 40,
        height: 40,

        borderRadius: 12,

        backgroundColor: "#EAF3FF",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 11,
    },

    detailContent: {
        flex: 1,

        paddingRight: 8,
    },

    detailLabel: {
        fontSize: 8,

        color: "#94A3B8",

        marginBottom: 4,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },

    detailValue: {
        fontSize: 11,

        color: "#334155",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    clickableValue: {
        color: "#3478C5",
    },

    // =========================================================
    // SALES CARD
    // =========================================================

    salesCard: {
        flexDirection: "row",

        alignItems: "center",

        backgroundColor: "#FFFFFF",

        borderRadius: 19,

        padding: 14,

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

    salesIcon: {
        width: 44,
        height: 44,

        borderRadius: 14,

        backgroundColor: "#EAF3FF",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 11,
    },

    salesContent: {
        flex: 1,
    },

    salesLabel: {
        fontSize: 8,

        color: "#94A3B8",

        marginBottom: 3,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },

    salesName: {
        fontSize: 13,

        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    salesId: {
        fontSize: 8,

        color: "#94A3B8",

        marginTop: 3,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },

    bottomSpace: {
        height: 30,
    },
});