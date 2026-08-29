import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    Alert,
    RefreshControl,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomNavBar from "../../helper/CustomNavBar";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getDailyPayment } from "../../store/slice/DailyPayment.slice";

const formatDate = (dateString) => {
    if (!dateString) return "";

    const value = String(dateString).trim();

    // API format:
    // 8/27/2026 12:00:00
    // 8/27/2026 12:00:00 AM
    // 8/27/2026
    const match = value.match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/
    );

    if (match) {
        const [, month, day, year] = match;

        return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
};
const formatApiDate = (date) => {
    if (!date) return null;

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

    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

const PaymentEntryList = ({ navigation }) => {

    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const stackNavigate = useNavigation()
    const currUser = useSelector(state => state.auth.userData);
    const gasEntries = useSelector(state => state.dailyPayment.paymentList);

    const comid = currUser?.Comid;

    const [refreshing, setRefreshing] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [status, setStatus] = useState(0);

    useEffect(() => {
        fetchEntries();
    }, [fromDate, toDate, status]);

    const fetchEntries = async () => {

        await dispatch(
            getDailyPayment({
                FromDate: formatApiDate(fromDate),
                Todate: formatApiDate(toDate),
                PendingStatus: status,
                Comid: comid,
            })
        );

    };

    const renderEntry = ({ item }) => {

        return (
            <View style={styles.card}>

                {/* HEADER */}

                <View style={styles.cardHeader}>

                    <View style={styles.customerContainer}>

                        <View style={styles.customerIcon}>
                            <FontAwesome6
                                name="user"
                                size={15}
                                color="#4A90E2"
                            />
                        </View>

                        <View>
                            <Text style={styles.customerName}>
                                {item.Customer}
                            </Text>

                            <Text style={styles.entryId}>
                                Entry #{item.EntryID}
                            </Text>
                        </View>

                    </View>


                    <View style={styles.amountAndEditContainer}>
                        <View style={styles.amountContainer}>

                            <Text style={styles.amountLabel}>
                                Amount
                            </Text>

                            <Text style={styles.amount}>
                                ₹{item.Amount}
                            </Text>
                        </View>


                        {status === 0 && (
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => {
                                    navigation.navigate("DailyStockEntry", {
                                        entry: item,
                                        isEdit: true,
                                        fromDate: formatApiDate(toDate),
                                        toDate: formatApiDate(fromDate),
                                        PendingStatus: status
                                    });
                                }}
                            >
                                <FontAwesome6
                                    name="pen-to-square"
                                    size={14}
                                    color="#4A90E2"
                                />

                                <Text style={styles.editButtonText}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={styles.divider} />


                {/* DATE + PAYMENT */}

                <View style={styles.infoRow}>

                    <View style={styles.infoItem}>

                        <FontAwesome6
                            name="calendar-days"
                            size={14}
                            color="#7A8493"
                        />

                        <View>

                            <Text style={styles.infoLabel}>
                                Date
                            </Text>

                            <Text style={styles.infoValue}>
                                {formatDate(item.OrderDate)}
                            </Text>

                        </View>

                    </View>


                    <View style={styles.infoItem}>

                        <FontAwesome6
                            name="credit-card"
                            size={14}
                            color="#7A8493"
                        />

                        <View style={{ flex: 1 }}>

                            <Text style={styles.infoLabel}>
                                Payment Mode
                            </Text>

                            <Text
                                style={styles.infoValue}
                                numberOfLines={1}
                            >
                                {item.PaymentMode}
                            </Text>

                        </View>

                    </View>

                </View>


                {/* CYCLE DETAILS */}

                <View style={styles.cycleContainer}>

                    <Text style={styles.sectionLabel}>
                        Cycle Details
                    </Text>


                    <View style={styles.cycleRow}>

                        <View style={styles.cycleItem}>

                            <Text style={styles.cycleLabel}>
                                Cyc In
                            </Text>

                            <Text style={styles.cycleValue}>
                                {item.CycIn}
                            </Text>

                        </View>


                        <View style={styles.cycleItem}>

                            <Text style={styles.cycleLabel}>
                                Cyc Out
                            </Text>

                            <Text style={styles.cycleValue}>
                                {item.CycOut}
                            </Text>

                        </View>


                        <View style={styles.cycleItem}>

                            <Text style={styles.cycleLabel}>
                                Bal Cyc
                            </Text>

                            <Text style={styles.cycleValue}>
                                {item.BalCyc}
                            </Text>

                        </View>


                        <View style={styles.cycleItem}>

                            <Text style={styles.cycleLabel}>
                                Regulator
                            </Text>

                            <Text style={styles.cycleValue}>
                                {item.Regulator}
                            </Text>

                        </View>

                    </View>

                </View>

            </View>
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            fetchEntries()
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            onRefresh();
        }
    }, [isFocused]);

    return (

        <SafeAreaView style={styles.container}>

            <CustomNavBar
                navName={"Daily Payment Entry Logs"}
                subtitle={"View your daily payments transactions"}
            />


            {/* FILTER BAR */}

            <View style={styles.filterBar}>

                {/* FILTER BUTTON */}
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilter(true)}
                >
                    <FontAwesome6
                        name="filter"
                        size={14}
                        color="#4A90E2"
                    />

                    <Text style={styles.filterButtonText}>
                        Filters
                    </Text>

                    <FontAwesome6
                        name="chevron-down"
                        size={11}
                        color="#7A8493"
                    />
                </TouchableOpacity>


                {/* CURRENT STATUS */}
                <View style={styles.statusBadge}>

                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor:
                                    status === 1
                                        ? "#28A745"
                                        : "#4A90E2",
                            },
                        ]}
                    />

                    <Text style={styles.statusBadgeText}>
                        {status === 1
                            ? "Approved"
                            : "Pending"}
                    </Text>

                </View>


                {/* SUBMIT PENDING ENTRIES */}
                {status === 0 && (
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => { navigation.navigate("Home", { screen: "SubmitForm" }) }}
                    >
                        <FontAwesome6 name="paper-plane" size={13} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>Submit Entries</Text>
                    </TouchableOpacity>
                )}

            </View>


            {/* FILTER MODAL */}

            <Modal
                visible={showFilter}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilter(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.filterModal}>

                        {/* MODAL HEADER */}

                        <View style={styles.modalHeader}>

                            <View>

                                <Text style={styles.modalTitle}>
                                    Filter Entries
                                </Text>

                                <Text style={styles.modalSubtitle}>
                                    Select date range and status
                                </Text>

                            </View>


                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowFilter(false)}
                            >

                                <FontAwesome6
                                    name="xmark"
                                    size={16}
                                    color="#555"
                                />

                            </TouchableOpacity>

                        </View>


                        {/* FROM DATE */}

                        <Text style={styles.fieldLabel}>
                            From Date
                        </Text>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() =>
                                setShowFromPicker(true)
                            }
                        >

                            <FontAwesome6
                                name="calendar-days"
                                size={15}
                                color="#4A90E2"
                            />

                            <Text style={styles.dateText}>
                                {formatDate(fromDate)}
                            </Text>

                        </TouchableOpacity>


                        {showFromPicker && (

                            <DateTimePicker
                                value={fromDate}
                                mode="date"
                                display="default"
                                onChange={(
                                    event,
                                    selectedDate
                                ) => {

                                    setShowFromPicker(false);

                                    if (selectedDate) {
                                        setFromDate(selectedDate);
                                    }

                                }}
                            />

                        )}


                        {/* TO DATE */}

                        <Text style={styles.fieldLabel}>
                            To Date
                        </Text>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() =>
                                setShowToPicker(true)
                            }
                        >

                            <FontAwesome6
                                name="calendar-days"
                                size={15}
                                color="#4A90E2"
                            />

                            <Text style={styles.dateText}>
                                {formatDate(toDate)}
                            </Text>

                        </TouchableOpacity>


                        {showToPicker && (

                            <DateTimePicker
                                value={toDate}
                                mode="date"
                                display="default"
                                onChange={(
                                    event,
                                    selectedDate
                                ) => {

                                    setShowToPicker(false);

                                    if (selectedDate) {
                                        setToDate(selectedDate);
                                    }

                                }}
                            />

                        )}


                        {/* STATUS */}

                        <Text style={styles.fieldLabel}>
                            Status
                        </Text>


                        <View style={styles.statusOptions}>

                            {/* PENDING */}

                            <TouchableOpacity
                                style={[
                                    styles.statusOption,
                                    status === 0 &&
                                    styles.statusOptionActive,
                                ]}
                                onPress={() =>
                                    setStatus(0)
                                }
                            >

                                <FontAwesome6
                                    name="clock"
                                    size={14}
                                    color={
                                        status === 0
                                            ? "#4A90E2"
                                            : "#7A8493"
                                    }
                                />

                                <Text
                                    style={[
                                        styles.statusOptionText,
                                        status === 0 &&
                                        styles.statusOptionTextActive,
                                    ]}
                                >
                                    Pending
                                </Text>

                            </TouchableOpacity>


                            {/* APPROVED */}

                            <TouchableOpacity
                                style={[
                                    styles.statusOption,
                                    status === 1 &&
                                    styles.statusOptionActive,
                                ]}
                                onPress={() =>
                                    setStatus(1)
                                }
                            >

                                <FontAwesome6
                                    name="circle-check"
                                    size={14}
                                    color={
                                        status === 1
                                            ? "#28A745"
                                            : "#7A8493"
                                    }
                                />

                                <Text
                                    style={[
                                        styles.statusOptionText,
                                        status === 1 &&
                                        styles.statusOptionTextActive,
                                    ]}
                                >
                                    Approved
                                </Text>

                            </TouchableOpacity>

                        </View>


                        {/* APPLY */}

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {

                                if (fromDate > toDate) {

                                    Alert.alert(
                                        "Invalid Date Range",
                                        "From Date cannot be after To Date."
                                    );

                                    return;
                                }

                                setShowFilter(false);

                                fetchEntries();

                            }}
                        >

                            <FontAwesome6
                                name="filter"
                                size={14}
                                color="#FFFFFF"
                            />

                            <Text style={styles.applyButtonText}>
                                Apply Filters
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>


            {/* LIST */}

            <FlatList
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A90E2"
                        colors={["#4A90E2"]}
                    />
                }
                data={gasEntries}
                keyExtractor={(item) =>
                    String(item.EntryID)
                }
                renderItem={renderEntry}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.listContent
                }
                ListEmptyComponent={

                    <View style={styles.emptyContainer}>

                        <View style={styles.emptyIcon}>

                            <FontAwesome6
                                name="clipboard-list"
                                size={28}
                                color="#4A90E2"
                            />

                        </View>

                        <Text style={styles.emptyTitle}>
                            No Payment Entries
                        </Text>

                        <Text style={styles.emptyText}>
                            Your daily payment entries will appear
                            here.
                        </Text>

                    </View>

                }
            />

        </SafeAreaView >
    );
};


