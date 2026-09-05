import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

import CustomNavBar from "../helper/CustomNavBar";
import { getAllCustomers } from "../store/slice/Customer.slice";
import { getDailyStockEntry } from "../store/slice/DailyStockEntry.slice";
import { COLORS, StatCard, SectionTitle, QuickAction, InfoRow, Card, StatusCard } from "./DashboardComponents";
import { getDailyPayment } from "../store/slice/DailyPayment.slice";
import CustomerDashboard from "./CustomerDashboard";
import { getCustomerOrderEntry } from "../store/slice/OrderingCustomer.slice";

const apiDate = d => {
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

const sameDay = (value, date = new Date()) => {
  if (!value) return false;
  const s = String(value);
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (m) return Number(m[1]) === date.getMonth() + 1 && Number(m[2]) === date.getDate() && Number(m[3]) === date.getFullYear();
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toDateString() === date.toDateString();
};

const roleOf = user => {
  const r = String(user?.UserType || "").toLowerCase();
  if (r === "admin") return "admin";
  if (r.includes("salesperson")) return "sales";
  if (r.includes("user")) return "delivery";
  if (r.includes("customer")) return "customer";
  return "sales";
};

const SUBTITLES = {
  admin: "Overview & business metrics",
  sales: "Customer operations & leads",
  delivery: "Route dispatch & stock summary",
  customer: "Orders & account activity",
};

const AdminDashboard = ({ navigation, customers, stockEntries, gasEntries }) => {
  const total = customers.length;
  const todayCustomers = customers.filter(c => sameDay(c?.CreatedDate || c?.CreatedOn || c?.EntryDate)).length;
  const pending = customers.filter(c => c?.Status === "Pending").length;
  const approved = customers.filter(c => c?.Status === "Approved").length;
  const todayEntries = stockEntries.length;
  const amount = (gasEntries || []).reduce((acc, item) => acc + Number(item.Amount || 0), 0);
  const cylIn = stockEntries.reduce((s, x) => s + Number(x?.CycIn || 0), 0);
  const cylOut = stockEntries.reduce((s, x) => s + Number(x?.CycOut || 0), 0);
  const latestEntry = stockEntries.length > 0 ? stockEntries[stockEntries.length - 1] : null;
  const balCyc = latestEntry ? Number(latestEntry.BalanceCyc || 0) : 0;
  const balEmpty = latestEntry ? Number(latestEntry.BalanceEmpty || 0) : 0;

  return (
    <View style={styles.content}>
      {/* 1. Hero Revenue Card */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.heroCard}
        onPress={() => navigation.getParent()?.navigate("PaymentEntryList")}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <FontAwesome6 name="shield-halved" size={11} color="#A7F3D0" />
            <Text style={styles.heroBadgeText}>TODAY'S TOTAL INFLOW</Text>
          </View>
          <Text style={styles.heroValue}>₹{amount.toLocaleString("en-IN")}</Text>
          <Text style={styles.heroSubtitle}>{todayEntries} stock transactions recorded today</Text>
        </View>
        <View style={styles.heroIconBubble}>
          <FontAwesome6 name="indian-rupee-sign" size={26} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* 2. Key Metrics Grid */}
      <View style={styles.sectionHeaderWrap}>
        <SectionTitle title="PRIMARY METRICS" />
      </View>
      <View style={styles.grid}>
        <StatCard
          icon="users"
          title="Total Clients"
          value={total}
          subtitle={`+${todayCustomers} registered today`}
          color={COLORS.blue}
          bg={COLORS.blueLight}
          onPress={() => navigation.navigate("CustomerList")}
        />
        <StatCard
          icon="clock-rotate-left"
          title="Action Required"
          value={pending}
          subtitle="Pending approvals"
          color={COLORS.orange}
          bg={COLORS.orangeLight}
          onPress={() => navigation.navigate("CustomerList", { status: "Pending", fromDashboard: true })}
        />
        <StatCard
          icon="boxes-stacked"
          title="Daily Logs"
          value={todayEntries}
          subtitle="Stock records"
          color={COLORS.purple}
          bg={COLORS.purpleLight}
          onPress={() => navigation.getParent()?.navigate("EntryList")}
        />
        <StatCard
          icon="circle-check"
          title="Verified"
          value={approved}
          subtitle="Approved active"
          color={COLORS.green}
          bg={COLORS.greenLight}
          onPress={() => navigation.navigate("CustomerList", { status: "Approved", fromDashboard: true })}
        />
      </View>

      {/* 3. Operational Quick Actions */}
      <View style={styles.sectionHeaderWrap}>
        <SectionTitle title="FREQUENT WORKFLOWS" />
      </View>
      <View style={styles.quickGrid}>
        <QuickAction
          icon="user-plus"
          title="New Client"
          onPress={() => navigation.navigate("CreateCustomer")}
          color={COLORS.green}
          bg={COLORS.greenLight}
        />
        <QuickAction
          icon="cart-plus"
          title="Place Order"
          onPress={() => navigation.navigate("CustomerOrderForm")}
          color="#059669"
          bg="#ECFDF5"
        />
        <QuickAction
          icon="boxes-stacked"
          title="Stock Entries"
          onPress={() => navigation.getParent()?.navigate("EntryList")}
          color={COLORS.blue}
          bg={COLORS.blueLight}
        />
        <QuickAction
          icon="receipt"
          title="Expenses"
          onPress={() => navigation.getParent()?.navigate("ExpenseEntryList")}
          color={COLORS.orange}
          bg={COLORS.orangeLight}
        />
        <QuickAction
          icon="money-bill-wave"
          title="Collections"
          onPress={() => navigation.getParent()?.navigate("PaymentEntryList")}
          color={COLORS.purple}
          bg={COLORS.purpleLight}
        />
        <QuickAction
          icon="clipboard-check"
          title="Orders Log"
          onPress={() => navigation.getParent()?.navigate("ApproveCustomerOrder")}
          color="#2563EB"
          bg="#EFF6FF"
        />
      </View>

      {/* 4. Cylinder Movement Strip */}
      <View style={styles.sectionHeaderWrap}>
        <SectionTitle
          title="CYLINDER MOVEMENT"
          action="View All"
          onPress={() => navigation.getParent()?.navigate("EntryList")}
        />
      </View>
      <View style={styles.flowStrip}>
        {/* IN */}
        <View style={styles.flowBlock}>
          <View style={[styles.flowIconBox, { backgroundColor: "#ECFDF5" }]}>
            <FontAwesome6 name="arrow-down-long" size={13} color="#059669" />
          </View>
          <Text style={styles.flowValue}>{cylIn}</Text>
          <Text style={styles.flowLabel} numberOfLines={1}>IN</Text>
        </View>

        <View style={styles.flowDivider} />

        {/* OUT */}
        <View style={styles.flowBlock}>
          <View style={[styles.flowIconBox, { backgroundColor: "#FFF1F2" }]}>
            <FontAwesome6 name="arrow-up-long" size={13} color="#E11D48" />
          </View>
          <Text style={styles.flowValue}>{cylOut}</Text>
          <Text style={styles.flowLabel} numberOfLines={1}>OUT</Text>
        </View>

        <View style={styles.flowDivider} />

        {/* BAL CYC */}
        <View style={styles.flowBlock}>
          <View style={[styles.flowIconBox, { backgroundColor: "#EFF6FF" }]}>
            <FontAwesome6 name="boxes-stacked" size={13} color="#2563EB" />
          </View>
          <Text style={styles.flowValue}>{balCyc}</Text>
          <Text style={styles.flowLabel} numberOfLines={1}>BAL CYC</Text>
        </View>

        <View style={styles.flowDivider} />

        {/* BAL EMPTY */}
        <View style={styles.flowBlock}>
          <View style={[styles.flowIconBox, { backgroundColor: "#F5F3FF" }]}>
            <FontAwesome6 name="recycle" size={13} color="#7C3AED" />
          </View>
          <Text style={styles.flowValue}>{balEmpty}</Text>
          <Text style={styles.flowLabel} numberOfLines={1}>EMPTY</Text>
        </View>
      </View>

      {/* 5. Detailed Operational Breakdown */}
      <Card style={styles.detailCard}>
        <SectionTitle title="DAILY PERFORMANCE BREAKDOWN" />
        <InfoRow icon="user-plus" title="Onboarded Today" value={todayCustomers} color={COLORS.green} />
        <InfoRow icon="clipboard-list" title="Total Shifts Recorded" value={todayEntries} color={COLORS.blue} />
        <InfoRow icon="indian-rupee-sign" title="Net Daily Payment" value={`₹${amount.toLocaleString("en-IN")}`} color={COLORS.purple} />
      </Card>
    </View>
  );
};

