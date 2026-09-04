import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
} from "react-native";

import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";

import CustomNavBar from "../../helper/CustomNavBar";
import { getCustomerOrderEntry } from "../../store/slice/OrderingCustomer.slice";

// =====================================================
// COLORS
// =====================================================

const PURPLE = "#8B5CF6";
const DARK_PURPLE = "#5B21B6";
const LIGHT_PURPLE = "#F3EEFF";

const BACKGROUND = "#F6F9FD";
const TEXT = "#253142";
const SECONDARY_TEXT = "#7A8493";
const BORDER = "#E7EDF4";

// =====================================================
// DATE HELPERS
// =====================================================

const formatApiDate = (date) => {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

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
    if (isNaN(date.getTime())) return dateString;

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

const CustomerOrderList = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const currUser = useSelector((state) => state.auth.userData);
    const orders = useSelector((state) => state.orderingCustomer.customerOrderList) || [];
    const loading = useSelector((state) => state.orderingCustomer.loading);

    const comid = currUser?.Comid;

    // =================================================
    // STATE
    // =================================================

    const [refreshing, setRefreshing] = useState(false);
    const [filterModal, setFilterModal] = useState(false);

    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("Newest");

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [datePicker, setDatePicker] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState(2);

    const statusOptions = [
        { label: "All", value: 2 },
        { label: "Completed", value: 1 },
        { label: "Pending", value: 0 },
    ];

    // =================================================
    // FETCH ORDERS
    // =================================================

     const fetchOrders = useCallback(async () => {
        if (!comid || !currUser?.EmpId) return;

        const payload = {
            FromDate: formatApiDate(fromDate),
            Todate: formatApiDate(toDate),
            Comid: comid,
            CustomerId: currUser.EmpId,
            OrderStatus: selectedStatus,
        };

        /*
         * IMPORTANT: Status does not exist in the response.
         * Only send OrderStatus when Pending is selected.
         * All = don't send OrderStatus
         */

        await dispatch(getCustomerOrderEntry(payload));
    }, [dispatch, comid, currUser?.EmpId, statusFilter, fromDate, toDate, selectedStatus]);

    // =================================================
    // INITIAL / FOCUS FETCH
    // =================================================

    useEffect(() => {
        if (isFocused) fetchOrders();
    }, [isFocused, fetchOrders]);

    // =================================================
    // REFRESH
    // =================================================

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    // =================================================
    // APPLY / CLEAR FILTER
    // =================================================

    const applyFilters = async () => {
        setFilterModal(false);
        await fetchOrders();
    };

    const clearFilters = async () => {
        setStatusFilter("All");
        setSortOrder("Newest");
        setFromDate(new Date());
        setToDate(new Date());
        setSelectedStatus(2);
        setFilterModal(false);

        await fetchOrders();
    };

    // =================================================
    // DATE PICKER
    // =================================================

    const handleDateChange = (event, selectedDate) => {
        setDatePicker(null);

        if (!selectedDate) return;

        if (datePicker === "from") {
            setFromDate(selectedDate);

            // If To Date is before From Date, automatically move To Date.
            if (toDate && selectedDate > toDate) {
                setToDate(selectedDate);
            }
        }

        if (datePicker === "to") {
            if (fromDate && selectedDate < fromDate) {
                Toast.show({
                    type: "error",
                    text1: "Invalid Date",
                    text2: "To Date cannot be before From Date.",
                });
                return;
            }

            setToDate(selectedDate);
        }
    };

    // =================================================
    // SORT ORDERS
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
    // NEW ORDER
    // =================================================

    const handleNewOrder = () => {
        navigation.navigate("CustomerOrderForm", { mode: "create" });
    };

    // =================================================
    // COUNTS
    // =================================================

    /*
     * Since the API does not return status, these counts are based on
     * the CURRENT FILTER. Pending count is reliable when Pending filter
     * is selected. We do NOT pretend to know completed status from the
     * returned object.
     */

    const totalOrders = sortedOrders.length;

    // =================================================
    // CARD
    // =================================================

    const renderOrder = ({ item }) => {
        const entryId = item?.EntryID || item?.EntryId || "";
        const orderDate = item?.OrderDate || "";
        const quantity = item?.OrderQty || 0;

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.card}
                onPress={() =>
                    navigation.navigate("CustomerOrderDetails", { order: item })
                }
            >
                {/* HEADER */}
                <View style={styles.cardHeader}>
                    {/* LEFT */}
                    <View style={styles.orderHeaderLeft}>
                        <View style={styles.orderIcon}>
                            <MaterialIcons
                                name="propane-tank"
                                size={18}
                                color={PURPLE}
                            />
                        </View>

                        <View style={styles.headerText}>
                            <Text style={styles.orderTitle}>Cylinder Order</Text>
                            <Text style={styles.entryText}>
                                Order #{entryId}
                            </Text>
                        </View>
                    </View>

                    {/* STATUS */}
                    <View
                        style={[
                            styles.statusBadge,
                            item.OrderStatus == 0
                                ? styles.pendingBadge
                                : styles.completedBadge,
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                item.OrderStatus == 0
                                    ? styles.pendingDot
                                    : styles.completedDot,
                            ]}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                item.OrderStatus == 0
                                    ? styles.pendingText
                                    : styles.completedText,
                            ]}
                        >
                            {item.OrderStatus == 0 ? "Pending" : "Completed"}
                        </Text>
                    </View>

                    {/* ARROW */}
                    <FontAwesome6
                        name="chevron-right"
                        size={13}
                        color={PURPLE}
                    />
                </View>

                <View style={styles.divider} />

                {/* INFORMATION */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <FontAwesome6
                            name="calendar-days"
                            size={14}
                            color={PURPLE}
                        />

                        <View>
                            <Text style={styles.infoLabel}>Order Date</Text>
                            <Text style={styles.infoValue}>
                                {formatDisplayDate(orderDate)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <MaterialIcons
                            name="propane-tank"
                            size={14}
                            color={PURPLE}
                        />

                        <View>
                            <Text style={styles.infoLabel}>Cylinders</Text>
                            <Text style={styles.infoValue}>{quantity}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // =================================================
    // EMPTY
    // =================================================

    const renderEmpty = () => {
        if (loading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={PURPLE} />
                    <Text style={styles.emptyTitle}>Loading Orders...</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                    <MaterialIcons name="propane-tank" size={28} color={PURPLE} />
                </View>

                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptyText}>No cylinder orders match your selected filters.</Text>

                <TouchableOpacity style={styles.emptyButton} onPress={handleNewOrder}>
                    <FontAwesome6 name="plus" size={14} color="#FFFFFF" />
                    <Text style={styles.emptyButtonText}>Place New Order</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // =================================================
    // ACTIVE FILTER COUNT
    // =================================================

    const isSameDate = (date1, date2) => {
        if (!date1 || !date2) return false;

        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const today = new Date();

    const activeFilterCount =
        (selectedStatus !== 2 ? 1 : 0) +
        (!isSameDate(fromDate, today) ? 1 : 0) +
        (!isSameDate(toDate, today) ? 1 : 0);

    // =================================================
    // UI
    // =================================================

    return (
        <SafeAreaView style={styles.container}>
            <CustomNavBar navName="My Orders" subtitle="Manage your cylinder orders" />

            {/* SUMMARY */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{totalOrders}</Text>
                    <Text style={styles.summaryLabel}>
                        {selectedStatus === 0 ? "Pending Orders" : selectedStatus === 1 ? "Completed Orders" : "Orders"}
                    </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryItem}>
                    <View style={styles.filterSummaryIcon}>
                        <FontAwesome6
                            name={selectedStatus === 0 ? "clock" : selectedStatus === 1 ? "circle-check" : "filter"}
                            size={13}
                            color={PURPLE}
                        />
                    </View>

                    <Text style={styles.summaryLabel}>
                        {selectedStatus === 0 ? "Pending" : selectedStatus === 1 ? "Completed" : "All"}
                    </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryItem}>
                    <View style={styles.filterSummaryIcon}>
                        <FontAwesome6
                            name={sortOrder === "Newest" ? "arrow-down-wide-short" : "arrow-up-wide-short"}
                            size={13}
                            color={PURPLE}
                        />
                    </View>

                    <Text style={styles.summaryLabel}>{sortOrder}</Text>
                </View>
            </View>

            {/* TITLE + FILTER */}
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>Recent Orders</Text>
                    <Text style={styles.sectionSubtitle}>Your cylinder order history</Text>
                </View>

                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModal(true)}>
                        <FontAwesome6 name="filter" size={13} color="#FFFFFF" />
                        <Text style={styles.filterButtonText}>Filter</Text>

                        {activeFilterCount > 0 && (
                            <View style={styles.filterCount}>
                                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* ACTIVE FILTER CHIPS */}
            {(statusFilter !== "All" || fromDate || toDate) && (
                <View style={styles.chipsContainer}>
                    {statusFilter !== "All" && (
                        <View style={styles.filterChip}>
                            <FontAwesome6 name="clock" size={10} color={DARK_PURPLE} />
                            <Text style={styles.filterChipText}>Pending</Text>

                            <TouchableOpacity
                                onPress={() => {
                                    setStatusFilter("All");
                                    fetchOrders();
                                }}
                            >
                                <FontAwesome6 name="xmark" size={10} color={DARK_PURPLE} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {fromDate && (
                        <View style={styles.filterChip}>
                            <FontAwesome6 name="calendar" size={10} color={DARK_PURPLE} />
                            <Text style={styles.filterChipText}>From: {formatDisplayDate(fromDate)}</Text>
                        </View>
                    )}

                    {toDate && (
                        <View style={styles.filterChip}>
                            <FontAwesome6 name="calendar" size={10} color={DARK_PURPLE} />
                            <Text style={styles.filterChipText}>To: {formatDisplayDate(toDate)}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* LIST */}
            <FlatList
                data={sortedOrders}
                keyExtractor={(item, index) => String(item?.EntryID ?? item?.EntryId ?? index)}
                renderItem={renderOrder}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.listContent, sortedOrders.length === 0 && styles.emptyListContent]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PURPLE} colors={[PURPLE]} />
                }
            />

            {/* =================================================
                FILTER MODAL
            ================================================= */}
            <Modal visible={filterModal} transparent animationType="slide" onRequestClose={() => setFilterModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.filterModal}>
                        {/* MODAL HEADER */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Filter Orders</Text>
                                <Text style={styles.modalSubtitle}>Choose how you want to view your orders</Text>
                            </View>

                            <TouchableOpacity style={styles.closeButton} onPress={() => setFilterModal(false)}>
                                <FontAwesome6 name="xmark" size={16} color={SECONDARY_TEXT} />
                            </TouchableOpacity>
                        </View>

                        {/* STATUS */}
                        <Text style={styles.filterLabel}>ORDER STATUS</Text>

                        <View style={styles.statusOptions}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.statusOption,
                                        selectedStatus === option.value && styles.statusOptionActive,
                                    ]}
                                    onPress={() => setSelectedStatus(option.value)}
                                >
                                    <FontAwesome6
                                        name={selectedStatus === option.value ? "circle-check" : "circle"}
                                        size={18}
                                        color={selectedStatus === option.value ? PURPLE : "#94A3B8"}
                                    />

                                    <Text
                                        style={[
                                            styles.statusOptionText,
                                            selectedStatus === option.value && styles.statusOptionTextActive,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* DATE */}
                        <Text style={styles.filterLabel}>DATE RANGE</Text>

                        <View style={styles.dateRow}>
                            <TouchableOpacity style={styles.dateButton} onPress={() => setDatePicker("from")}>
                                <FontAwesome6 name="calendar-days" size={14} color={PURPLE} />

                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateLabel}>From Date</Text>
                                    <Text style={styles.dateValue}>
                                        {fromDate ? formatDisplayDate(fromDate) : "Select date"}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.dateButton} onPress={() => setDatePicker("to")}>
                                <FontAwesome6 name="calendar-days" size={14} color={PURPLE} />

                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateLabel}>To Date</Text>
                                    <Text style={styles.dateValue}>
                                        {toDate ? formatDisplayDate(toDate) : "Select date"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* SORT */}
                        <Text style={styles.filterLabel}>SORT BY DATE</Text>

                        <View style={styles.sortOptions}>
                            <TouchableOpacity
                                style={[styles.sortOption, sortOrder === "Newest" && styles.selectedSort]}
                                onPress={() => setSortOrder("Newest")}
                            >
                                <FontAwesome6
                                    name="arrow-down-wide-short"
                                    size={15}
                                    color={sortOrder === "Newest" ? DARK_PURPLE : SECONDARY_TEXT}
                                />
                                <Text style={[styles.sortText, sortOrder === "Newest" && styles.selectedSortText]}>
                                    Newest First
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sortOption, sortOrder === "Oldest" && styles.selectedSort]}
                                onPress={() => setSortOrder("Oldest")}
                            >
                                <FontAwesome6
                                    name="arrow-up-wide-short"
                                    size={15}
                                    color={sortOrder === "Oldest" ? DARK_PURPLE : SECONDARY_TEXT}
                                />
                                <Text style={[styles.sortText, sortOrder === "Oldest" && styles.selectedSortText]}>
                                    Oldest First
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* ACTION BUTTONS */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                                <FontAwesome6 name="check" size={13} color="#FFFFFF" />
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* DATE PICKER */}
            {datePicker && (
                <DateTimePicker
                    value={datePicker === "from" ? fromDate || new Date() : toDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
        </SafeAreaView>
    );
};

export default CustomerOrderList;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },

    // SUMMARY
    summaryCard: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginTop: 14,
        borderRadius: 17,
        paddingVertical: 17,
        flexDirection: "row",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    summaryItem: { flex: 1, alignItems: "center" },
    summaryNumber: { fontSize: 22, fontWeight: "900", color: DARK_PURPLE },
    summaryLabel: { marginTop: 4, fontSize: 10, color: SECONDARY_TEXT, fontWeight: "700" },
    summaryDivider: { width: 1, height: 34, backgroundColor: "#E8EDF3" },
    filterSummaryIcon: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: LIGHT_PURPLE,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 3,
    },

    // SECTION HEADER
    sectionHeader: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionTitle: { fontSize: 17, fontWeight: "900", color: TEXT },
    sectionSubtitle: { marginTop: 3, fontSize: 11, color: SECONDARY_TEXT },
    headerButtons: { flexDirection: "row", alignItems: "center" },

    // FILTER BUTTON
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: PURPLE,
        paddingHorizontal: 13,
        paddingVertical: 10,
        borderRadius: 11,
    },
    filterButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
    filterCount: {
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 2,
    },
    filterCountText: { color: DARK_PURPLE, fontSize: 9, fontWeight: "900" },

    // FILTER CHIPS
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: 16,
        marginBottom: 5,
        gap: 7,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: LIGHT_PURPLE,
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 20,
    },
    filterChipText: { fontSize: 9, color: DARK_PURPLE, fontWeight: "700" },

    // LIST
    listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 },
    emptyListContent: { flexGrow: 1 },

    // CARD
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 17,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    cardHeader: { flexDirection: "row", alignItems: "center" },
    orderIcon: {
        width: 43,
        height: 43,
        borderRadius: 13,
        backgroundColor: LIGHT_PURPLE,
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: { flex: 1, marginLeft: 11 },
    orderTitle: { fontSize: 15, fontWeight: "800", color: TEXT },
    entryText: { marginTop: 3, fontSize: 10, color: SECONDARY_TEXT },

    // DIVIDER
    divider: { height: 1, backgroundColor: "#EEF2F6", marginVertical: 14 },

    // INFORMATION
    infoRow: { flexDirection: "row", justifyContent: "space-between" },
    infoItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },
    infoLabel: { fontSize: 9, color: "#9AA3AF", marginBottom: 2 },
    infoValue: { fontSize: 13, color: TEXT, fontWeight: "700" },

    // FOOTER
    cardFooter: {
        flexDirection: "row",
        gap: 2,
    },
    viewDetails: { fontSize: 10, color: DARK_PURPLE, fontWeight: "800" },

    // EMPTY
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
    emptyIcon: {
        width: 70,
        height: 70,
        borderRadius: 22,
        backgroundColor: LIGHT_PURPLE,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
    },
    emptyTitle: { fontSize: 16, fontWeight: "900", color: TEXT },
    emptyText: { marginTop: 6, textAlign: "center", fontSize: 11, color: SECONDARY_TEXT, lineHeight: 18 },
    emptyButton: {
        marginTop: 18,
        backgroundColor: PURPLE,
        borderRadius: 11,
        paddingHorizontal: 15,
        paddingVertical: 11,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    emptyButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
    orderHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        marginRight: 12,
    },

    pendingBadge: {
        backgroundColor: "#FFF4E5",
    },

    completedBadge: {
        backgroundColor: "#EAF8F0",
    },

    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginRight: 6,
    },

    pendingDot: {
        backgroundColor: "#F59E0B",
    },

    completedDot: {
        backgroundColor: "#22C55E",
    },

    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },

    pendingText: {
        color: "#D97706",
    },

    completedText: {
        color: "#16A34A",
    },
    // =================================================
    // MODAL
    // =================================================

    modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.45)", justifyContent: "flex-end" },
    filterModal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 25,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22,
    },
    modalTitle: { fontSize: 19, fontWeight: "900", color: TEXT },
    modalSubtitle: { fontSize: 10, color: SECONDARY_TEXT, marginTop: 3 },
    closeButton: {
        width: 35,
        height: 35,
        borderRadius: 12,
        backgroundColor: "#F5F6F8",
        alignItems: "center",
        justifyContent: "center",
    },

    // FILTER LABEL
    filterLabel: {
        fontSize: 9,
        fontWeight: "900",
        color: "#8A94A3",
        letterSpacing: 0.7,
        marginBottom: 9,
        marginTop: 4,
    },

    // STATUS OPTIONS
    // NOTE: these three were referenced in the JSX but never defined —
    // that's why the selected status never highlighted. Fixed here.
    statusOptions: { flexDirection: "row", gap: 10, marginBottom: 20 },
    statusOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 14,
        padding: 11,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },
    statusOptionActive: {
        backgroundColor: LIGHT_PURPLE,
        borderColor: PURPLE,
    },
    statusOptionText: { fontSize: 11, color: TEXT, fontWeight: "700" },
    statusOptionTextActive: { color: DARK_PURPLE },

    // DATE
    dateRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    dateButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 13,
        padding: 11,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },
    dateTextContainer: { flex: 1 },
    dateLabel: { fontSize: 8, color: "#9AA3AF", fontWeight: "700" },
    dateValue: { fontSize: 10, color: TEXT, fontWeight: "700", marginTop: 3 },

    // SORT
    sortOptions: { flexDirection: "row", gap: 10, marginBottom: 22 },
    sortOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 12,
        paddingVertical: 11,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    selectedSort: { backgroundColor: LIGHT_PURPLE, borderColor: "#C4B5FD" },
    sortText: { fontSize: 10, color: SECONDARY_TEXT, fontWeight: "700" },
    selectedSortText: { color: DARK_PURPLE },

    // MODAL BUTTONS
    modalActions: { flexDirection: "row", gap: 10 },
    clearButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#DDD6FE",
        borderRadius: 13,
        paddingVertical: 13,
        alignItems: "center",
        justifyContent: "center",
    },
    clearButtonText: { color: DARK_PURPLE, fontSize: 12, fontWeight: "800" },
    applyButton: {
        flex: 2,
        backgroundColor: PURPLE,
        borderRadius: 13,
        paddingVertical: 13,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 7,
    },
    applyButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});