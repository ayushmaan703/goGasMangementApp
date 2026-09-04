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
import { delDailyStockEntry, getDailyStockEntry, } from "../../store/slice/DailyStockEntry.slice";
import { useIsFocused, } from "@react-navigation/native";
import ConfirmModal from "../../helper/ConfirmModal";
import Toast from "react-native-toast-message";


const formatDate = (dateString) => {

    if (!dateString) return "";

    const value = String(dateString).trim();

    // API examples:
    // 8/27/2026 12:00:00
    // 8/27/2026 12:00:00 AM
    // 8/27/2026

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


const EntryList = ({ navigation }) => {

    const isFocused = useIsFocused();

    const dispatch = useDispatch();
    const currUser = useSelector((state) => state.auth.userData);
    const gasEntries = useSelector((state) => state.dailyEntry.stockEntryList);
    const loading = useSelector((state) => state.dailyEntry.loading);

    const comid = currUser?.Comid;
    const isAdmin = currUser?.UserType == "Admin"

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

    useEffect(() => {
        fetchEntries();
    }, [
        fromDate,
        toDate,
        status,
        adminApprovalstatus,
        dispatch,
    ]);

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

            acc.regulator += Number(
                item.Regulator || 0
            );

            acc.balEmpty += Number(
                item.BalCyc || 0
            );

            acc.amount += Number(
                item.Amount || 0
            );

            return acc;

        },
        {
            in: 0,
            out: 0,
            regulator: 0,
            balEmpty: 0,
            amount: 0,
        }
    );

    const handleDelete = async () => {
        const res = await dispatch(delDailyStockEntry({ comid, id: customerId }));
        if (res.type === 'deleteDailyStockEntry/rejected') {
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
                text1: 'Daily Stock Entry Deleted Successfully',
                visibilityTime: 2000,
            });
            setShowDeleteModal(false);
            navigation.goBack();
        }
    }

    const renderEntry = (item) => {
        return (
            <View
                key={item.EntryID}
                style={styles.tableRow}
            >

                {/* CUSTOMER */}

                <View
                    style={[
                        styles.cell,
                        styles.customerCell,
                    ]}
                >

                    <Text
                        style={styles.customerText}
                        numberOfLines={1}
                    >
                        {item.Customer || "-"}
                    </Text>
                    <Text style={styles.entryText}>#{item.EntryID}</Text>
                </View>


                {/* IN */}

                <View
                    style={[
                        styles.cell,
                        styles.numberCell,
                    ]}
                >
                    <Text style={styles.numberText}> {item.CycIn ?? 0} </Text>
                </View>


                {/* OUT */}

                <View
                    style={[
                        styles.cell,
                        styles.numberCell,
                    ]}
                >
                    <Text style={styles.numberText}>{item.CycOut ?? 0} </Text>
                </View>


                {/* REGULATOR */}

                {/* <View
                    style={[
                        styles.cell,
                        styles.numberCell,
                    ]}
                >

                    <Text style={styles.numberText}>
                        {item.Regulator ?? 0}
                    </Text>

                </View> */}

                {/* BAL EMPTY */}

                <View
                    style={[
                        styles.cell,
                        styles.numberCell,
                    ]}
                >
                    <Text style={styles.numberText}> {item.BalCyc ?? 0} </Text>
                </View>


                {/* PAYMENT */}

                {/* <View
                    style={[
                        styles.cell,
                        styles.payCell,
                    ]}
                >

                    <Text
                        style={styles.payText}
                        numberOfLines={1}
                    >
                        {item.PaymentMode || "-"}
                    </Text>

                </View> */}


                {/* AMOUNT + EDIT + DELETE   */}

                <View
                    style={[
                        styles.cell,
                        styles.amountCell,
                    ]}
                >
                    <View style={styles.amountRow}>
                        <Text style={styles.amountText}>
                            ₹{item.Amount ?? 0}
                        </Text>
                        {item.paytype && (
                            <Text style={styles.entryText}>
                                ( {item.paytype} )
                            </Text>
                        )}
                    </View>

                    <View style={styles.actionButtonsRow}>
                        {/* Edit button */}
                        {(status === 0 || (isAdmin)) && (
                            <TouchableOpacity
                                style={styles.editIconButtonAmt}
                                onPress={() => {
                                    if (status === 1) {
                                        navigation.navigate("Home", {
                                            screen: "AdminApprovalAndEdit",
                                            params: {
                                                entry: item,
                                                isApproved: adminApprovalstatus,
                                            },
                                        });
                                    } else {
                                        navigation.navigate("DailyStockEntry", {
                                            entry: item,
                                            isEdit: true,
                                        });
                                    }
                                }}
                            >
                                <FontAwesome6
                                    name="pen-to-square"
                                    size={12}
                                    color="#4A90E2"
                                />
                            </TouchableOpacity>
                        )}

                        {/* Delete button */}
                        {status === 0 && (
                            <TouchableOpacity
                                style={styles.deleteIconButton}
                                onPress={() => { setShowDeleteModal(true); setCustomerId(item.EntryID); }}
                            >
                                <FontAwesome6
                                    name="trash"
                                    size={12}
                                    color="#e24a4a"
                                />
                            </TouchableOpacity>)}
                    </View>


                </View>

            </View >
        );
    };


    return (

        <SafeAreaView style={styles.container}>

            {/* =================================================
                NAVBAR
            ================================================= */}

            <CustomNavBar
                navName={"Daily Stock Entry Logs"}
                subtitle={"View your gas transactions"}
            />


            {/* =================================================
                FILTER BAR
            ================================================= */}

            <View style={styles.filterBar}>

                {/* FILTER */}

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() =>
                        setShowFilter(true)
                    }
                >

                    <FontAwesome6
                        name="filter"
                        size={12}
                        color="#4A90E2"
                    />

                    <Text style={styles.filterButtonText}>
                        Filters
                    </Text>

                    <FontAwesome6
                        name="chevron-down"
                        size={8}
                        color="#7A8493"
                    />

                </TouchableOpacity>


                {/* DATE */}

                <View style={styles.dateBadge}>

                    <FontAwesome6
                        name="calendar-days"
                        size={11}
                        color="#7A8493"
                    />

                    <Text
                        style={styles.dateBadgeText}
                        numberOfLines={1}
                    >
                        {formatDate(fromDate)} -{" "}
                        {formatDate(toDate)}
                    </Text>

                </View>


                {/* STATUS */}

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


                {/* SUBMIT */}

                {status === 0 && (
                    <TouchableOpacity
                        style={styles.submitIconButton}
                        onPress={() => {

                            navigation.navigate(
                                "Home",
                                {
                                    screen: "SubmitForm",
                                }
                            );

                        }}
                    >

                        <FontAwesome6
                            name="paper-plane"
                            size={12}
                            color="#FFFFFF"
                        />

                    </TouchableOpacity>)}

            </View>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <View style={styles.summaryCard}>

                <View style={styles.summaryHeader}>

                    <View
                        style={
                            styles.summaryTitleContainer
                        }
                    >

                        <FontAwesome6
                            name="chart-simple"
                            size={12}
                            color="#4A90E2"
                        />

                        <Text style={styles.summaryTitle}>
                            Summary
                        </Text>

                    </View>


                    <Text style={styles.entryCount}>
                        {gasEntries?.length || 0} Entries
                    </Text>

                </View>


                <View style={styles.summaryDivider} />


                <View style={styles.summaryRow}>

                    <View style={styles.summaryItem}>

                        <Text style={styles.summaryLabel}>
                            IN
                        </Text>

                        <Text style={styles.summaryValue}>
                            {totals.in}
                        </Text>

                    </View>


                    <View style={styles.summaryItem}>

                        <Text style={styles.summaryLabel}>
                            OUT
                        </Text>

                        <Text style={styles.summaryValue}>
                            {totals.out}
                        </Text>

                    </View>


                    <View style={styles.summaryItem}>

                        <Text style={styles.summaryLabel}>
                            REG
                        </Text>

                        <Text style={styles.summaryValue}>
                            {totals.regulator}
                        </Text>

                    </View>


                    {/* <View style={styles.summaryItem}>

                        <Text style={styles.summaryLabel}>
                            BAL
                        </Text>

                        <Text style={styles.summaryValue}>
                            {totals.balEmpty}
                        </Text>

                    </View> */}


                    <View
                        style={[
                            styles.summaryItem,
                            styles.amountSummaryItem,
                        ]}
                    >

                        <Text style={styles.summaryLabel}>
                            AMOUNT
                        </Text>

                        <Text style={styles.summaryAmount}>
                            ₹{totals.amount}
                        </Text>

                    </View>

                </View>

            </View>


            {/* =================================================
                TABLE
            ================================================= */}

            <View style={styles.tableWrapper}>

                {/* 
                    HORIZONTAL SCROLL
                */}

                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={true}
                    bounces={false}
                    nestedScrollEnabled={true}
                    contentContainerStyle={
                        styles.horizontalContent
                    }
                >

                    <View style={styles.table}>

                        {/* =====================================
                            HEADER
                        ===================================== */}

                        <View style={styles.tableHeader}>

                            <View
                                style={[
                                    styles.headerCell,
                                    styles.customerCell,
                                ]}
                            >

                                <Text
                                    style={styles.headerText}
                                >
                                    Customer
                                </Text>

                            </View>


                            <View
                                style={[
                                    styles.headerCell,
                                    styles.numberCell,
                                ]}
                            >

                                <Text
                                    style={styles.headerText}
                                >
                                    IN
                                </Text>

                            </View>


                            <View
                                style={[
                                    styles.headerCell,
                                    styles.numberCell,
                                ]}
                            >

                                <Text
                                    style={styles.headerText}
                                >
                                    Out
                                </Text>

                            </View>


                            {/* <View
                                style={[
                                    styles.headerCell,
                                    styles.numberCell,
                                ]}
                            >

                                <Text
                                    style={styles.headerText}
                                >
                                    Reg
                                </Text>

                            </View> */}


                            <View
                                style={[
                                    styles.headerCell,
                                    styles.numberCell,
                                ]}
                            >

                                <Text
                                    style={styles.headerText}
                                >
                                    Bal
                                </Text>

                            </View>


                            {/* <View
                                style={[
                                    styles.headerCell,
                                    styles.payCell,
                                ]}
                            >

                                <Text
                                    style={styles.headerText}
                                >
                                    Pay
                                </Text>

                            </View> */}


                            <View
                                style={[
                                    styles.headerCell,
                                    styles.amountCell,
                                ]}
                            >

                                <Text
                                    style={styles.headerText}
                                >
                                    Amount
                                </Text>

                            </View>

                        </View>


                        {/* =====================================
                            VERTICAL SCROLL
                        ===================================== */}

                        <ScrollView
                            style={styles.verticalTableScroll}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="#4A90E2"
                                    colors={[
                                        "#4A90E2",
                                    ]}
                                />
                            }
                        >

                            {/* DATA */}

                            {gasEntries && gasEntries.length > 0 ? (

                                gasEntries.map((item) =>
                                    renderEntry(item)
                                )

                            ) : (

                                <View
                                    style={
                                        styles.emptyContainer
                                    }
                                >

                                    <FontAwesome6
                                        name="clipboard-list"
                                        size={27}
                                        color="#4A90E2"
                                    />

                                    <Text
                                        style={
                                            styles.emptyTitle
                                        }
                                    >
                                        No Stock Entries
                                    </Text>

                                    <Text
                                        style={
                                            styles.emptyText
                                        }
                                    >
                                        Your daily stock
                                        entries will appear
                                        here.
                                    </Text>

                                </View>

                            )}



                            {/* 
                            {gasEntries &&
                                gasEntries.length > 0 &&
                                renderSumRow()} */}

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
                onRequestClose={() =>
                    setShowFilter(false)
                }
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.filterModal}>

                        {/* HEADER */}

                        <View style={styles.modalHeader}>

                            <View>

                                <Text style={styles.modalTitle}>
                                    Filter Entries
                                </Text>

                                <Text
                                    style={
                                        styles.modalSubtitle
                                    }
                                >
                                    Select date range and
                                    status
                                </Text>

                            </View>


                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() =>
                                    setShowFilter(false)
                                }
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
                                        setFromDate(
                                            selectedDate
                                        );
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
                                        setToDate(
                                            selectedDate
                                        );
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
                                    Completed
                                </Text>

                            </TouchableOpacity>

                        </View>
                        {isAdmin && <>
                            <Text style={styles.fieldLabel}>
                                Admin Approval
                            </Text>
                            <View style={styles.statusOptions}>

                                {/* PENDING */}

                                <TouchableOpacity
                                    style={[
                                        styles.statusOption,
                                        adminApprovalstatus === 0 &&
                                        styles.statusOptionActive,
                                    ]}
                                    onPress={() =>
                                        setAdminApprovalStatus(0)
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
                                        adminApprovalstatus === 1 &&
                                        styles.statusOptionActive,
                                    ]}
                                    onPress={() =>
                                        setAdminApprovalStatus(1)
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
                        </>}
                        {/* APPLY */}

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {

                                if (
                                    fromDate > toDate
                                ) {

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

                            <Text
                                style={
                                    styles.applyButtonText
                                }
                            >
                                Apply Filters
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

            <ConfirmModal
                visible={showDeleteModal}
                title="Delete Stock Entry?"
                message="Are you sure you want to delete this entry? This action cannot be undone."
                confirmText="Delete"
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={loading}
            />
        </SafeAreaView >

    );
};


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

    // ========================================================
    // CONTAINER
    // ========================================================

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },


    // ========================================================
    // FILTER BAR
    // ========================================================

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
        color: "#4A90E2",
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


    submitIconButton: {
        width: 33,
        height: 33,

        borderRadius: 8,

        backgroundColor: "#4A90E2",

        alignItems: "center",
        justifyContent: "center",
    },


    // ========================================================
    // SUMMARY
    // ========================================================

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
        color: "#252B35",
    },


    entryCount: {
        fontSize: 8,
        color: "#7A8493",
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


    amountSummaryItem: {
        borderRightWidth: 0,
    },


    summaryLabel: {
        fontSize: 7,
        color: "#7A8493",
        fontWeight: "600",

        marginBottom: 1,
    },


    summaryValue: {
        fontSize: 12,
        color: "#252B35",
        fontWeight: "700",
    },


    summaryAmount: {
        fontSize: 12,
        color: "#4A90E2",
        fontWeight: "700",
    },


    // ========================================================
    // TABLE
    // ========================================================

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


    // ========================================================
    // HEADER
    // ========================================================

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


    // ========================================================
    // COLUMNS
    // ========================================================

    customerCell: {
        width: 100,
        alignItems: "flex-start",
        paddingLeft: 7,
    },


    numberCell: { width: 42, },
    payCell: { width: 58 },

    amountCell: {
        width: 60,
        borderRightWidth: 0,
        position: "relative",
        flexDirection: "row",
        justifyContent: "space-around",
        gap: 14,
    },
    actionButtonsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8, // if RN version < 0.71, use marginRight/marginLeft trick below instead
        marginTop: 4,
    },
    editIconButtonAmt: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EAF2FE", // light blue bg to make it feel like a real button
    },
    deleteIconButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FDEAEA", // light red bg
    },

    // ========================================================
    // VERTICAL TABLE
    // ========================================================

    verticalTableScroll: {
        flex: 1,
        // marginBottom: 20
    },


    // ========================================================
    // ROW
    // ========================================================

    tableRow: {
        height: 40,
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E4E8",
    },


    cell: {
        height: 40,
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

        color: "#252B35",
    },


    entryText: {
        fontSize: 8.5,
        fontWeight: "600",
        color: "#9AA2AD",
        marginTop: 1,
    },


    numberText: {
        fontSize: 10.5,

        fontWeight: "600",

        color: "#252B35",

        textAlign: "center",
    },


    payText: {
        maxWidth: "100%",
        fontSize: 8.5,
        fontWeight: "500",
        color: "#555E6B",
        textAlign: "center",
    },


    amountText: {
        fontSize: 9.5,

        fontWeight: "700",

        color: "#4A90E2",

        textAlign: "center",
    },


    // ========================================================
    // EDIT
    // ========================================================

    editIconButton: {
        position: "absolute",
        right: 2,
        // top: 2,
        width: 18,
        height: 18,
        borderRadius: 4,
        backgroundColor: "#F0F7FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 3
    },


    // ========================================================
    // SUM
    // ========================================================

    sumRow: {
        height: 40,

        flexDirection: "row",

        backgroundColor: "#F7F8FA",

        borderTopWidth: 1,
        borderTopColor: "#BFC6CE",
    },


    sumCell: {
        height: 40,

        alignItems: "center",
        justifyContent: "center",

        borderRightWidth: 1,
        borderRightColor: "#D9DEE4",

        paddingHorizontal: 3,
    },


    sumText: {
        fontSize: 9,

        fontWeight: "800",

        color: "#252B35",
    },


    sumValue: {
        fontSize: 10.5,

        fontWeight: "800",

        color: "#252B35",
    },


    sumAmount: {
        fontSize: 10,

        fontWeight: "800",

        color: "#4A90E2",
    },


    // ========================================================
    // EMPTY
    // ========================================================

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",

        paddingTop: 80,
        paddingBottom: 80,

        width: 452,
    },


    emptyTitle: {
        marginTop: 10,

        fontSize: 14,

        fontWeight: "700",

        color: "#252B35",
    },


    emptyText: {
        marginTop: 5,

        fontSize: 10,

        color: "#7A8493",

        textAlign: "center",
    },


    // ========================================================
    // MODAL
    // ========================================================

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

});


export default EntryList;