const SalesDashboard = ({ navigation, user, customers }) => {
  const mine = customers.filter(c => String(c?.SalespersonId) === String(user?.EmpId));
  const approved = mine.filter(c => c?.Status === "Approved").length;
  const month = mine.filter(c => {
    const d = new Date(c?.CreatedDate || c?.CreatedOn || c?.EntryDate);
    const now = new Date();
    return !Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <View style={styles.content}>
      <View style={styles.sectionHeaderWrap}>
        <SectionTitle title="MY PERFORMANCE" />
      </View>
      <View style={styles.grid}>
        <StatCard
          icon="users"
          title="Assigned Accounts"
          value={mine.length}
          subtitle="Portfolio count"
          color={COLORS.blue}
          bg={COLORS.blueLight}
        />
        <StatCard
          icon="calendar-plus"
          title="New This Month"
          value={month}
          subtitle="Recent additions"
          color={COLORS.purple}
          bg={COLORS.purpleLight}
        />
      </View>

      <Card style={styles.detailCard}>
        <View style={styles.bigMetricRow}>
          <View style={[styles.bigMetricIcon, { backgroundColor: COLORS.greenLight }]}>
            <FontAwesome6 name="user-check" size={20} color={COLORS.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.metricLabel}>VERIFIED ACCOUNTS</Text>
            <Text style={styles.metricValue}>{approved}</Text>
            <Text style={styles.metricSub}>Accounts currently approved and active</Text>
          </View>
        </View>
      </Card>

      <View style={styles.sectionHeaderWrap}>
        <SectionTitle title="QUICK ACTIONS" />
      </View>
      <View style={styles.quickGrid}>
        <QuickAction
          icon="user-plus"
          title="Add Customer"
          onPress={() => navigation.navigate("CreateCustomer")}
          color={COLORS.green}
          bg={COLORS.greenLight}
        />
        <QuickAction
          icon="address-book"
          title="My Directory"
          onPress={() => navigation.navigate("CustomerList")}
          color={COLORS.blue}
          bg={COLORS.blueLight}
        />
        <QuickAction
          icon="cart-plus"
          title="Create Order"
          onPress={() => navigation.navigate("CustomerOrderForm")}
          color="#059669"
          bg="#ECFDF5"
        />
        <QuickAction
          icon="clipboard-check"
          title="Order Status"
          onPress={() => navigation.getParent()?.navigate("ApproveCustomerOrder")}
          color="#2563EB"
          bg="#EFF6FF"
        />
      </View>

      <View style={[styles.infoBanner, { backgroundColor: COLORS.blueLight }]}>
        <FontAwesome6 name="shield-halved" size={18} color={COLORS.blue} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.bannerTitle}>Account Privacy Protected</Text>
          <Text style={styles.bannerText}>Only customer records created under your Employee ID are displayed in this view.</Text>
        </View>
      </View>
    </View>
  );
};

