import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    TextInput,
    Modal,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
} from "react-native";

import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

import { getAllCustomers } from "../store/slice/Customer.slice";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllUsers,
    getCurrUInfo,
} from "../store/slice/Auth.slice";
import { getAllSalesPerson } from "../store/slice/Sales.slice";
import CustomNavBar from "../helper/CustomNavBar";
import { getLocality } from "../store/slice/Customer.slice";

const CustomerList = () => {
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const drawerNavigation = navigation.getParent();
    // const customerList = useSelector( (state) => state.customer.customerList)||[];
    const customerListData = useSelector((state) => state.customer.customerList);
    const customerList = Array.isArray(customerListData) ? customerListData : [];
    const currentUser = useSelector((state) => state.auth.userData);
    const salesPersonList = useSelector((state) => state.sales.allSalesPersonList) || [];
    const localityList = useSelector((state) => state.customer.localityList) || [];

    const isAdmin = currentUser?.UserType === "Admin";
    const comid = currentUser?.Comid
    const comName = currentUser?.CompanyName

    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState("all");
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedLocality, setSelectedLocality] = useState("all");
    const [contactPersonFilter, setContactPersonFilter] = useState("all");
    const [contactNoFilter, setContactNoFilter] = useState("all");
    const [refreshing, setRefreshing] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [localitySearch, setLocalitySearch] = useState("");

    const selectedUserName = useMemo(() => {
        if (selectedUser === "all") {
            return "All Users";
        }

        return (
            salesPersonList.find(
                (u) => u?.Id === selectedUser
            )?.Name || "All Users"
        );
    }, [selectedUser, salesPersonList]);

    const activeFilterCount = useMemo(() => {
        let count = 0;

        if (selectedStatus !== "all") {
            count++;
        }

        if (selectedPayment !== "all") {
            count++;
        }

        if (selectedUser !== "all") {
            count++;
        }

        if (selectedLocality !== "all") {
            count++;
        }

        if (contactPersonFilter !== "all") {
            count++;
        }

        if (contactNoFilter !== "all") {
            count++;
        }

        return count;
    }, [
        selectedStatus,
        selectedPayment,
        selectedUser,
        selectedLocality,
        contactPersonFilter,
        contactNoFilter,
    ]);

    const selectedLocalityName = useMemo(() => {
        if (selectedLocality === "all") {
            return "All Localities";
        }
        return (
            localityList.find((item) => String(item?.Id) === String(selectedLocality))?.Locality || "All Localities"
        );
    }, [selectedLocality, localityList]);

    const filteredCustomers = useMemo(() => {
        const searchText = search.trim().toLowerCase();
        return customerList.filter((customer) => {
            const name = customer?.CustomerName?.toLowerCase() || "";
            const contact = String(customer?.ContactNo || "");
            const matchesSearch = name.includes(searchText) || contact.includes(searchText);
            if (!matchesSearch) {
                return false;
            }

            if (!isAdmin) {
                return (
                    customer?.SalespersonId === currentUser?.EmpId &&
                    customer?.Status === "Pending"
                );
            }

            const matchesStatus = selectedStatus === "all" ? true : selectedStatus === "Approved" ? customer?.Status === "Approved" : customer?.Status === "Pending";

            // const matchesPayment =
            //   selectedPayment === "all"
            //     ? true
            //     : selectedPayment === "paid"
            //       ? customer?.isPaid
            //       : !customer?.isPaid;

            const matchesUser = selectedUser === "all" ? true : customer?.SalespersonId === selectedUser;
            const matchesLocality = selectedLocality === "all" ? true : String(customer?.LocalityId) === String(selectedLocality);
            const hasContactPerson =
                customer?.ContactPerson != null &&
                String(customer.ContactPerson).trim() !== "";

            const hasContactNo =
                customer?.ContactNo != null &&
                String(customer.ContactNo).trim() !== "";

            const matchesContactPerson =
                contactPersonFilter === "all" ||
                (contactPersonFilter === "blank" && !hasContactPerson) ||
                (contactPersonFilter === "available" && hasContactPerson);

            const matchesContactNo =
                contactNoFilter === "all" ||
                (contactNoFilter === "blank" && !hasContactNo) ||
                (contactNoFilter === "available" && hasContactNo);
            return (
                // matchesPayment &&
                matchesStatus &&
                matchesUser &&
                matchesLocality &&
                matchesContactPerson &&
                matchesContactNo
            );
        });
    }, [
        customerList,
        search,
        selectedStatus,
        selectedPayment,
        selectedUser,
        selectedLocality,
        contactPersonFilter,
        contactNoFilter,
        currentUser,
        isAdmin,
    ]);

    const filteredLocalities = useMemo(() => {
        const searchText = localitySearch.trim().toLowerCase();

        const list = [
            {
                Id: "all",
                Locality: "All Localities",
            },
            ...localityList,
        ];

        if (!searchText) {
            return list;
        }

        return list.filter((item) =>
            String(item?.Locality || "")
                .toLowerCase()
                .includes(searchText)
        );
    }, [localityList, localitySearch]);

    useEffect(() => {
        const getfunction = async () => {
            await dispatch(getAllCustomers(comid));
            await dispatch(getAllSalesPerson(comid));
            await dispatch(getLocality(comid));
        }
        getfunction()
    }, []);

    const renderCustomer = ({ item }) => {
        const isApproved = item?.Status === "Approved";

        return (
            <TouchableOpacity
                style={styles.customerCard}
                activeOpacity={0.82}
                onPress={() =>
                    navigation.navigate(
                        "CustomerDetails",
                        {
                            customer: item,
                        }
                    )
                }
            >
                {/* Left icon */}

                <View style={styles.customerAvatar}>
                    <FontAwesome6
                        name="building"
                        size={17}
                        color="#4A90E2"
                    />
                </View>

                {/* Customer information */}

                <View style={styles.customerDetails}>
                    <Text
                        style={styles.customerName}
                        numberOfLines={1}
                    >
                        {item?.CustomerName || "-"}
                    </Text>

                    <View style={styles.infoRow}>
                        <FontAwesome6
                            name="phone"
                            size={10}
                            color="#94A3B8"
                        />

                        <Text style={styles.customerInfo}>
                            {item?.ContactNo || "-"}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <FontAwesome6
                            name="user"
                            size={10}
                            color="#94A3B8"
                        />

                        <Text
                            style={styles.customerInfo}
                            numberOfLines={1}
                        >
                            {item?.ContactPerson || "-"}
                        </Text>
                    </View>
                </View>

                {/* Status */}

                {isAdmin && <View
                    style={[
                        styles.statusBadge,
                        isApproved
                            ? styles.approvedBadge
                            : styles.pendingBadge,
                    ]}
                >
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor: isApproved
                                    ? "#22C55E"
                                    : "#F59E0B",
                            },
                        ]}
                    />

                    <Text
                        style={[
                            styles.statusText,
                            {
                                color: isApproved
                                    ? "#15803D"
                                    : "#B45309",
                            },
                        ]}
                    >
                        {isApproved
                            ? "Approved"
                            : "Pending"}
                    </Text>
                </View>}

                {/* Arrow */}

                <FontAwesome6
                    name="chevron-right"
                    size={11}
                    color="#CBD5E1"
                    style={styles.customerArrow}
                />
            </TouchableOpacity>
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            await Promise.all([
                dispatch(getAllCustomers(comid)),
                dispatch(getAllSalesPerson(comid)),
                dispatch(getLocality(comid)),
            ]);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            onRefresh();
        }
    }, [isFocused]);


    const resetFilters = () => {
        setSelectedStatus("all");
        setSelectedPayment("all");
        setSelectedUser("all");
        setSelectedLocality("all");
        setContactPersonFilter("all");
        setContactNoFilter("all");
        setLocalitySearch("");
    };


    return (
        <View style={styles.container}>

            <CustomNavBar navName="Customer List" subtitle="See all your customers" />

            <View style={styles.searchRow}>

                <View style={styles.searchContainer}>

                    <View style={styles.searchIconContainer}>
                        <FontAwesome6 name="magnifying-glass" size={15} color="#4A90E2" />
                    </View>

                    <TextInput
                        placeholder="Search customers..."
                        placeholderTextColor="#9AA5B5"
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                    />

                    {search.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearch("")}
                            style={styles.clearSearchButton}
                        >
                            <FontAwesome6 name="xmark" size={13} color="#94A3B8" />
                        </TouchableOpacity>
                    )}

                </View>


                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilterCount > 0 &&
                        styles.filterButtonActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setFilterVisible(true)}
                >
                    <FontAwesome6 name="sliders" size={16} color={activeFilterCount > 0 ? "#FFFFFF" : "#4A90E2"}
                    />
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>
                                {activeFilterCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

            </View>

            <View style={styles.resultsHeader}>

                <View style={styles.resultsLeft}>

                    <View style={styles.resultsIcon}>
                        <FontAwesome6 name="users" size={12} color="#4A90E2" />
                    </View>

                    <Text style={styles.resultsText}>
                        {filteredCustomers.length}{" "}
                        {filteredCustomers.length === 1 ? "Customer" : "Customers"}
                    </Text>

                </View>

                {activeFilterCount > 0 && (
                    <TouchableOpacity
                        onPress={resetFilters}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.clearFilters}>
                            Clear filters
                        </Text>
                    </TouchableOpacity>
                )}

            </View>

            {
                // isAdmin &&
                activeFilterCount > 0 && (
                    <View style={styles.activeChipsRow}>

                        {selectedStatus !== "all" && (
                            <View style={styles.activeChip}>
                                <FontAwesome6 name="circle-check" size={10} color="#4A90E2" />
                                <Text style={styles.activeChipText}>
                                    {selectedStatus}
                                </Text>
                            </View>
                        )}

                        {selectedPayment !== "all" && (
                            <View style={styles.activeChip}>
                                <FontAwesome6 name="credit-card" size={10} color="#4A90E2" />

                                <Text style={styles.activeChipText}>
                                    {selectedPayment}
                                </Text>
                            </View>
                        )}

                        {selectedUser !== "all" && (
                            <View style={styles.activeChip}>
                                <FontAwesome6 name="user" size={10} color="#4A90E2" />
                                <Text
                                    style={styles.activeChipText}
                                    numberOfLines={1}
                                >
                                    {selectedUserName}
                                </Text>
                            </View>
                        )}

                        {selectedLocality !== "all" && (
                            <View style={styles.activeChip}>
                                <FontAwesome6 name="location-dot" size={10} color="#4A90E2" />
                                <Text
                                    style={styles.activeChipText}
                                    numberOfLines={1}
                                >
                                    {selectedLocalityName}
                                </Text>
                            </View>
                        )}

                        {contactNoFilter !== "all" && (
                            <View style={styles.activeChip}>
                                <FontAwesome6 name="phone" size={10} color="#4A90E2" />
                                <Text style={styles.activeChipText}>
                                    Contact No:{" "}{contactNoFilter === "blank" ? "Blank" : "Available"}
                                </Text>
                            </View>
                        )}

                        {contactPersonFilter !== "all" && (
                            <View style={styles.activeChip}>
                                <FontAwesome6
                                    name="user"
                                    size={10}
                                    color="#4A90E2"
                                />

                                <Text style={styles.activeChipText}>
                                    Contact Person:{" "}
                                    {contactPersonFilter === "blank"
                                        ? "Blank"
                                        : "Available"}
                                </Text>
                            </View>
                        )}
                    </View>
                )
            }

            <FlatList
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A90E2"
                        colors={["#4A90E2"]}
                    />
                }
                data={filteredCustomers}
                keyExtractor={(item, index) => String(item?.CustomerId ?? item?._id ?? index)}
                renderItem={renderCustomer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>
                            <FontAwesome6 name="users-slash" size={28} color="#94A3B8" />
                        </View>
                        <Text style={styles.emptyTitle}> No Customers Found</Text>
                        <Text style={styles.emptySubtitle}>  Try changing your search or filters</Text>
                    </View>
                )}
            />
            
            {/*  <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("CreateCustomer")}
            >
                <FontAwesome6 name="plus" size={19} color="#FFFFFF" />
                <Text style={styles.fabText}>  Add Customer</Text>
            </TouchableOpacity> */}


            <Modal
                visible={filterVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setFilterVisible(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => setFilterVisible(false)}
                >
                    <View style={styles.modalOverlay}>

                        <TouchableWithoutFeedback>
                            <View style={styles.filterPanel}>

                                {/* Handle */}
                                <View style={styles.modalHandle} />

                                {/* Header */}
                                <View style={styles.filterPanelHeader}>
                                    <View>
                                        <Text style={styles.filterPanelTitle}>
                                            Filters
                                        </Text>

                                        <Text style={styles.filterPanelSubtitle}>
                                            Refine your customer list
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.modalClose}
                                        onPress={() => setFilterVisible(false)}
                                    >
                                        <FontAwesome6
                                            name="xmark"
                                            size={15}
                                            color="#64748B"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* ================= CONTENT ================= */}

                                {/* <ScrollView
                  style={styles.filterScroll}
                  contentContainerStyle={styles.filterScrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                > */}

                                {/* STATUS */}
                                {isAdmin &&
                                    <>
                                        <Text style={styles.sectionLabel}>
                                            Status
                                        </Text>

                                        <View style={styles.pillRow}>
                                            {["all", "Approved", "Pending"].map((item) => {
                                                const active =
                                                    selectedStatus === item;

                                                return (
                                                    <TouchableOpacity
                                                        key={item}
                                                        style={[
                                                            styles.pill,
                                                            active && styles.pillActive,
                                                        ]}
                                                        activeOpacity={0.8}
                                                        onPress={() =>
                                                            setSelectedStatus(item)
                                                        }
                                                    >
                                                        {active && (
                                                            <FontAwesome6
                                                                name="check"
                                                                size={9}
                                                                color="#FFFFFF"
                                                            />
                                                        )}

                                                        <Text
                                                            style={[
                                                                styles.pillText,
                                                                active &&
                                                                styles.pillTextActive,
                                                            ]}
                                                        >
                                                            {item === "all"
                                                                ? "All"
                                                                : item}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </>}

                                {/* CONTACT PERSON */}
                                <Text style={styles.sectionLabel}>
                                    Contact Person
                                </Text>

                                <View style={styles.pillRow}>
                                    {[
                                        {
                                            value: "all",
                                            label: "All",
                                        },
                                        {
                                            value: "available",
                                            label: "Available",
                                        },
                                        {
                                            value: "blank",
                                            label: "Blank",
                                        },
                                    ].map((item) => {
                                        const active =
                                            contactPersonFilter ===
                                            item.value;

                                        return (
                                            <TouchableOpacity
                                                key={item.value}
                                                style={[
                                                    styles.pill,
                                                    active &&
                                                    styles.pillActive,
                                                ]}
                                                activeOpacity={0.8}
                                                onPress={() =>
                                                    setContactPersonFilter(
                                                        item.value
                                                    )
                                                }
                                            >
                                                {active && (
                                                    <FontAwesome6
                                                        name="check"
                                                        size={9}
                                                        color="#FFFFFF"
                                                    />
                                                )}

                                                <Text
                                                    style={[
                                                        styles.pillText,
                                                        active &&
                                                        styles.pillTextActive,
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>


                                {/* CONTACT NUMBER */}
                                <Text style={styles.sectionLabel}>
                                    Contact Number
                                </Text>

                                <View style={styles.pillRow}>
                                    {[
                                        {
                                            value: "all",
                                            label: "All",
                                        },
                                        {
                                            value: "available",
                                            label: "Available",
                                        },
                                        {
                                            value: "blank",
                                            label: "Blank",
                                        },
                                    ].map((item) => {
                                        const active =
                                            contactNoFilter ===
                                            item.value;

                                        return (
                                            <TouchableOpacity
                                                key={item.value}
                                                style={[
                                                    styles.pill,
                                                    active &&
                                                    styles.pillActive,
                                                ]}
                                                activeOpacity={0.8}
                                                onPress={() =>
                                                    setContactNoFilter(
                                                        item.value
                                                    )
                                                }
                                            >
                                                {active && (
                                                    <FontAwesome6
                                                        name="check"
                                                        size={9}
                                                        color="#FFFFFF"
                                                    />
                                                )}

                                                <Text
                                                    style={[
                                                        styles.pillText,
                                                        active &&
                                                        styles.pillTextActive,
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>


                                {/* LOCALITY */}
                                <View style={styles.localitySearchContainerSetting}>

                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionLabel}>
                                            Locality
                                        </Text>

                                        {/* {selectedLocality !== "all" && (
                      <Text
                        style={
                          styles.selectedFilterLabel
                        }
                      >
                        {selectedLocalityName}
                      </Text>
                    )} */}
                                    </View>

                                    {/* Locality Search */}
                                    <View
                                        style={styles.localitySearchContainer}
                                    >
                                        <FontAwesome6
                                            name="magnifying-glass"
                                            size={12}
                                            color="#94A3B8"
                                        />

                                        <TextInput
                                            value={localitySearch}
                                            onChangeText={setLocalitySearch}
                                            placeholder="Search locality..."
                                            placeholderTextColor="#A8B2C1"
                                            style={styles.localitySearchInput}
                                        />

                                        {localitySearch.length > 0 && (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    setLocalitySearch("")
                                                }
                                                hitSlop={{
                                                    top: 10,
                                                    bottom: 10,
                                                    left: 10,
                                                    right: 10,
                                                }}
                                            >
                                                <FontAwesome6
                                                    name="xmark"
                                                    size={12}
                                                    color="#94A3B8"
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                {/* Locality list */}
                                <View style={styles.dropdownBox}>
                                    <FlatList
                                        data={filteredLocalities}
                                        keyExtractor={(item) => String(item.Id)}
                                        showsVerticalScrollIndicator={true}
                                        keyboardShouldPersistTaps="handled"
                                        nestedScrollEnabled={true}
                                        renderItem={({ item }) => {
                                            const active =
                                                String(selectedLocality) === String(item.Id);

                                            return (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.userRow,
                                                        active && styles.userRowActive,
                                                    ]}
                                                    activeOpacity={0.7}
                                                    onPress={() =>
                                                        setSelectedLocality(String(item.Id))
                                                    }
                                                >
                                                    <View style={styles.userRowLeft}>
                                                        <View
                                                            style={[
                                                                styles.userAvatar,
                                                                active &&
                                                                styles.userAvatarActive,
                                                            ]}
                                                        >
                                                            <FontAwesome6
                                                                name="location-dot"
                                                                size={11}
                                                                color={
                                                                    active
                                                                        ? "#FFFFFF"
                                                                        : "#4A90E2"
                                                                }
                                                            />
                                                        </View>

                                                        <Text
                                                            style={[
                                                                styles.userRowText,
                                                                active &&
                                                                styles.userRowTextActive,
                                                            ]}
                                                            numberOfLines={1}
                                                        >
                                                            {item.Locality}
                                                        </Text>
                                                    </View>

                                                    {active && (
                                                        <FontAwesome6
                                                            name="circle-check"
                                                            size={15}
                                                            color="#4A90E2"
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                </View>

                                {/* SALES PERSON */}
                                {isAdmin && <>
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionLabel}>
                                            Sales Person
                                        </Text>

                                        {selectedUser !== "all" && (
                                            <Text
                                                style={
                                                    styles.selectedFilterLabel
                                                }
                                            >
                                                {selectedUserName}
                                            </Text>
                                        )}
                                    </View>

                                    <View style={styles.dropdownBox}>
                                        <FlatList
                                            data={[
                                                {
                                                    Id: "all",
                                                    Name: "All Users",
                                                },
                                                ...salesPersonList,
                                            ]}
                                            keyExtractor={(item) => String(item.Id)}
                                            showsVerticalScrollIndicator={true}
                                            keyboardShouldPersistTaps="handled"
                                            nestedScrollEnabled={true}
                                            renderItem={({ item }) => {
                                                const active =
                                                    String(selectedUser) === String(item.Id);

                                                return (
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.userRow,
                                                            active && styles.userRowActive,
                                                        ]}
                                                        activeOpacity={0.7}
                                                        onPress={() =>
                                                            setSelectedUser(String(item.Id))
                                                        }
                                                    >
                                                        <View style={styles.userRowLeft}>
                                                            <View
                                                                style={[
                                                                    styles.userAvatar,
                                                                    active &&
                                                                    styles.userAvatarActive,
                                                                ]}
                                                            >
                                                                <FontAwesome6
                                                                    name={
                                                                        item.Id === "all"
                                                                            ? "users"
                                                                            : "user"
                                                                    }
                                                                    size={11}
                                                                    color={
                                                                        active
                                                                            ? "#FFFFFF"
                                                                            : "#4A90E2"
                                                                    }
                                                                />
                                                            </View>

                                                            <Text
                                                                style={[
                                                                    styles.userRowText,
                                                                    active &&
                                                                    styles.userRowTextActive,
                                                                ]}
                                                                numberOfLines={1}
                                                            >
                                                                {item.Name}
                                                            </Text>
                                                        </View>

                                                        {active && (
                                                            <FontAwesome6
                                                                name="circle-check"
                                                                size={15}
                                                                color="#4A90E2"
                                                            />
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            }}
                                        />
                                    </View>
                                </>}

                                {/* Bottom breathing space */}
                                <View style={{ height: 15 }} />

                                {/* </ScrollView> */}


                                {/* ================= FOOTER ================= */}

                                <View style={styles.filterPanelFooter}>

                                    <TouchableOpacity
                                        style={styles.resetButton}
                                        activeOpacity={0.8}
                                        onPress={resetFilters}
                                    >
                                        <FontAwesome6
                                            name="rotate-left"
                                            size={11}
                                            color="#64748B"
                                        />

                                        <Text style={styles.resetText}>
                                            Reset
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.doneButton}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            setFilterVisible(false)
                                        }
                                    >
                                        <Text style={styles.doneButtonText}>
                                            Apply Filters
                                        </Text>

                                        <FontAwesome6
                                            name="check"
                                            size={11}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>

                                </View>

                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
    );
};

export default CustomerList;

const styles = StyleSheet.create({

    // ====================================================
    // MAIN
    // ====================================================

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },


    // ====================================================
    // SEARCH
    // ====================================================

    searchRow: {
        flexDirection: "row",
        alignItems: "center",

        marginHorizontal: 16,
        marginTop: 16,
    },

    searchContainer: {
        flex: 1,

        height: 52,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#FFFFFF",

        borderRadius: 16,

        borderWidth: 1,
        borderColor: "#E5EBF3",
    },

    searchIconContainer: {
        width: 42,

        alignItems: "center",
    },

    searchInput: {
        flex: 1,

        height: "100%",

        paddingHorizontal: 0,

        color: "#1E293B",

        fontSize: 12,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    clearSearchButton: {
        width: 38,

        alignItems: "center",
    },


    // ====================================================
    // FILTER BUTTON
    // ====================================================

    filterButton: {
        width: 52,
        height: 52,

        marginLeft: 10,

        borderRadius: 16,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E5EBF3",

        justifyContent: "center",
        alignItems: "center",
    },

    filterButtonActive: {
        backgroundColor: "#4A90E2",
        borderColor: "#4A90E2",
    },

    filterBadge: {
        position: "absolute",

        top: -5,
        right: -5,

        width: 19,
        height: 19,

        borderRadius: 10,

        backgroundColor: "#D64545",

        justifyContent: "center",
        alignItems: "center",
    },

    filterBadgeText: {
        color: "#FFFFFF",

        fontSize: 9,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },


    // ====================================================
    // RESULTS
    // ====================================================

    resultsHeader: {
        flexDirection: "row",

        justifyContent: "space-between",
        alignItems: "center",

        marginHorizontal: 18,
        marginTop: 17,
        marginBottom: 5,
    },

    resultsLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    resultsIcon: {
        width: 26,
        height: 26,

        borderRadius: 9,

        backgroundColor: "#EAF3FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 8,
    },

    resultsText: {
        fontSize: 12,

        color: "#475569",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    clearFilters: {
        fontSize: 10,

        color: "#4A90E2",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },


    // ====================================================
    // ACTIVE FILTER CHIPS
    // ====================================================

    activeChipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",

        marginHorizontal: 16,
        marginTop: 6,
        marginBottom: 3,
    },

    activeChip: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#EAF3FF",

        paddingHorizontal: 10,
        paddingVertical: 6,

        borderRadius: 12,

        marginRight: 6,
        marginBottom: 5,
    },

    activeChipText: {
        color: "#3478C5",

        fontSize: 9,

        marginLeft: 5,

        maxWidth: 120,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },


    // ====================================================
    // CUSTOMER LIST
    // ====================================================

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 7,
        paddingBottom: 120,
    },


    // ====================================================
    // CUSTOMER CARD
    // ====================================================

    customerCard: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#FFFFFF",

        borderRadius: 18,

        padding: 13,

        marginBottom: 10,

        borderWidth: 1,
        borderColor: "#EDF1F6",

        shadowColor: "#1E293B",
        shadowOpacity: 0.045,
        shadowRadius: 8,

        shadowOffset: {
            width: 0,
            height: 3,
        },

        elevation: 2,
    },

    customerAvatar: {
        width: 45,
        height: 45,

        borderRadius: 14,

        backgroundColor: "#EAF3FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 11,
    },

    customerDetails: {
        flex: 1,

        minWidth: 0,
    },

    customerName: {
        fontSize: 14,

        color: "#1E293B",

        marginBottom: 5,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",

        marginTop: 3,
    },

    customerInfo: {
        flex: 1,

        fontSize: 9,

        color: "#7C8798",

        marginLeft: 7,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },


    // ====================================================
    // STATUS
    // ====================================================

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 8,
        paddingVertical: 6,

        borderRadius: 10,

        marginLeft: 5,
    },

    approvedBadge: {
        backgroundColor: "#ECFDF3",
    },

    pendingBadge: {
        backgroundColor: "#FFF7ED",
    },

    statusDot: {
        width: 5,
        height: 5,

        borderRadius: 3,

        marginRight: 5,
    },

    statusText: {
        fontSize: 8,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    customerArrow: {
        marginLeft: 7,
    },


    // ====================================================
    // EMPTY STATE
    // ====================================================

    emptyContainer: {
        alignItems: "center",

        marginTop: 90,

        paddingHorizontal: 30,
    },

    emptyIcon: {
        width: 72,
        height: 72,

        borderRadius: 24,

        backgroundColor: "#EEF2F7",

        justifyContent: "center",
        alignItems: "center",

        marginBottom: 15,
    },

    emptyTitle: {
        fontSize: 15,

        color: "#475569",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    emptySubtitle: {
        fontSize: 10,

        color: "#94A3B8",

        marginTop: 6,

        textAlign: "center",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },


    // ====================================================
    // FAB
    // ====================================================

    fab: {
        position: "absolute",

        right: 18,
        bottom: 50,

        height: 52,

        paddingHorizontal: 18,

        borderRadius: 18,

        backgroundColor: "#4A90E2",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#4A90E2",
        shadowOpacity: 0.28,
        shadowRadius: 10,

        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 7,
    },

    fabText: {
        color: "#FFFFFF",

        fontSize: 11,

        marginLeft: 8,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 0.2,
    },


    // ====================================================
    // FILTER MODAL
    // ====================================================

    modalOverlay: {
        flex: 1,

        backgroundColor: "rgba(15, 23, 42, 0.42)",

        justifyContent: "flex-end",
    },

    filterPanel: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 8,
        height: "88%",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: {
            width: 0,
            height: -6,
        },
        elevation: 20,
    },


    // ====================================================
    // MODAL HEADER
    // ====================================================

    modalHandle: {
        alignSelf: "center",

        width: 42,
        height: 4,

        borderRadius: 4,

        backgroundColor: "#D9E0E8",

        marginBottom: 14,
    },

    filterPanelHeader: {
        flexDirection: "row",

        justifyContent: "space-between",
        alignItems: "center",

        marginBottom: 4,
    },

    filterPanelTitle: {
        fontSize: 20,

        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    filterPanelSubtitle: {
        fontSize: 9,

        color: "#94A3B8",

        marginTop: 3,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",
    },

    modalClose: {
        width: 34,
        height: 34,

        borderRadius: 11,

        backgroundColor: "#F1F5F9",

        justifyContent: "center",
        alignItems: "center",
    },


    // ====================================================
    // MAIN FILTER SCROLL
    // ====================================================

    filterScroll: {
        flexGrow: 0,
    },

    filterScrollContent: {
        paddingTop: 2,
        paddingBottom: 5,
    },


    // ====================================================
    // FILTER SECTIONS
    // ====================================================

    sectionHeaderRow: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",
    },

    sectionLabel: {
        fontSize: 9,
        color: "#64748B",
        marginTop: 8,
        marginBottom: 4,
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
        letterSpacing: 0.7,
        textTransform: "uppercase",
    },

    selectedFilterLabel: {
        fontSize: 8,

        color: "#4A90E2",

        marginTop: 14,
        marginBottom: 7,

        maxWidth: 150,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },


    // ====================================================
    // FILTER PILLS
    // ====================================================

    pillRow: {
        flexDirection: "row",

        flexWrap: "wrap",
    },

    pill: {
        flexDirection: "row",

        alignItems: "center",

        backgroundColor: "#F1F5F9",

        paddingHorizontal: 12,
        paddingVertical: 8,

        borderRadius: 11,

        marginRight: 6,
        marginBottom: 5,
    },

    pillActive: {
        backgroundColor: "#4A90E2",
    },

    pillText: {
        color: "#64748B",

        fontSize: 9,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    pillTextActive: {
        color: "#FFFFFF",

        marginLeft: 4,
    },


    // ====================================================
    // LOCALITY SEARCH
    // ====================================================

    localitySearchContainer: {
        height: 38,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        width: "50%",
        borderWidth: 1,
        borderColor: "#E5EBF3",
        borderRadius: 12,
        paddingHorizontal: 11,
        // marginBottom: 4,
    },

    localitySearchContainerSetting: {
        // flex: 1,
        marginVertical: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },

    localitySearchInput: {
        flex: 1,
        height: "100%",
        marginLeft: 8,
        paddingHorizontal: 0,
        color: "#1E293B",
        fontSize: 10,
        fontFamily: "Merriweather_24pt_SemiCondensed-Regular",
    },


    // ====================================================
    // DROPDOWN BOX
    // ====================================================

    dropdownBox: {
        backgroundColor: "#F8FAFC",
        borderRadius: 13,
        borderWidth: 1,
        borderColor: "#EEF2F6",
        overflow: "hidden",
        height: 145,
    },


    // ====================================================
    // DROPDOWN ROWS
    // ====================================================

    userRow: {
        minHeight: 43,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#EDF1F5",
    },

    userRowActive: {
        backgroundColor: "#EAF3FF",
    },

    userRowLeft: {
        flexDirection: "row",

        alignItems: "center",

        flex: 1,
    },

    userAvatar: {
        width: 29,
        height: 29,

        borderRadius: 9,

        backgroundColor: "#EAF3FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 9,
    },

    userAvatarActive: {
        backgroundColor: "#4A90E2",
    },

    userRowText: {
        flex: 1,

        color: "#475569",

        fontSize: 9,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    userRowTextActive: {
        color: "#1D5FA7",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },


    // ====================================================
    // NO SEARCH RESULTS
    // ====================================================

    noResultsContainer: {
        height: 75,

        justifyContent: "center",

        alignItems: "center",
    },

    noResultsText: {
        marginTop: 6,

        fontSize: 9,

        color: "#94A3B8",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },


    // ====================================================
    // FILTER FOOTER
    // ====================================================

    filterPanelFooter: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: "#EEF2F6",
        backgroundColor: "#FFFFFF",
    },

    resetButton: {
        flex: 1,

        height: 45,

        borderRadius: 13,

        backgroundColor: "#F1F5F9",

        flexDirection: "row",

        justifyContent: "center",

        alignItems: "center",

        marginRight: 8,
    },

    resetText: {
        color: "#64748B",

        fontSize: 10,

        marginLeft: 6,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    doneButton: {
        flex: 1.7,

        height: 45,

        borderRadius: 13,

        backgroundColor: "#4A90E2",

        flexDirection: "row",

        justifyContent: "center",

        alignItems: "center",
    },

    doneButtonText: {
        color: "#FFFFFF",

        fontSize: 10,

        marginRight: 8,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

});