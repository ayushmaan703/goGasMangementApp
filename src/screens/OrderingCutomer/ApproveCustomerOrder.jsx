import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    ScrollView,
} from "react-native";

import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import {
    useIsFocused,
    useNavigation,
} from "@react-navigation/native";

import { useDispatch, useSelector } from "react-redux";

import CustomNavBar from "../../helper/CustomNavBar";
import ConfirmModal from "../../helper/ConfirmModal";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
    getCustomerOrderEntry,
    // TODO: add this thunk to OrderingCustomer.slice.js (mirrors delDailyPayment
    // in DailyPayment.slice.js) so it can actually hit your approve-order API.
    approveCustomerOrderEntry,
} from "../../store/slice/OrderingCustomer.slice";


// =====================================================
// COLORS  (matched to PaymentEntryList)
// =====================================================

const BLUE = "#4A90E2";
const GREEN = "#28A745";
const BACKGROUND = "#F6F9FD";
const TEXT = "#252B35";
const SECONDARY_TEXT = "#7A8493";
const BORDER = "#E2E5E9";


// =====================================================
// DATE HELPERS
// =====================================================

const formatApiDate = (date) => {
    const months = [
        "jan", "feb", "mar", "apr", "may", "jun",
        "jul", "aug", "sep", "oct", "nov", "dec",
    ];

    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

const formatDisplayDate = (dateString) => {
    if (!dateString) return "";

    const value = String(dateString).trim();

    // API example: 9/4/2026 12:00:00 AM
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

const parseApiDate = (dateString) => {
    if (!dateString) return new Date(0);

    const value = String(dateString).trim();
    const match = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);

    if (match) {
        const month = Number(match[1]);
        const day = Number(match[2]);
        const year = Number(match[3]);
        return new Date(year, month - 1, day);
    }

    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
};


// =====================================================
// COMPONENT
// =====================================================

const ApproveCustomerOrder = () => {

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const currUser = useSelector(state => state.auth.userData);
    const orders = useSelector(state => state.orderingCustomer.customerOrderList) || [];
    const loading = useSelector(state => state.orderingCustomer.loading);

    const comid = currUser?.Comid;


    // =================================================
    // STATE
    // =================================================

    const [refreshing, setRefreshing] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [sortOrder, setSortOrder] = useState("Newest");

    // 2 = All, 1 = Completed, 0 = Pending
    const [selectedStatus, setSelectedStatus] = useState(2);

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const statusOptions = [
        { label: "All", value: 2, icon: "filter" },
        { label: "Completed", value: 1, icon: "circle-check" },
        { label: "Pending", value: 0, icon: "clock" },
    ];


    // =================================================
    // FETCH ORDERS
    // =================================================

    const fetchOrders = useCallback(async () => {

        if (!comid || !currUser?.EmpId) {
            return;
        }

        const payload = {
            FromDate: formatApiDate(fromDate),
            Todate: formatApiDate(toDate),
            Comid: comid,
            CustomerId: 0,
            OrderStatus: selectedStatus,
        };

        await dispatch(getCustomerOrderEntry(payload));

    }, [dispatch, comid, currUser?.EmpId, fromDate, toDate, selectedStatus]);


    useEffect(() => {
        if (isFocused) {
            fetchOrders();
        }
    }, [isFocused, fetchOrders]);


    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchOrders();
        } finally {
            setRefreshing(false);
        }
    };


    // =================================================
    // DATE CHANGE
    // =================================================

    const handleFromDateChange = (event, selectedDate) => {
        setShowFromPicker(false);

        if (!selectedDate) return;

        setFromDate(selectedDate);

        if (toDate && selectedDate > toDate) {
            setToDate(selectedDate);
        }
    };

    const handleToDateChange = (event, selectedDate) => {
        setShowToPicker(false);

        if (!selectedDate) return;

        if (fromDate && selectedDate < fromDate) {
            Toast.show({
                type: "error",
                text1: "Invalid Date",
                text2: "To Date cannot be before From Date.",
            });
            return;
        }

        setToDate(selectedDate);
    };


    // =================================================
    // SORT
    // =================================================

    const sortedOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];

        return [...orders].sort((a, b) => {
            const dateA = parseApiDate(a?.OrderDate);
            const dateB = parseApiDate(b?.OrderDate);

            return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
        });
    }, [orders, sortOrder]);


    // =================================================
    // TOTALS (for summary card)
    // =================================================

    const totalOrders = sortedOrders.length;

    const totalCylinders = sortedOrders.reduce(
        (total, item) => total + Number(item?.OrderQty || 0),
        0
    );


    // =================================================
    // APPROVE
    // =================================================

    const handleApproveOrder = async () => {

        const res = await dispatch(
            approveCustomerOrderEntry({ comid, id: selectedOrderId })
        );

        if (res?.type === "approveCustomerOrder/rejected") {
            Toast.show({
                type: "customNotificationError",
                text1: res?.error?.message || "Error Occured",
                visibilityTime: 2000,
            });
            setShowApproveModal(false);
            return;
        }

        Toast.show({
            type: "customNotificationSuccess",
            text1: "Order Approved Successfully",
            visibilityTime: 2000,
        });

        setShowApproveModal(false);
        fetchOrders();
    };


    // =================================================
    // ROW RENDER
    // =================================================

    const renderEntry = (item) => {
        const entryId = item?.EntryID || item?.EntryId || "-";
        const orderDate = item?.OrderDate || "";
        const quantity = item?.OrderQty || 0;
        const customer = item?.Customer || "Customer";
        const status = item?.OrderStatus || 0

        return (
            <View key={entryId} style={styles.tableRow}>

                {/* CUSTOMER */}
                <View style={[styles.cell, styles.customerCell]}>
                    <Text style={styles.customerText} numberOfLines={1}>
                        {customer}
                    </Text>
                    <Text style={styles.entryText}>#{entryId}</Text>
                </View>

                {/* DATE */}
                <View style={[styles.cell, styles.dateCell]}>
                    <Text style={styles.dateText}>
                        {formatDisplayDate(orderDate)}
                    </Text>
                </View>

                {/* CYLINDERS */}
                <View style={[styles.cell, styles.quantityCell]}>
                    <View style={styles.quantityWrapper}>
                        <MaterialIcons
                            name="propane-tank"
                            size={13}
                            color={BLUE}
                        />
                        <Text style={styles.quantityText}>{quantity}</Text>
                    </View>
                </View>

                {/* ACTION */}
                {status == 0 &&
                    < View style={[styles.cell, styles.actionCell]}>
                        {selectedStatus === 1 ? (
                            <View style={styles.approvedBadge}>
                                <FontAwesome6
                                    name="circle-check"
                                    size={12}
                                    color={GREEN}
                                />
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.approveButton}
                                onPress={() => {
                                    navigation.navigate("Home", {
                                        screen: "CustomerOrderDetails", params: {
                                            order: item,
                                            complete: true
                                        }
                                    })
                                }}
                            >
                                <FontAwesome6
                                    name="check"
                                    size={11}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                        )}
                    </View>}

            </View >
        );
    };


    const renderEmpty = () => {

        if (loading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={BLUE} />
                    <Text style={styles.emptyTitle}>Loading Orders...</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                    <MaterialIcons name="propane-tank" size={25} color={BLUE} />
                </View>
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptyText}>
                    No cylinder orders match your selected filters.
                </Text>
            </View>
        );
    };


    // =================================================
    // UI
    // =================================================

    return (
        <SafeAreaView style={styles.container}>

            <CustomNavBar
                navName="Approve Customer Orders"
                subtitle="Review and approve cylinder orders"
            />

            {/* =================================================
                FILTER BAR
            ================================================= */}

            <View style={styles.filterBar}>

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilter(true)}
                >
                    <FontAwesome6 name="filter" size={12} color={BLUE} />
                    <Text style={styles.filterButtonText}>Filters</Text>
                    <FontAwesome6 name="chevron-down" size={8} color={SECONDARY_TEXT} />
                </TouchableOpacity>

                <View style={styles.dateBadge}>
                    <FontAwesome6 name="calendar-days" size={11} color={SECONDARY_TEXT} />
                    <Text style={styles.dateBadgeText} numberOfLines={1}>
                        {formatDisplayDate(fromDate)} - {formatDisplayDate(toDate)}
                    </Text>
                </View>

                <View style={styles.statusBadge}>
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor:
                                    selectedStatus === 1 ? GREEN : BLUE,
                            },
                        ]}
                    />
                    <Text style={styles.statusBadgeText}>
                        {selectedStatus === 0
                            ? "Pending"
                            : selectedStatus === 1
                                ? "Completed"
                                : "All"}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.sortIconButton}
                    onPress={() =>
                        setSortOrder(sortOrder === "Newest" ? "Oldest" : "Newest")
                    }
                >
                    <FontAwesome6
                        name={
                            sortOrder === "Newest"
                                ? "arrow-down-wide-short"
                                : "arrow-up-wide-short"
                        }
                        size={12}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>

            </View>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <View style={styles.summaryCard}>

                <View style={styles.summaryHeader}>
                    <View style={styles.summaryTitleContainer}>
                        <FontAwesome6 name="chart-simple" size={12} color={BLUE} />
                        <Text style={styles.summaryTitle}>Summary</Text>
                    </View>

                    <Text style={styles.entryCount}>{totalOrders} Entries</Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>

                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>ORDERS</Text>
                        <Text style={styles.summaryValue}>{totalOrders}</Text>
                    </View>

                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>CYLINDERS</Text>
                        <Text style={styles.summaryValue}>{totalCylinders}</Text>
                    </View>

                    <View style={[styles.summaryItem, styles.lastSummaryItem]}>
                        <Text style={styles.summaryLabel}>STATUS</Text>
                        <Text style={styles.summaryAmount}>
                            {selectedStatus === 0 ? "Pending" : selectedStatus === 1 ? "Completed" : "All"}
                        </Text>
                    </View>

                </View>

            </View>

            {/* =================================================
                TABLE
            ================================================= */}

            <View style={styles.tableWrapper}>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator
                    bounces={false}
                    nestedScrollEnabled
                    contentContainerStyle={styles.horizontalContent}
                >

                    <View style={styles.table}>

                        <View style={styles.tableHeader}>

                            <View style={[styles.headerCell, styles.customerCell]}>
                                <Text style={styles.headerText}>Customer</Text>
                            </View>

                            <View style={[styles.headerCell, styles.dateCell]}>
                                <Text style={styles.headerText}>Date</Text>
                            </View>

                            <View style={[styles.headerCell, styles.quantityCell]}>
                                <Text style={styles.headerText}>Cylinders</Text>
                            </View>

                            <View style={[styles.headerCell, styles.actionCell]}>
                                <Text style={styles.headerText}>Complete</Text>
                            </View>

                        </View>

                        <ScrollView
                            style={styles.verticalTableScroll}
                            showsVerticalScrollIndicator
                            nestedScrollEnabled
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={BLUE}
                                    colors={[BLUE]}
                                />
                            }
                        >
                            {sortedOrders.length > 0
                                ? sortedOrders.map(item => renderEntry(item))
                                : renderEmpty()}
                        </ScrollView>

                    </View>

                </ScrollView>

            </View>

            {/* =================================================
                FILTER MODAL
            ================================================= */}

            <Modal
                visible={showFilter}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilter(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.filterModal}>

                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Filter Orders</Text>
                                <Text style={styles.modalSubtitle}>
                                    Choose how you want to view your orders
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowFilter(false)}
                            >
                                <FontAwesome6 name="xmark" size={16} color="#555" />
                            </TouchableOpacity>
                        </View>

                        {/* FROM DATE */}
                        <Text style={styles.fieldLabel}>From Date</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowFromPicker(true)}
                        >
                            <FontAwesome6 name="calendar-days" size={15} color={BLUE} />
                            <Text style={styles.dateText}>
                                {formatDisplayDate(fromDate)}
                            </Text>
                        </TouchableOpacity>

                        {showFromPicker && (
                            <DateTimePicker
                                value={fromDate}
                                mode="date"
                                display="default"
                                onChange={handleFromDateChange}
                            />
                        )}

                        {/* TO DATE */}
                        <Text style={styles.fieldLabel}>To Date</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowToPicker(true)}
                        >
                            <FontAwesome6 name="calendar-days" size={15} color={BLUE} />
                            <Text style={styles.dateText}>
                                {formatDisplayDate(toDate)}
                            </Text>
                        </TouchableOpacity>

                        {showToPicker && (
                            <DateTimePicker
                                value={toDate}
                                mode="date"
                                display="default"
                                onChange={handleToDateChange}
                            />
                        )}

                        {/* STATUS */}
                        <Text style={styles.fieldLabel}>Status</Text>
                        <View style={styles.statusOptions}>
                            {statusOptions.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.statusOption,
                                        selectedStatus === option.value &&
                                        styles.statusOptionActive,
                                    ]}
                                    onPress={() => setSelectedStatus(option.value)}
                                >
                                    <FontAwesome6
                                        name={option.icon}
                                        size={13}
                                        color={
                                            selectedStatus === option.value
                                                ? BLUE
                                                : SECONDARY_TEXT
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.statusOptionText,
                                            selectedStatus === option.value &&
                                            styles.statusOptionTextActive,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* SORT */}
                        <Text style={styles.fieldLabel}>Sort By Date</Text>
                        <View style={styles.statusOptions}>

                            <TouchableOpacity
                                style={[
                                    styles.statusOption,
                                    sortOrder === "Newest" && styles.statusOptionActive,
                                ]}
                                onPress={() => setSortOrder("Newest")}
                            >
                                <FontAwesome6
                                    name="arrow-down-wide-short"
                                    size={13}
                                    color={sortOrder === "Newest" ? BLUE : SECONDARY_TEXT}
                                />
                                <Text
                                    style={[
                                        styles.statusOptionText,
                                        sortOrder === "Newest" && styles.statusOptionTextActive,
                                    ]}
                                >
                                    Newest First
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.statusOption,
                                    sortOrder === "Oldest" && styles.statusOptionActive,
                                ]}
                                onPress={() => setSortOrder("Oldest")}
                            >
                                <FontAwesome6
                                    name="arrow-up-wide-short"
                                    size={13}
                                    color={sortOrder === "Oldest" ? BLUE : SECONDARY_TEXT}
                                />
                                <Text
                                    style={[
                                        styles.statusOptionText,
                                        sortOrder === "Oldest" && styles.statusOptionTextActive,
                                    ]}
                                >
                                    Oldest First
                                </Text>
                            </TouchableOpacity>

                        </View>

                        {/* ACTIONS */}
                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    setSelectedStatus(2);
                                    setSortOrder("Newest");
                                    setFromDate(new Date());
                                    setToDate(new Date());
                                    setShowFilter(false);
                                    fetchOrders();
                                }}
                            >
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => {
                                    if (fromDate > toDate) {
                                        Toast.show({
                                            type: "error",
                                            text1: "Invalid Date Range",
                                            text2: "From Date cannot be after To Date.",
                                        });
                                        return;
                                    }
                                    setShowFilter(false);
                                    fetchOrders();
                                }}
                            >
                                <FontAwesome6 name="filter" size={13} color="#FFFFFF" />
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>

                        </View>

                    </View>
                </View>
            </Modal>

            {/* =================================================
                APPROVE CONFIRM MODAL
            ================================================= */}

            <ConfirmModal
                visible={showApproveModal}
                title="Approve Order?"
                message="Are you sure you want to approve this order? This action cannot be undone."
                confirmText="Approve"
                onCancel={() => setShowApproveModal(false)}
                onConfirm={handleApproveOrder}
                loading={loading}
            />

        </SafeAreaView>
    );
};

