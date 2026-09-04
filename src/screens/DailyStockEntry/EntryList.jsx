import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    Alert,
    RefreshControl,
    ScrollView,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomNavBar from "../../helper/CustomNavBar";
import { useDispatch, useSelector } from "react-redux";
import { delDailyStockEntry, getDailyStockEntry } from "../../store/slice/DailyStockEntry.slice";
import { useIsFocused } from "@react-navigation/native";
import ConfirmModal from "../../helper/ConfirmModal";
import Toast from "react-native-toast-message";

const formatDate = (dateString) => {
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

const formatApiDate = (date) => {
    if (!date) return null;
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const EntryList = ({ navigation }) => {
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const currUser = useSelector((state) => state.auth.userData);
    const gasEntries = useSelector((state) => state.dailyEntry.stockEntryList);
    const loading = useSelector((state) => state.dailyEntry.loading);

    const comid = currUser?.Comid;
    const isAdmin = currUser?.UserType === "Admin";

    const [refreshing, setRefreshing] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [status, setStatus] = useState(0);
    const [adminApprovalstatus, setAdminApprovalStatus] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [customerId, setCustomerId] = useState(null);

    const todayStr = new Date().toDateString();
    const isFilterActive =
        fromDate.toDateString() !== todayStr ||
        toDate.toDateString() !== todayStr ||
        status !== 0 ||
        (isAdmin && adminApprovalstatus !== 0);

    const fetchEntries = async () => {
        await dispatch(
            getDailyStockEntry({
                FromDate: formatApiDate(fromDate),
                Todate: formatApiDate(toDate),
                PendingStatus: status,
                AdminApproval: adminApprovalstatus,
                Comid: comid,
            })
        );
    };

    useEffect(() => {
        fetchEntries();
    }, [fromDate, toDate, status, adminApprovalstatus, dispatch]);

    const handleResetFilters = () => {
        const today = new Date();
        setFromDate(today);
        setToDate(today);
        setStatus(0);
        setAdminApprovalStatus(0);
        setShowFilter(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchEntries();
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            onRefresh();
        }
    }, [isFocused]);

    const totals = (gasEntries || []).reduce(
        (acc, item) => {
            acc.in += Number(item.CycIn || 0);
            acc.out += Number(item.CycOut || 0);
            acc.regulator += Number(item.Regulator || 0);
            acc.balEmpty += Number(item.BalCyc || 0);
            acc.amount += Number(item.Amount || 0);
            return acc;
        },
        { in: 0, out: 0, regulator: 0, balEmpty: 0, amount: 0 }
    );

    const handleDelete = async () => {
        const res = await dispatch(delDailyStockEntry({ comid, id: customerId }));
        if (res.type === "deleteDailyStockEntry/rejected") {
            Toast.show({
                type: "customNotificationError",
                text1: res?.error?.message || "Error Occurred",
                visibilityTime: 2000,
            });
            setShowDeleteModal(false);
            return;
        }
        Toast.show({
            type: "customNotificationSuccess",
            text1: "Daily Stock Entry Deleted Successfully",
            visibilityTime: 2000,
        });
        setShowDeleteModal(false);
        fetchEntries();
    };

    const renderEntry = (item, index) => {
        const isEven = index % 2 === 0;
        return (
            <View key={item.EntryID} style={[styles.tableRow, isEven && styles.tableRowEven]}>
                <View style={[styles.cell, styles.colCustomer]}>
                    <Text style={styles.customerText} numberOfLines={1}>
                        {item.Customer || "-"}
                    </Text>
                    <Text style={styles.entrySubText}>ID: #{item.EntryID}</Text>
                </View>

                <View style={[styles.cell, styles.colNum]}>
                    <Text style={[styles.numberText, Number(item.CycIn) > 0 && styles.inAccentText]}>
                        {item.CycIn ?? 0}
                    </Text>
                </View>

                <View style={[styles.cell, styles.colNum]}>
                    <Text style={[styles.numberText, Number(item.CycOut) > 0 && styles.outAccentText]}>
                        {item.CycOut ?? 0}
                    </Text>
                </View>

                <View style={[styles.cell, styles.colNum]}>
                    <Text style={styles.numberText}>{item.BalCyc ?? 0}</Text>
                </View>

                <View style={[styles.cell, styles.colAmount]}>
                    <Text style={styles.amountText}>
                        ₹{Number(item.Amount || 0).toLocaleString("en-IN")}
                    </Text>
                    {item.paytype ? <Text style={styles.payTypeBadge}>{item.paytype}</Text> : null}
                </View>

                <View style={[styles.cell, styles.colAction]}>
                    {(status === 0 || isAdmin) && (
                        <TouchableOpacity
                            style={styles.actionBtnEdit}
                            onPress={() => {
                                if (status === 1) {
                                    navigation.navigate("Home", {
                                        screen: "AdminApprovalAndEdit",
                                        params: { entry: item, isApproved: adminApprovalstatus },
                                    });
                                } else {
                                    navigation.navigate("DailyStockEntry", { entry: item, isEdit: true });
                                }
                            }}
                        >
                            <FontAwesome6 name="pen-to-square" size={11} color="#0D6EFD" />
                        </TouchableOpacity>
                    )}

                    {status === 0 && (
                        <TouchableOpacity
                            style={styles.actionBtnDelete}
                            onPress={() => {
                                setShowDeleteModal(true);
                                setCustomerId(item.EntryID);
                            }}
                        >
                            <FontAwesome6 name="trash-can" size={11} color="#DC3545" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomNavBar navName="Daily Stock" subtitle="Spreadsheet Register" />

            <View style={styles.filterBar}>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
                    <View style={styles.filterIconWrapper}>
                        <FontAwesome6 name="filter" size={11} color="#0D6EFD" />
                        {isFilterActive && <View style={styles.activeFilterIndicator} />}
                    </View>
                    <Text style={styles.filterButtonText}>Filters</Text>
                    <FontAwesome6 name="chevron-down" size={8} color="#64748B" />
                </TouchableOpacity>

                <View style={styles.statusBadge}>
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: status === 1 ? "#10B981" : "#0D6EFD" },
                        ]}
                    />
                    <Text style={styles.statusBadgeText}>{status === 1 ? "Completed" : "Pending"}</Text>
                </View>

                <View style={styles.headerButtons}>
                    {status === 0 && (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.btnSecondary}
                            onPress={() => navigation.navigate("Home", { screen: "SubmitForm" })}
                        >
                            <FontAwesome6 name="paper-plane" size={10} color="#0D6EFD" />
                            <Text style={styles.btnSecondaryText}>Submit</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.btnPrimary}
                        onPress={() => navigation.navigate("DailyStockEntry")}
                    >
                        <FontAwesome6 name="plus" size={11} color="#FFFFFF" />
                        <Text style={styles.btnPrimaryText}>Create</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.summaryBar}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryBoxLabel}>TOTAL IN</Text>
                    <Text style={[styles.summaryBoxVal, styles.inAccentText]}>{totals.in}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryBoxLabel}>TOTAL OUT</Text>
                    <Text style={[styles.summaryBoxVal, styles.outAccentText]}>{totals.out}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryBoxLabel}>REGULATOR</Text>
                    <Text style={styles.summaryBoxVal}>{totals.regulator}</Text>
                </View>
                <View style={[styles.summaryBox, styles.summaryBoxHighlight]}>
                    <Text style={[styles.summaryBoxLabel, styles.summaryHighlightLabel]}>TOTAL AMOUNT</Text>
                    <Text style={styles.summaryHighlightVal}>
                        ₹{Number(totals.amount).toLocaleString("en-IN")}
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
                            <View style={[styles.headerCol, styles.colCustomer]}>
                                <Text style={styles.headerLabel}>CUSTOMER</Text>
                            </View>
                            <View style={[styles.headerCol, styles.colNum]}>
                                <Text style={styles.headerLabel}>IN</Text>
                            </View>
                            <View style={[styles.headerCol, styles.colNum]}>
                                <Text style={styles.headerLabel}>OUT</Text>
                            </View>
                            <View style={[styles.headerCol, styles.colNum]}>
                                <Text style={styles.headerLabel}>BAL</Text>
                            </View>
                            <View style={[styles.headerCol, styles.colAmount]}>
                                <Text style={styles.headerLabel}>AMOUNT</Text>
                            </View>
                            <View style={[styles.headerCol, styles.colAction]}>
                                <Text style={styles.headerLabel}>ACTION</Text>
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
                            {gasEntries && gasEntries.length > 0 ? (
                                gasEntries.map((item, index) => renderEntry(item, index))
                            ) : (
                                <View style={styles.emptyView}>
                                    <View style={styles.emptyIconWrap}>
                                        <FontAwesome6 name="table" size={22} color="#0D6EFD" />
                                    </View>
                                    <Text style={styles.emptyTitle}>No Records Found</Text>
                                    <Text style={styles.emptySubtitle}>Tap 'Create' above to add stock entries.</Text>
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
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilter(false)}
                >
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
                            <Text style={styles.datePickerText}>{formatDate(fromDate)}</Text>
                        </TouchableOpacity>

                        {showFromPicker && (
                            <DateTimePicker
                                value={fromDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowFromPicker(false);
                                    if (selectedDate) setFromDate(selectedDate);
                                }}
                            />
                        )}

                        <Text style={styles.filterSectionLabel}>TO DATE</Text>
                        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowToPicker(true)}>
                            <FontAwesome6 name="calendar-days" size={13} color="#0D6EFD" />
                            <Text style={styles.datePickerText}>{formatDate(toDate)}</Text>
                        </TouchableOpacity>

                        {showToPicker && (
                            <DateTimePicker
                                value={toDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowToPicker(false);
                                    if (selectedDate) setToDate(selectedDate);
                                }}
                            />
                        )}

                        <Text style={styles.filterSectionLabel}>ENTRY STATUS</Text>
                        <View style={styles.segmentedRow}>
                            <TouchableOpacity
                                style={[styles.segmentBtn, status === 0 && styles.segmentBtnActive]}
                                onPress={() => setStatus(0)}
                            >
                                <Text style={[styles.segmentText, status === 0 && styles.segmentTextActive]}>
                                    Pending
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.segmentBtn, status === 1 && styles.segmentBtnActive]}
                                onPress={() => setStatus(1)}
                            >
                                <Text style={[styles.segmentText, status === 1 && styles.segmentTextActive]}>
                                    Completed
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {isAdmin && (
                            <>
                                <Text style={styles.filterSectionLabel}>ADMIN APPROVAL</Text>
                                <View style={styles.segmentedRow}>
                                    <TouchableOpacity
                                        style={[styles.segmentBtn, adminApprovalstatus === 0 && styles.segmentBtnActive]}
                                        onPress={() => setAdminApprovalStatus(0)}
                                    >
                                        <Text
                                            style={[
                                                styles.segmentText,
                                                adminApprovalstatus === 0 && styles.segmentTextActive,
                                            ]}
                                        >
                                            Pending
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.segmentBtn, adminApprovalstatus === 1 && styles.segmentBtnActive]}
                                        onPress={() => setAdminApprovalStatus(1)}
                                    >
                                        <Text
                                            style={[
                                                styles.segmentText,
                                                adminApprovalstatus === 1 && styles.segmentTextActive,
                                            ]}
                                        >
                                            Approved
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                                <FontAwesome6 name="rotate-left" size={11} color="#64748B" />
                                <Text style={styles.resetBtnText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => {
                                    if (fromDate > toDate) {
                                        Alert.alert("Invalid Range", "From date cannot precede To date.");
                                        return;
                                    }
                                    setShowFilter(false);
                                    fetchEntries();
                                }}
                            >
                                <FontAwesome6 name="check" size={13} color="#FFFFFF" />
                                <Text style={styles.applyBtnText}>Apply Filter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <ConfirmModal
                visible={showDeleteModal}
                title="Delete Entry"
                message="Are you sure you want to permanently delete this stock entry?"
                confirmText="Delete"
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
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
        marginTop: 16,
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
    filterIconWrapper: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    activeFilterIndicator: {
        position: "absolute",
        top: -2,
        right: -3,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#EF4444",
        borderWidth: 1,
        borderColor: "#EFF6FF",
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
        flex: 1.3,
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
        fontSize: 12,
        fontWeight: "800",
        color: "#0D6EFD",
    },
    inAccentText: {
        color: "#059669",
    },
    outAccentText: {
        color: "#DC2626",
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
        marginBottom: 50,
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
    tableRowEven: {
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
    colCustomer: {
        width: 100,
        alignItems: "flex-start",
        paddingLeft: 8,
    },
    colNum: {
        width: 32,
    },
    colAmount: {
        width: 55,
        alignItems: "flex-end",
        paddingRight: 8,
    },
    colAction: {
        width: 70,
        flexDirection: "row",
        gap: 6,
        borderRightWidth: 0,
    },
    customerText: {
        width: "100%",
        fontSize: 11,
        fontWeight: "600",
        color: "#0F172A",
    },
    entrySubText: {
        fontSize: 8,
        fontWeight: "500",
        color: "#64748B",
    },
    numberText: {
        fontSize: 10.5,
        fontWeight: "700",
        color: "#0F172A",
    },
    amountText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0D6EFD",
    },
    payTypeBadge: {
        fontSize: 7.5,
        fontWeight: "600",
        color: "#64748B",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 4,
        borderRadius: 3,
        marginTop: 1,
    },
    actionBtnEdit: {
        width: 22,
        height: 22,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    actionBtnDelete: {
        width: 22,
        height: 22,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
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
    resetBtn: {
        flex: 1,
        height: 42,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        backgroundColor: "#F8FAFC",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    resetBtnText: {
        color: "#475569",
        fontSize: 12,
        fontWeight: "600",
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

export default EntryList;