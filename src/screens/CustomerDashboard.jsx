// CUSTOMER DASHBOARD
// Customer-facing surface only.
// Uses customer order data from Redux.
// Does not expose employee/admin statistics.

import React, { useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { getCustomerOrderEntry } from "../store/slice/OrderingCustomer.slice";
import { useIsFocused } from "@react-navigation/native";
const formatDate = (date) => {
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
const PURPLE = "#8B5CF6";
const DARK_PURPLE = "#5B21B6";
const LIGHT_PURPLE = "#F3EEFF";
const BG = "#F6F9FD";

const CustomerDashboard = ({ navigation }) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const currUser = useSelector((state) => state.auth?.userData);
  const comid = currUser.Comid
  const {
    customerOrderList = [],
    loading = false,
  } = useSelector((state) => state.orderingCustomer || {});

  // ---------------------------------------------------------
  // FETCH CUSTOMER ORDERS
  // ---------------------------------------------------------

  useEffect(() => {
    if (!currUser?.EmpId || !currUser?.Comid) return;
    const today = new Date();

    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );



    dispatch(
      getCustomerOrderEntry({
        FromDate: formatDate(firstDay),
        Todate: formatDate(today),
        Comid: currUser.Comid,
        OrderStatus: 0,
        CustomerId: currUser.EmpId,
      })
    );
  }, [dispatch, currUser?.EmpId, currUser?.Comid]);

  // ---------------------------------------------------------
  // NORMALIZE ORDERS
  // ---------------------------------------------------------
  const fetchOrders = useCallback(async () => {
    if (!comid || !currUser?.EmpId) return;
    const today = new Date();
    const payload = {
      FromDate: formatDate(today),
      Todate: formatDate(today),
      Comid: comid,
      CustomerId: currUser.EmpId,
      OrderStatus: 2,
    };

    /*
     * IMPORTANT: Status does not exist in the response.
     * Only send OrderStatus when Pending is selected.
     * All = don't send OrderStatus
     */

    await dispatch(getCustomerOrderEntry(payload));
  }, [dispatch, comid, currUser?.EmpId,]);

  // =================================================
  // INITIAL / FOCUS FETCH
  // =================================================

  useEffect(() => {
    if (isFocused) fetchOrders();
  }, [isFocused, fetchOrders]);

  const orders = useMemo(() => {
    if (!Array.isArray(customerOrderList)) return [];

    return [...customerOrderList].sort((a, b) => {
      const dateA = new Date(
        a?.OrderDate || a?.orderDate || 0
      );

      const dateB = new Date(
        b?.OrderDate || b?.orderDate || 0
      );

      return dateB - dateA;
    });
  }, [customerOrderList]);

  // ---------------------------------------------------------
  // LATEST ORDER
  // ---------------------------------------------------------

  const latestOrder = orders.length > 0 ? orders[0] : null;

  // ---------------------------------------------------------
  // COUNTS
  // ---------------------------------------------------------

  const totalOrders = orders.length;

  const completedOrders = orders.filter((item) =>
    isCompleted(item)
  ).length;

  const pendingOrders = totalOrders - completedOrders;

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  function isCompleted(order) {
    const status = String(
      order?.OrderStatus ??
      order?.orderStatus ??
      order?.Status ??
      order?.status ??
      ""
    ).toLowerCase();

    return (
      status === "1" ||
      status === "done" ||
      status === "completed" ||
      status === "complete"
    );
  }

  const getOrderId = (order) =>
    order?.EntryID ||
    "-";

  const getQuantity = (order) =>
    order?.OrderQty ||
    0;

  const formatOrderDate = (dateString) => {
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

  // ---------------------------------------------------------
  // LATEST ORDER STATUS
  // ---------------------------------------------------------

  const latestCompleted = latestOrder
    ? isCompleted(latestOrder)
    : false;

  const latestStatus = latestOrder
    ? latestCompleted
      ? "Completed"
      : "Pending"
    : "No Orders";

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello 👋</Text>

            <Text style={styles.customerName}>
              {currUser?.Emp || "Customer"}
            </Text>

            <Text style={styles.subtitle}>
              What would you like to do today?
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("ProfilePage")}
          >
            <FontAwesome6
              name="user"
              size={17}
              color={DARK_PURPLE}
            />
          </TouchableOpacity>
        </View>

        {/* MAIN ORDER CARD */}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("CustomerOrderForm")}
          style={styles.orderCardWrapper}
        >
          <LinearGradient
            colors={[PURPLE, "#6D4AC7", DARK_PURPLE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orderCard}
          >
            <View style={styles.orderCardContent}>



              {/* Existing Content */}
              <View style={styles.orderTextContainer}>
                <Text style={styles.orderTitle}>
                  Order Gas Cylinder
                </Text>

                <Text style={styles.orderText}>
                  Get your cylinder delivered to your home
                </Text>

                <View style={styles.orderButton}>
                  <Text style={styles.orderButtonText}>
                    Order Now
                  </Text>

                  <FontAwesome6
                    name="arrow-right"
                    size={11}
                    color={DARK_PURPLE}
                  />
                </View>
              </View>

              <View style={styles.orderIconContainer}>
                <MaterialIcons
                  name="propane-tank"
                  size={27}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* QUICK STATS */}

        {/* <View style={styles.statsRow}>
          <StatCard
            icon="receipt"
            value={totalOrders}
            label="Total Orders"
          />

          <StatCard
            icon="clock"
            value={pendingOrders}
            label="Pending"
          />

          <StatCard
            icon="circle-check"
            value={completedOrders}
            label="Completed"
          />
        </View> */}

        {/* QUICK ACTIONS */}

        <Text style={styles.section}>QUICK ACTIONS</Text>

        <View style={styles.grid}>
          <Action
            icon="bottle-water"
            title="Order Cylinder"
            onPress={() =>
              navigation.navigate("CustomerOrderForm")
            }
          />

          <Action
            icon="receipt"
            title="My Orders"
            onPress={() =>
              navigation.navigate("CustomerOrderList")
            }
          />

          <Action
            icon="user"
            title="My Profile"
            onPress={() =>
              navigation.navigate("ProfilePage")
            }
          />
        </View>

        {/* CURRENT / LATEST ORDER */}

        <View style={styles.sectionHeader}>
          <Text style={styles.section}>LATEST ORDER</Text>

          {orders.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CustomerOrderList")
              }
            >
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator
              size="small"
              color={PURPLE}
            />

            <Text style={styles.emptyText}>
              Loading your orders...
            </Text>
          </View>
        ) : latestOrder ? (
          <TouchableOpacity
            style={styles.currentCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                "CustomerOrderDetails",
                {
                  order: latestOrder,
                }
              )
            }
          >
            <View style={styles.currentTop}>
              <View style={styles.orderIconSmall}>
                <FontAwesome6
                  name="bottle-water"
                  size={18}
                  color={PURPLE}
                />
              </View>

              <View style={styles.orderInfo}>
                <Text style={styles.orderNo}>
                  Order #{getOrderId(latestOrder)}
                </Text>

                <Text style={styles.orderDate}>
                  {formatOrderDate(
                    latestOrder?.OrderDate ||
                    latestOrder?.orderDate
                  )}
                </Text>
              </View>

              <FontAwesome6
                name="chevron-right"
                size={13}
                color="#A0A8B5"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.orderDetailsRow}>
              <View>
                <Text style={styles.detailLabel}>
                  CYLINDER
                </Text>

                <Text style={styles.cylinder}>
                  {getQuantity(latestOrder)}  Cylinder
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.detailLabel}>
                  STATUS
                </Text>

                <View
                  style={[
                    styles.status,
                    latestCompleted &&
                    styles.completedStatus,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      latestCompleted &&
                      styles.completedDot,
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusText,
                      latestCompleted &&
                      styles.completedStatusText,
                    ]}
                  >
                    {latestStatus}
                  </Text>
                </View>
              </View>
            </View>

            {!latestCompleted && (
              <View style={styles.pendingInfo}>
                <FontAwesome6
                  name="clock"
                  size={12}
                  color={DARK_PURPLE}
                />

                <Text style={styles.pendingText}>
                  Your order is currently being processed
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <FontAwesome6
                name="bottle-water"
                size={25}
                color={PURPLE}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No orders yet
            </Text>

            <Text style={styles.emptyText}>
              Your recent cylinder orders will appear here.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                navigation.navigate("CustomerOrderForm")
              }
            >
              <Text style={styles.emptyButtonText}>
                Place Your First Order
              </Text>

              <FontAwesome6
                name="arrow-right"
                size={11}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------
// STAT CARD
// ---------------------------------------------------------

const StatCard = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <View style={styles.statIcon}>
      <FontAwesome6
        name={icon}
        size={14}
        color={PURPLE}
      />
    </View>

    <Text style={styles.statValue}>{value}</Text>

    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ---------------------------------------------------------
// QUICK ACTION
// ---------------------------------------------------------

const Action = ({ icon, title, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.action}
    activeOpacity={0.75}
  >
    <View style={styles.actionIcon}>
      <FontAwesome6
        name={icon}
        size={18}
        color={PURPLE}
      />
    </View>

    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: BG,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  // HEADER

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  greeting: {
    fontSize: 13,
    color: "#7A8493",
    fontWeight: "600",
  },

  customerName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#252B35",
    marginTop: 1,
  },

  subtitle: {
    fontSize: 11,
    color: "#7A8493",
    marginTop: 4,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7DFFF",
  },

  // MAIN ORDER CARD

  orderCardWrapper: {
    // marginHorizontal: 16,
    marginVertical: 10,

    borderRadius: 18,

    shadowColor: DARK_PURPLE,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 7,
  },

  orderCard: {
    borderRadius: 18,
    overflow: "hidden",
  },

  orderCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  orderIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  orderTextContainer: {
    flex: 1,
  },

  orderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 5,
  },

  orderText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginBottom: 14,
  },

  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 10,

    gap: 7,
  },

  orderButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: DARK_PURPLE,
  },

  // STATS

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  statCard: {
    width: "31.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E7EDF4",
  },

  statIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    fontSize: 19,
    fontWeight: "900",
    color: "#252B35",
    marginTop: 7,
  },

  statLabel: {
    fontSize: 9,
    color: "#7A8493",
    marginTop: 1,
  },

  // SECTIONS

  section: {
    fontSize: 11,
    fontWeight: "900",
    color: "#252B35",
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: 0.4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewAll: {
    fontSize: 10,
    fontWeight: "800",
    color: DARK_PURPLE,
    marginTop: 13,
  },

  // QUICK ACTIONS

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  action: {
    width: "31.5%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EDF4",
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: "center",
  },

  actionIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  actionText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#252B35",
    textAlign: "center",
    marginTop: 7,
  },

  // CURRENT ORDER

  currentCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EDF4",
    borderRadius: 17,
    padding: 15,
  },

  currentTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  orderIconSmall: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  orderInfo: {
    flex: 1,
    marginLeft: 11,
  },

  orderNo: {
    fontSize: 12,
    fontWeight: "900",
    color: "#252B35",
  },

  orderDate: {
    fontSize: 9,
    color: "#7A8493",
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 13,
  },

  orderDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  detailLabel: {
    fontSize: 8,
    color: "#A0A8B5",
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  cylinder: {
    fontSize: 12,
    color: "#252B35",
    fontWeight: "800",
  },

  statusContainer: {
    alignItems: "flex-end",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PURPLE,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    color: DARK_PURPLE,
    fontWeight: "900",
  },

  completedStatus: {
    backgroundColor: "#ECFDF3",
  },

  completedDot: {
    backgroundColor: "#16A34A",
  },

  completedStatusText: {
    color: "#15803D",
  },

  pendingInfo: {
    marginTop: 13,
    backgroundColor: "#FAF7FF",
    borderRadius: 10,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  pendingText: {
    fontSize: 9,
    color: DARK_PURPLE,
    marginLeft: 7,
    fontWeight: "600",
  },

  // EMPTY STATE

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EDF4",
    borderRadius: 17,
    padding: 25,
    alignItems: "center",
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#252B35",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 10,
    color: "#7A8493",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 15,
  },

  emptyButton: {
    marginTop: 15,
    backgroundColor: PURPLE,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
});

export default CustomerDashboard;