export default ApproveCustomerOrder;


// =====================================================
// STYLES  (matched to PaymentEntryList)
// =====================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },

    // FILTER BAR
    filterBar: {
        minHeight: 44,
        paddingHorizontal: 10,
        marginTop: 3,
        marginBottom: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    filterButton: {
        height: 33,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#DCE8F7",
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    filterButtonText: {
        fontSize: 10,
        fontWeight: "600",
        color: BLUE,
    },

    dateBadge: {
        flex: 1,
        minWidth: 0,
        height: 33,
        paddingHorizontal: 6,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E7EBF0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },

    dateBadgeText: {
        fontSize: 8,
        color: "#626B78",
        fontWeight: "600",
    },

    statusBadge: {
        height: 33,
        paddingHorizontal: 7,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E7EBF0",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    statusBadgeText: {
        fontSize: 8,
        fontWeight: "600",
        color: "#555E6B",
    },

    sortIconButton: {
        width: 33,
        height: 33,
        borderRadius: 8,
        backgroundColor: BLUE,
        alignItems: "center",
        justifyContent: "center",
    },

    // SUMMARY
    summaryCard: {
        marginHorizontal: 10,
        marginBottom: 6,
        paddingHorizontal: 9,
        paddingVertical: 7,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E7ED",
        borderRadius: 9,
    },

    summaryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    summaryTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    summaryTitle: {
        fontSize: 10,
        fontWeight: "700",
        color: TEXT,
    },

    entryCount: {
        fontSize: 8,
        color: SECONDARY_TEXT,
        fontWeight: "500",
    },

    summaryDivider: {
        height: 1,
        backgroundColor: "#EEF1F4",
        marginVertical: 6,
    },

    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    summaryItem: {
        flex: 1,
        alignItems: "center",
        borderRightWidth: 1,
        borderRightColor: "#EEF1F4",
    },

    lastSummaryItem: {
        borderRightWidth: 0,
    },

    summaryLabel: {
        fontSize: 7,
        color: SECONDARY_TEXT,
        fontWeight: "600",
        marginBottom: 1,
    },

    summaryValue: {
        fontSize: 11,
        color: TEXT,
        fontWeight: "700",
    },

    summaryAmount: {
        fontSize: 12,
        color: BLUE,
        fontWeight: "800",
    },

    // TABLE
    tableWrapper: {
        flex: 1,
        marginHorizontal: 10,
        marginBottom: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#C9D0D8",
        borderRadius: 7,
        overflow: "hidden",
        marginBottom: 50
    },

    horizontalContent: {
        flexGrow: 1,
    },

    table: {
        width: "100%",
        flex: 1,
    },

    tableHeader: {
        height: 34,
        flexDirection: "row",
        backgroundColor: "#F1F4F7",
        borderBottomWidth: 1,
        borderBottomColor: "#BFC6CE",
    },

    headerCell: {
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRightWidth: 1,
        borderRightColor: "#D2D7DD",
        paddingHorizontal: 3,
    },

    headerText: {
        fontSize: 8.5,
        fontWeight: "700",
        color: "#3F4650",
        textAlign: "center",
    },

    customerCell: {
        width: 105,
        alignItems: "flex-start",
        paddingLeft: 7,
    },

    dateCell: {
        width: 78,
    },

    quantityCell: {
        width: 78,
    },

    actionCell: {
        width: 60,
        borderRightWidth: 0,
    },

    verticalTableScroll: {
        flex: 1,
    },

    tableRow: {
        height: 44,
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E4E8",
    },

    cell: {
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRightWidth: 1,
        borderRightColor: "#E0E4E8",
        paddingHorizontal: 3,
    },

    customerText: {
        width: "100%",
        fontSize: 10,
        fontWeight: "600",
        color: TEXT,
    },

    entryText: {
        fontSize: 7,
        color: "#9AA2AD",
        marginTop: 1,
    },

    dateText: {
        fontSize: 8.5,
        fontWeight: "500",
        color: "#555E6B",
        textAlign: "center",
    },

    quantityWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    quantityText: {
        fontSize: 10,
        fontWeight: "800",
        color: TEXT,
    },

    approveButton: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: BLUE,
        alignItems: "center",
        justifyContent: "center",
    },

    approvedBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#EAF7EE",
        alignItems: "center",
        justifyContent: "center",
    },

    // EMPTY
    emptyContainer: {
        width: 380,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 70,
        paddingBottom: 70,
        paddingHorizontal: 20,
    },

    emptyIcon: {
        width: 58,
        height: 58,
        borderRadius: 16,
        backgroundColor: "#EAF3FF",
        borderWidth: 1,
        borderColor: "#D8E8FA",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    emptyTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: TEXT,
    },

    emptyText: {
        marginTop: 5,
        fontSize: 10,
        color: SECONDARY_TEXT,
        textAlign: "center",
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
        color: TEXT,
    },

    modalSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: SECONDARY_TEXT,
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
        borderColor: BORDER,
        borderRadius: 10,
        paddingHorizontal: 13,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#FAFBFC",
    },

    statusOptions: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 4,
    },

    statusOption: {
        flex: 1,
        height: 46,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#FAFBFC",
        paddingHorizontal: 4,
    },

    statusOptionActive: {
        borderColor: BLUE,
        backgroundColor: "#F0F7FF",
    },

    statusOptionText: {
        fontSize: 11,
        fontWeight: "600",
        color: SECONDARY_TEXT,
    },

    statusOptionTextActive: {
        color: BLUE,
    },

    modalActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 24,
    },

    clearButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#CBDFF6",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    clearButtonText: {
        color: BLUE,
        fontSize: 13,
        fontWeight: "700",
    },

    applyButton: {
        flex: 2,
        height: 50,
        borderRadius: 12,
        backgroundColor: BLUE,
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

});