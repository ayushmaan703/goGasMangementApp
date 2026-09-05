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
    RefreshControl,
    Modal,
    Alert,
    ScrollView,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import CustomNavBar from "../../helper/CustomNavBar";
import ConfirmModal from "../../helper/ConfirmModal";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
    getCustomerOrderEntry,
    approveCustomerOrderEntry,
} from "../../store/slice/OrderingCustomer.slice";

const formatApiDate = (date) => {
    if (!date) return null;
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
    if (!dateString) return "-";
    const value = String(dateString).trim();
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

const ApproveCustomerOrder = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const currUser = useSelector((state) => state.auth.userData);
    const orders = useSelector((state) => state.orderingCustomer.customerOrderList) || [];
    const loading = useSelector((state) => state.orderingCustomer.loading);

    const comid = currUser?.Comid;

    const [refreshing, setRefreshing] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [sortOrder, setSortOrder] = useState("Newest");
    const [selectedStatus, setSelectedStatus] = useState(2);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const statusOptions = [
        { label: "All", value: 2 },
        { label: "Completed", value: 1 },
        { label: "Pending", value: 0 },
    ];

    const fetchOrders = useCallback(async () => {
        if (!comid || !currUser?.EmpId) return;
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

    const sortedOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];
        return [...orders].sort((a, b) => {
            const dateA = parseApiDate(a?.OrderDate);
            const dateB = parseApiDate(b?.OrderDate);
            return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
        });
    }, [orders, sortOrder]);

    const totalOrders = sortedOrders.length;
    const totalCylinders = sortedOrders.reduce(
        (total, item) => total + Number(item?.OrderQty || 0),
        0
    );
    const completedOrdersCount = sortedOrders.filter(
        (item) => Number(item?.OrderStatus) === 1
    ).length;

    const handleApproveOrder = async () => {
        const res = await dispatch(
            approveCustomerOrderEntry({ comid, id: selectedOrderId })
        );

        if (res?.type === "approveCustomerOrder/rejected") {
            Toast.show({
                type: "customNotificationError",
                text1: res?.error?.message || "Error Occurred",
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

    const renderEntry = (item, index) => {
        const entryId = item?.EntryID || item?.EntryId || "-";
        const orderDate = item?.OrderDate || "";
        const quantity = item?.OrderQty || 0;
        const customer = item?.Customer || "Customer";
        const status = Number(item?.OrderStatus || 0);
        const isAlternate = index % 2 === 1;

        return (
            <View key={entryId} style={[styles.tableRow, isAlternate && styles.tableRowAlt]}>
                <View style={[styles.cell, styles.customerCell]}>
                    <Text style={styles.customerText} numberOfLines={1}>
                        {customer}
                    </Text>
                    <Text style={styles.entryText}>#{entryId}</Text>
                </View>

                <View style={[styles.cell, styles.dateCell]}>
                    <Text style={styles.cellText}>{formatDisplayDate(orderDate)}</Text>
                </View>

                <View style={[styles.cell, styles.quantityCell]}>
                    <View style={styles.quantityBadge}>
                        <MaterialIcons name="propane-tank" size={12} color="#0D6EFD" />
                        <Text style={styles.quantityText}>{quantity}</Text>
                    </View>
                </View>

                <View style={[styles.cell, styles.actionCell]}>
                    {status === 1 ? (
                        <View style={styles.statusSuccessIcon}>
                            <FontAwesome6 name="circle-check" size={13} color="#10B981" />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.completeBtn}
                            onPress={() => {
                                navigation.navigate("Home", {
                                    screen: "CustomerOrderDetails",
                                    params: {
                                        order: item,
                                        complete: true,
                                    },
                                });
                            }}
                        >
                            <FontAwesome6 name="check" size={11} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomNavBar
                navName="Customer Orders"
                subtitle="Review and approve cylinder orders"
            />

            <View style={styles.filterBar}>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
                    <FontAwesome6 name="filter" size={11} color="#0D6EFD" />
                    <Text style={styles.filterButtonText}>Filters</Text>
                    <FontAwesome6 name="chevron-down" size={8} color="#64748B" />
                </TouchableOpacity>

                <View style={styles.statusBadge}>
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor:
                                    selectedStatus === 1
                                        ? "#10B981"
                                        : selectedStatus === 0
                                            ? "#F59E0B"
                                            : "#0D6EFD",
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

                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.btnSecondary}
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
                            size={10}
                            color="#0D6EFD"
                        />
                        <Text style={styles.btnSecondaryText}>
                            {sortOrder === "Newest" ? "Newest" : "Oldest"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.btnPrimary}
                        onPress={() =>
                            navigation.navigate("Home", { screen: "CustomerOrderForm" })
                        }
                    >
                        <FontAwesome6 name="plus" size={11} color="#FFFFFF" />
                        <Text style={styles.btnPrimaryText}>Create</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.summaryBar}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryBoxLabel}>ORDERS</Text>
                    <Text style={styles.summaryBoxVal}>{totalOrders}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryBoxLabel}>CYLINDERS</Text>
                    <Text style={styles.summaryBoxVal}>{totalCylinders}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryBoxLabel}>COMPLETED</Text>
                    <Text style={styles.summaryBoxVal}>{completedOrdersCount}</Text>
                </View>
                <View style={[styles.summaryBox, styles.summaryBoxHighlight]}>
                    <Text style={[styles.summaryBoxLabel, styles.summaryHighlightLabel]}>SCOPE</Text>
                    <Text style={styles.summaryHighlightVal}>
                        {selectedStatus === 0
                            ? "Pending"
                            : selectedStatus === 1
                                ? "Completed"
                                : "All"}
                    </Text>
                </View>
            </View>

            <View style={styles.gridContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator
                    bounces={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                >
                    <View style={styles.sheetTable}>
                        <View style={styles.gridHeaderRow}>
                            <View style={[styles.headerCol, styles.customerCell]}>
                                <Text style={styles.headerLabel}>CUSTOMER</Text>
                            </View>
                            <View style={[styles.headerCol, styles.dateCell]}>
                                <Text style={styles.headerLabel}>DATE</Text>
                            </View>
                            <View style={[styles.headerCol, styles.quantityCell]}>
                                <Text style={styles.headerLabel}>CYLINDERS</Text>
                            </View>
                            <View style={[styles.headerCol, styles.actionCell]}>
                                <Text style={styles.headerLabel}>FINISH</Text>
                            </View>
                        </View>

                        <ScrollView
                            style={styles.gridBodyScroll}
                            showsVerticalScrollIndicator
                            nestedScrollEnabled
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="#0D6EFD"
                                    colors={["#0D6EFD"]}
                                />
                            }
                        >
                            {sortedOrders.length > 0 ? (
                                sortedOrders.map((item, index) => renderEntry(item, index))
                            ) : (
                                <View style={styles.emptyView}>
                                    <View style={styles.emptyIconWrap}>
                                        <MaterialIcons name="propane-tank" size={24} color="#0D6EFD" />
                                    </View>
                                    <Text style={styles.emptyTitle}>No Orders Found</Text>
                                    <Text style={styles.emptySubtitle}>
                                        No cylinder orders match your selected filters.
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>

            <Modal
                visible={showFilter}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFilter(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.filterModal}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Filter Register</Text>
                                <Text style={styles.modalSubtitle}>Configure scope and entry statuses</Text>
                            </View>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowFilter(false)}>
                                <FontAwesome6 name="xmark" size={14} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.filterSectionLabel}>FROM DATE</Text>
                        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowFromPicker(true)}>
                            <FontAwesome6 name="calendar-days" size={13} color="#0D6EFD" />
                            <Text style={styles.datePickerText}>{formatDisplayDate(fromDate)}</Text>
                        </TouchableOpacity>

                        {showFromPicker && (
                            <DateTimePicker
                                value={fromDate}
                                mode="date"
                                display="default"
                                onChange={handleFromDateChange}
                            />
                        )}

                        <Text style={styles.filterSectionLabel}>TO DATE</Text>
                        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowToPicker(true)}>
                            <FontAwesome6 name="calendar-days" size={13} color="#0D6EFD" />
                            <Text style={styles.datePickerText}>{formatDisplayDate(toDate)}</Text>
                        </TouchableOpacity>

                        {showToPicker && (
                            <DateTimePicker
                                value={toDate}
                                mode="date"
                                display="default"
                                onChange={handleToDateChange}
                            />
                        )}

                        <Text style={styles.filterSectionLabel}>ORDER STATUS</Text>
                        <View style={styles.segmentedRow}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.segmentBtn,
                                        selectedStatus === option.value && styles.segmentBtnActive,
                                    ]}
                                    onPress={() => setSelectedStatus(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            selectedStatus === option.value && styles.segmentTextActive,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.filterSectionLabel}>SORT ORDER</Text>
                        <View style={styles.segmentedRow}>
                            <TouchableOpacity
                                style={[styles.segmentBtn, sortOrder === "Newest" && styles.segmentBtnActive]}
                                onPress={() => setSortOrder("Newest")}
                            >
                                <Text
                                    style={[
                                        styles.segmentText,
                                        sortOrder === "Newest" && styles.segmentTextActive,
                                    ]}
                                >
                                    Newest
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.segmentBtn, sortOrder === "Oldest" && styles.segmentBtnActive]}
                                onPress={() => setSortOrder("Oldest")}
                            >
                                <Text
                                    style={[
                                        styles.segmentText,
                                        sortOrder === "Oldest" && styles.segmentTextActive,
                                    ]}
                                >
                                    Oldest
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity
                                style={styles.clearBtn}
                                onPress={() => {
                                    setSelectedStatus(2);
                                    setSortOrder("Newest");
                                    setFromDate(new Date());
                                    setToDate(new Date());
                                    setShowFilter(false);
                                    fetchOrders();
                                }}
                            >
                                <Text style={styles.clearBtnText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => {
                                    if (fromDate > toDate) {
                                        Alert.alert("Invalid Range", "From date cannot precede To date.");
                                        return;
                                    }
                                    setShowFilter(false);
                                    fetchOrders();
                                }}
                            >
                                <FontAwesome6 name="check" size={13} color="#FFFFFF" />
                                <Text style={styles.applyBtnText}>Apply Filter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    filterBar: {
        paddingHorizontal: 10,
        marginTop:16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    filterButton: {
        height: 32,
        paddingHorizontal: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#BFDBFE",
        backgroundColor: "#EFF6FF",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    filterButtonText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#0D6EFD",
    },
    statusBadge: {
        height: 32,
        paddingHorizontal: 9,
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#475569",
    },
    headerButtons: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 6,
    },
    btnSecondary: {
        height: 32,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#BFDBFE",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    btnSecondaryText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#0D6EFD",
    },
    btnPrimary: {
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: "#0D6EFD",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    btnPrimaryText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    summaryBar: {
        marginHorizontal: 10,
        marginBottom: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 6,
        flexDirection: "row",
        overflow: "hidden",
    },
    summaryBox: {
        flex: 1,
        paddingVertical: 6,
        alignItems: "center",
        borderRightWidth: 1,
        borderRightColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
    },
    summaryBoxHighlight: {
        borderRightWidth: 0,
        backgroundColor: "#F0F7FF",
    },
    summaryBoxLabel: {
        fontSize: 8,
        fontWeight: "700",
        color: "#64748B",
        letterSpacing: 0.5,
        marginBottom: 1,
    },
    summaryHighlightLabel: {
        color: "#0D6EFD",
    },
    summaryBoxVal: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0F172A",
    },
    summaryHighlightVal: {
        fontSize: 11,
        fontWeight: "800",
        color: "#0D6EFD",
    },
    gridContainer: {
        flex: 1,
        marginHorizontal: 10,
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#94A3B8",
        borderRadius: 6,
        overflow: "hidden",
    },
    horizontalScrollContent: {
        flexGrow: 1,
    },
    sheetTable: {
        minWidth: "100%",
        flex: 1,
    },
    gridHeaderRow: {
        height: 32,
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        borderBottomWidth: 1.5,
        borderBottomColor: "#94A3B8",
    },
    headerCol: {
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRightWidth: 1,
        borderRightColor: "#CBD5E1",
        paddingHorizontal: 6,
    },
    headerLabel: {
        fontSize: 9,
        fontWeight: "800",
        color: "#1E293B",
        letterSpacing: 0.4,
    },
    gridBodyScroll: {
        flex: 1,
    },
    tableRow: {
        height: 38,
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    tableRowAlt: {
        backgroundColor: "#F8FAFC",
    },
    cell: {
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRightWidth: 1,
        borderRightColor: "#E2E8F0",
        paddingHorizontal: 6,
    },
    customerCell: {
        width: 125,
        alignItems: "flex-start",
        paddingLeft: 8,
    },
    customerText: {
        width: "100%",
        fontSize: 11,
        fontWeight: "600",
        color: "#0F172A",
    },
    entryText: {
        fontSize: 8,
        fontWeight: "500",
        color: "#64748B",
    },
    dateCell: {
        width: 70,
    },
    cellText: {
        fontSize: 10,
        fontWeight: "500",
        color: "#334155",
        textAlign: "center",
    },
    quantityCell: {
        width: 85,
    },
    quantityBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    quantityText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#0F172A",
    },
    actionCell: {
        width: 55,
        borderRightWidth: 0,
    },
    completeBtn: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: "#0D6EFD",
        alignItems: "center",
        justifyContent: "center",
    },
    statusSuccessIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#A7F3D0",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    emptyIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
    },
    emptySubtitle: {
        marginTop: 3,
        fontSize: 10,
        color: "#64748B",
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    filterModal: {
        width: "100%",
        maxWidth: 380,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 20,
        elevation: 10,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#0F172A",
    },
    modalSubtitle: {
        marginTop: 2,
        fontSize: 11,
        color: "#64748B",
    },
    closeBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    filterSectionLabel: {
        fontSize: 9,
        fontWeight: "800",
        color: "#475569",
        letterSpacing: 0.5,
        marginTop: 10,
        marginBottom: 6,
    },
    datePickerBtn: {
        height: 40,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#F8FAFC",
    },
    datePickerText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#0F172A",
    },
    segmentedRow: {
        flexDirection: "row",
        gap: 8,
    },
    segmentBtn: {
        flex: 1,
        height: 36,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
    },
    segmentBtnActive: {
        borderColor: "#0D6EFD",
        backgroundColor: "#EFF6FF",
    },
    segmentText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },
    segmentTextActive: {
        color: "#0D6EFD",
    },
    modalActionRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 18,
    },
    clearBtn: {
        flex: 1,
        height: 42,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
    },
    clearBtnText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
    },
    applyBtn: {
        flex: 2,
        height: 42,
        borderRadius: 8,
        backgroundColor: "#0D6EFD",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    applyBtnText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
});

export default ApproveCustomerOrder;