export default PaymentEntryList;


// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },

    // FILTER BAR

    filterBar: {
        paddingHorizontal: 16,
        marginTop: 4,
        marginBottom: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DCE8F7",
        borderRadius: 10,
        paddingHorizontal: 13,
        paddingVertical: 9,
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 3,
        shadowOffset: {
            width: 0,
            height: 1,
        },
    },

    filterButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4A90E2",
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 11,
        paddingVertical: 8,
        borderRadius: 10,
    },

    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },

    statusBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#555E6B",
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        backgroundColor: "#4A90E2",
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 10,
    },

    submitButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    // LIST

    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        marginTop: 10,
    },


    // CARD

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,

        borderWidth: 1,
        borderColor: "#EEF2F6",

        elevation: 2,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },

        shadowOpacity: 0.06,
        shadowRadius: 5,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    customerContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    customerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#EAF3FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 11,
    },

    customerName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#252B35",
    },

    entryId: {
        marginTop: 3,
        fontSize: 11,
        color: "#7A8493",
    },

    amountContainer: {
        alignItems: "flex-end",
    },
    amountAndEditContainer: {
        alignItems: "flex-end",
        flexDirection: "row",
        gap: 10,
    },
    amountLabel: {
        fontSize: 10,
        color: "#7A8493",
        // marginBottom: 2,
    },
    editButton: {
        alignSelf: "flex-end",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 7,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: "#F0F7FF",
        borderWidth: 1,
        borderColor: "#4A90E2",
        // height: 100
    },

    editButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4A90E2",
    },

    amount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#4A90E2",
        letterSpacing: 0.2,
    },

    divider: {
        height: 1,
        backgroundColor: "#EEF0F2",
        marginVertical: 14,
    },


    // INFO

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 8,
        gap: 8,
    },

    infoLabel: {
        fontSize: 10,
        color: "#7A8493",
        marginBottom: 2,
    },

    infoValue: {
        fontSize: 12,
        fontWeight: "600",
        color: "#252B35",
    },


    // CYCLE

    cycleContainer: {
        marginTop: 16,
        backgroundColor: "#F7F8FA",
        borderRadius: 12,
        padding: 12,
    },

    sectionLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#7A8493",
        marginBottom: 10,
    },

    cycleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    cycleItem: {
        alignItems: "center",
        flex: 1,
    },

    cycleLabel: {
        fontSize: 9,
        color: "#7A8493",
        marginBottom: 4,
        textAlign: "center",
    },

    cycleValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#252B35",
    },


    // MODAL

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
    },

    filterModal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 22,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#252B35",
    },

    modalSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: "#7A8493",
    },

    closeButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#F6F7F9",
        alignItems: "center",
        justifyContent: "center",
    },

    fieldLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#555E6B",
        marginBottom: 7,
        marginTop: 10,
    },

    dateButton: {
        height: 48,
        borderWidth: 1,
        borderColor: "#E2E5E9",
        borderRadius: 10,
        paddingHorizontal: 13,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#FAFBFC",
    },

    dateText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#252B35",
    },


    // STATUS OPTIONS

    statusOptions: {
        flexDirection: "row",
        gap: 10,
    },

    statusOption: {
        flex: 1,
        height: 46,
        borderWidth: 1,
        borderColor: "#E2E5E9",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#FAFBFC",
    },

    statusOptionActive: {
        borderColor: "#4A90E2",
        backgroundColor: "#F0F7FF",
    },

    statusOptionText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#7A8493",
    },

    statusOptionTextActive: {
        color: "#4A90E2",
    },


    // APPLY

    applyButton: {
        height: 50,
        marginTop: 24,
        borderRadius: 12,
        backgroundColor: "#4A90E2",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 9,
    },

    applyButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },


    // EMPTY

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 100,
        paddingHorizontal: 30,
    },

    emptyIcon: {
        width: 68,
        height: 68,
        borderRadius: 18,
        backgroundColor: "#EAF3FF",
        borderWidth: 1,
        borderColor: "#D8E8FA",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },

    emptyTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#252B35",
    },

    emptyText: {
        marginTop: 6,
        fontSize: 13,
        color: "#7A8493",
        textAlign: "center",
    },

});