const DeliveryDashboard = ({ navigation, user, customers, stockEntries, orders }) => {
  const pending = stockEntries.filter(x => Number(x?.PendingStatus ?? x?.Pending ?? 0) === 0);
  const pendingOrders = orders.length;
  const completed = stockEntries.filter(x => Number(x?.PendingStatus ?? x?.Pending ?? 0) === 1);
  const cylIn = stockEntries.reduce((s, x) => s + Number(x?.CycIn || 0), 0);
  const cylOut = stockEntries.reduce((s, x) => s + Number(x?.CycOut || 0), 0);
  const latestEntry = stockEntries.length > 0 ? stockEntries[stockEntries.length - 1] : null;
  const balCyc = latestEntry ? Number(latestEntry.BalanceCyc || 0) : 0;
  const balEmpty = latestEntry ? Number(latestEntry.BalanceEmpty || 0) : 0;

  return (
    <View style={styles.content}>
      <View style={styles.sectionHeaderWrap}>
        <SectionTitle title="DELIVERY STATUS" />
      </View>
      <StatusCard
        icon="truck-fast"
        title="PENDING DELIVERIES"
        status={pendingOrders > 0 ? "In Progress" : "Clear"}
        subtitle={`${pendingOrders} customer orders awaiting drop-off`}
        color={COLORS.orange}
        onPress={() => navigation.getParent()?.navigate("ApproveCustomerOrder")}
      />
      <StatusCard
        icon="boxes-stacked"
        title="TODAY'S STOCK TRANSACTION"
        status={pending.length ? "Pending Log" : completed.length ? "Logged" : "Not Started"}
        subtitle={pending.length ? `${pending.length} unsaved entries` : `${completed.length} batches saved`}
        color={COLORS.blue}
        onPress={() => navigation.getParent()?.navigate("EntryList")}
      />

      <View style={styles.flowStrip}>
        {/* IN */}
        <View style={styles.flowBlock}>
          <View style={[styles.flowIconBox, { backgroundColor: "#ECFDF5" }]}>
            <FontAwesome6 name="arrow-down-long" size={13} color="#059669" />
          </View>
          <Text style={styles.flowValue}>{cylIn}</Text>
          <Text style={styles.flowLabel} numberOfLines={1}>IN</Text>
        </View>

        <View style={styles.flowDivider} />

        {/* OUT */}
        <View style={styles.flowBlock}>
          <View style={[styles.flowIconBox, { backgroundColor: "#FFF1F2" }]}>
            <FontAwesome6 name="arrow-up-long" size={13} color="#E11D48" />
          </View>
          <Text style={styles.flowValue}>{cylOut}</Text>
          <Text style={styles.flowLabel} numberOfLines={1}>OUT</Text>
        </View>

        <View style={styles.flowDivider} />

        {/* BAL CYC */}
        <View style={styles.flowBlock}>
          <View style={[styles.flowIconBox, { backgroundColor: "#EFF6FF" }]}>
            <FontAwesome6 name="boxes-stacked" size={13} color="#2563EB" />
          </View>
          <Text style={styles.flowValue}>{balCyc}</Text>
          <Text style={styles.flowLabel} numberOfLines={1}>BAL CYC</Text>
        </View>

        <View style={styles.flowDivider} />

        {/* BAL EMPTY */}
        <View style={styles.flowBlock}>
          <View style={[styles.flowIconBox, { backgroundColor: "#F5F3FF" }]}>
            <FontAwesome6 name="recycle" size={13} color="#7C3AED" />
          </View>
          <Text style={styles.flowValue}>{balEmpty}</Text>
          <Text style={styles.flowLabel} numberOfLines={1}>EMPTY</Text>
        </View>
      </View>


      <View style={styles.sectionHeaderWrap}>
        <SectionTitle title="ROUTE SHORTCUTS" />
      </View>
      <View style={styles.quickGrid}>
        <QuickAction
          icon="boxes-stacked"
          title="Daily Entry"
          onPress={() => navigation.getParent()?.navigate("DailyStockEntry")}
          color={COLORS.orange}
          bg={COLORS.orangeLight}
        />
        <QuickAction
          icon="cart-plus"
          title="New Order"
          onPress={() => navigation.navigate("CustomerOrderForm")}
          color="#059669"
          bg="#ECFDF5"
        />
        <QuickAction
          icon="clipboard-check"
          title="Dispatch Logs"
          onPress={() => navigation.getParent()?.navigate("ApproveCustomerOrder")}
          color={COLORS.purple}
          bg={COLORS.purpleLight}
        />
        <QuickAction
          icon="user-plus"
          title="Add Customer"
          onPress={() => navigation.navigate("CreateCustomer")}
          color={COLORS.green}
          bg={COLORS.greenLight}
        />
      </View>

      <Card style={styles.detailCard}>
        <SectionTitle title="SHIFT SUMMARY" />
        <InfoRow icon="clock" title="Unsubmitted Logs" value={pending.length} color={COLORS.orange} />
        <InfoRow icon="truck-ramp-box" title="Pending Deliveries" value={pendingOrders} color={COLORS.orange} />
        <InfoRow icon="circle-check" title="Completed Transactions" value={completed.length} color={COLORS.green} />
      </Card>
    </View>
  );
};

const UserHomeDashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const focused = useIsFocused();
  const user = useSelector(state => state.auth.userData);
  const customersData = useSelector(state => state.customer.customerList);
  const stockData = useSelector(state => state.dailyEntry.stockEntryList);
  const gasEntries = useSelector(state => state.dailyPayment.paymentList);
  const orders = useSelector(state => state.orderingCustomer.customerOrderList) || [];
  const customers = Array.isArray(customersData) ? customersData : [];
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.Comid) return;
    const d = new Date();
    const isDeliveryOrAdmin = String(user?.UserType) === "Admin" || String(user?.UserType).toLowerCase().includes("user");
    const isAdmin = String(user?.UserType).toLowerCase().includes("admin");

    await dispatch(getAllCustomers(user.Comid));

    if (isDeliveryOrAdmin) {
      await Promise.all([
        dispatch(getDailyStockEntry({ Comid: user.Comid, FromDate: apiDate(d), Todate: apiDate(d), PendingStatus: 2, AdminApproval: 2 })),
        dispatch(getCustomerOrderEntry({ FromDate: apiDate(d), Todate: apiDate(d), Comid: user.Comid, CustomerId: 0, OrderStatus: 0 }))
      ]);
    }
    if (isAdmin) {
      await dispatch(getDailyPayment({ FromDate: apiDate(d), Todate: apiDate(d), PendingStatus: 2, Comid: user.Comid, AdminApproval: 2 }));
    }
  }, [dispatch, user?.Comid, user?.UserType]);

  useEffect(() => {
    if (focused) fetchData();
  }, [focused, fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  const entries = Array.isArray(stockData) ? stockData : [];
  const role = roleOf(user);

  return (
    <View style={styles.container}>
      <CustomNavBar navName="Dashboard" subtitle={SUBTITLES[role]} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />}
        contentContainerStyle={styles.scrollContainer}
      >
        {role === "admin" && <AdminDashboard navigation={navigation} customers={customers} stockEntries={entries} gasEntries={gasEntries} />}
        {role === "sales" && <SalesDashboard navigation={navigation} user={user} customers={customers} />}
        {role === "delivery" && <DeliveryDashboard navigation={navigation} user={user} customers={customers} stockEntries={entries} orders={orders} />}
        {role === "customer" && <CustomerDashboard navigation={navigation} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeaderWrap: {
    marginTop: 10,
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* Hero Banner */
  heroCard: {
    backgroundColor: "#065F46",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#065F46",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroContent: {
    flex: 1,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#A7F3D0",
    marginLeft: 5,
    letterSpacing: 0.6,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: 11,
    color: "#D1FAE5",
    marginTop: 3,
    fontWeight: "500",
  },
  heroIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  /* Cylinder Flow Strip - Redesigned Balanced Horizontal Layout */
  flowStrip: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  flowBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  flowIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  flowValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.2,
  },
  flowLabel: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.3,
    marginTop: 2,
    textTransform: "uppercase",
  },
  flowDivider: {
    width: 1,
    height: 38,
    backgroundColor: "#F1F5F9",
  },

  /* Cards and Banners */
  detailCard: {
    marginBottom: 14,
    borderRadius: 16,
  },
  bigMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  bigMetricIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: "900",
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 1,
  },
  infoBanner: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E40AF",
  },
  bannerText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 2,
  },
});

export default UserHomeDashboard;