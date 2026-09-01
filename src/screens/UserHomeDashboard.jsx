import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

import CustomNavBar from "../helper/CustomNavBar";
import { getAllCustomers } from "../store/slice/Customer.slice";
import { getDailyStockEntry } from "../store/slice/DailyStockEntry.slice";
import { COLORS, StatCard, SectionTitle, QuickAction, InfoRow, Card, StatusCard } from "./DashboardComponents";

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
  return "sales";
};

const SUBTITLES = {
  admin: "your business overview at a glance",
  sales: "your customer overview at a glance",
  delivery: "your daily work overview at a glance",
};

// Note: Header is no longer rendered per-dashboard — it's rendered once,
// outside the ScrollView, in UserHomeDashboard below.

const AdminDashboard = ({ navigation, customers, stockEntries }) => {
  const total = customers.length;
  const todayCustomers = customers.filter(c => sameDay(c?.CreatedDate || c?.CreatedOn || c?.EntryDate)).length;
  const pending = customers.filter(c => c?.Status === "Pending").length;
  const approved = customers.filter(c => c?.Status === "Approved").length;
  const todayEntries = stockEntries.length;
  const amount = stockEntries.reduce((s, x) => s + Number(x?.Amount || 0), 0);

  return (
    <View style={styles.content}>
      <SectionTitle title="OVERVIEW" />
      <View style={styles.grid}>
        <StatCard icon="users" title="Total Customers" value={total} subtitle={`${todayCustomers} created today`} color={COLORS.green} bg={COLORS.greenLight} />
        <StatCard icon="clipboard-list" title="Today's Entries" value={todayEntries} subtitle="Stock transactions" color={COLORS.blue} bg={COLORS.blueLight} />
        <StatCard icon="circle-check" title="Approved Customers" value={approved} subtitle="Approved records" color={COLORS.green} bg={COLORS.greenLight} />
        <StatCard icon="clock" title="Pending Approvals" value={pending} subtitle="Needs attention" color={COLORS.orange} bg={COLORS.orangeLight} />
      </View>

      <Card style={styles.collection}>
        <View style={styles.collectionLeft}>
          <Text style={styles.collectionLabel}>TODAY'S COLLECTION</Text>
          <Text style={styles.collectionAmount}>₹{amount.toLocaleString("en-IN")}</Text>
          <Text style={styles.collectionSub}>From today's stock entries</Text>
        </View>
        <View style={styles.collectionIcon}><FontAwesome6 name="indian-rupee-sign" size={22} color="#fff" /></View>
      </Card>

      <SectionTitle title="QUICK ACTIONS" />
      <View style={styles.quickGrid}>
        <QuickAction icon="user-plus" title="Add Customer" onPress={() => navigation.navigate("CreateCustomer")} color={COLORS.green} bg={COLORS.greenLight} />
        <QuickAction icon="clipboard-list" title="Daily Entry" onPress={() => navigation.getParent()?.navigate("DailyStockEntry")} color={COLORS.blue} bg={COLORS.blueLight} />
        {/* <QuickAction icon="user-check" title="Approvals" onPress={() => navigation.navigate("ApproveCustomer")} color={COLORS.orange} bg={COLORS.orangeLight} /> */}
        <QuickAction icon="money-bill" title="Payments" onPress={() => navigation.getParent()?.navigate("PaymentEntryList")} color={COLORS.purple} bg={COLORS.purpleLight} />
      </View>

      <Card>
        <SectionTitle title="TODAY'S OVERVIEW" />
        <InfoRow icon="user-plus" title="New Customers Today" value={todayCustomers} color={COLORS.green} />
        <InfoRow icon="clipboard-list" title="Today's Entries" value={todayEntries} color={COLORS.blue} />
        <InfoRow icon="clock" title="Pending Approvals" value={pending} color={COLORS.orange} />
        <InfoRow icon="money-bill" title="Today's Collection" value={`₹${amount.toLocaleString("en-IN")}`} color={COLORS.purple} />
      </Card>

      <Card>
        <SectionTitle title="STOCK ACTIVITY" action="View All" onPress={() => navigation.getParent()?.navigate("EntryList")} />
        <InfoRow icon="arrow-down" title="Cylinders In" value={stockEntries.reduce((s, x) => s + Number(x?.CycIn || 0), 0)} color={COLORS.green} />
        <InfoRow icon="arrow-up" title="Cylinders Out" value={stockEntries.reduce((s, x) => s + Number(x?.CycOut || 0), 0)} color={COLORS.orange} />
        <InfoRow icon="box-open" title="Empty Balance" value={stockEntries.reduce((s, x) => s + Number(x?.BalCyc || 0), 0)} color={COLORS.blue} />
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
      <SectionTitle title="MY OVERVIEW" />
      <View style={styles.grid}>
        <StatCard icon="users" title="My Customers" value={mine.length} subtitle="Created by me" color={COLORS.blue} bg={COLORS.blueLight} />
        <StatCard icon="user-plus" title="Created This Month" value={month} subtitle="This month" color={COLORS.blue} bg={COLORS.blueLight} />
      </View>

      <Card>
        <View style={styles.bigMetricRow}>
          <View style={[styles.bigMetricIcon, { backgroundColor: COLORS.blueLight }]}><FontAwesome6 name="user-check" size={21} color={COLORS.blue} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.metricLabel}>APPROVED CUSTOMERS</Text>
            <Text style={styles.metricValue}>{approved}</Text>
            <Text style={styles.metricSub}>From your customers</Text>
          </View>
        </View>
      </Card>

      <SectionTitle title="QUICK ACTIONS" />
      <View style={styles.quickGrid}>
        <QuickAction icon="user-plus" title="Add Customer" onPress={() => navigation.navigate("CreateCustomer")} color={COLORS.green} bg={COLORS.greenLight} />
        <QuickAction icon="users" title="My Customers" onPress={() => navigation.navigate("Home")} color={COLORS.blue} bg={COLORS.blueLight} />
      </View>

      <Card>
        <SectionTitle title="MY CUSTOMERS" />
        <InfoRow icon="users" title="Total Customers" value={mine.length} color={COLORS.blue} />
        <InfoRow icon="circle-check" title="Approved Customers" value={approved} color={COLORS.green} />
        <InfoRow icon="calendar" title="Added This Month" value={month} color={COLORS.purple} />
      </Card>

      <View style={[styles.infoBanner, { backgroundColor: COLORS.blueLight }]}>
        <FontAwesome6 name="chart-line" size={20} color={COLORS.blue} />
        <View style={{ flex: 1, marginLeft: 11 }}>
          <Text style={styles.bannerTitle}>Your customer base</Text>
          <Text style={styles.bannerText}>Only customers created by you are shown here. Customer pending status is intentionally hidden.</Text>
        </View>
      </View>
    </View>
  );
};

const DeliveryDashboard = ({ navigation, user, customers, stockEntries }) => {
  const mine = customers.filter(c => String(c?.SalespersonId) === String(user?.EmpId));
  const pending = stockEntries.filter(x => Number(x?.PendingStatus ?? x?.Pending ?? 0) === 0);
  const completed = stockEntries.filter(x => Number(x?.PendingStatus ?? x?.Pending ?? 0) === 1);
  const amount = stockEntries.reduce((s, x) => s + Number(x?.Amount || 0), 0);

  return (
    <View style={styles.content}>
      <SectionTitle title="MY OVERVIEW" />
      <View style={styles.grid}>
        <StatCard icon="users" title="My Customers" value={mine.length} subtitle="Created by me" color={COLORS.orange} bg={COLORS.orangeLight} />
        <StatCard icon="user-plus" title="Created This Month" value={mine.length} subtitle="Customer records" color={COLORS.orange} bg={COLORS.orangeLight} />
      </View>

      <StatusCard icon="clipboard-list" title="TODAY'S STOCK ENTRY" status={pending.length ? "Pending" : completed.length ? "Completed" : "Not Created"} subtitle={pending.length ? `${pending.length} entries not submitted` : `${completed.length} completed entries`} color={pending.length ? COLORS.orange : COLORS.green} onPress={() => navigation.getParent()?.navigate("DailyStockEntry")} />

      <SectionTitle title="QUICK ACTIONS" />
      <View style={styles.quickGrid}>
        <QuickAction icon="user-plus" title="Add Customer" onPress={() => navigation.navigate("CreateCustomer")} color={COLORS.green} bg={COLORS.greenLight} />
        <QuickAction icon="clipboard-list" title="Daily Stock Entry" onPress={() => navigation.getParent()?.navigate("DailyStockEntry")} color={COLORS.orange} bg={COLORS.orangeLight} />
      </View>

      <Card>
        <SectionTitle title="TODAY'S STOCK ENTRIES" />
        <InfoRow icon="clock" title="Pending Entries" subtitle="Not submitted" value={pending.length} color={COLORS.orange} />
        <InfoRow icon="circle-check" title="Completed Entries" subtitle="Submitted" value={completed.length} color={COLORS.green} />
        <InfoRow icon="money-bill" title="Today's Amount" value={`₹${amount.toLocaleString("en-IN")}`} color={COLORS.purple} />
      </Card>

      <Card>
        <SectionTitle title="STOCK SUMMARY" action="View All" onPress={() => navigation.getParent()?.navigate("EntryList")} />
        <InfoRow icon="arrow-down" title="Cylinders In" value={stockEntries.reduce((s, x) => s + Number(x?.CycIn || 0), 0)} color={COLORS.green} />
        <InfoRow icon="arrow-up" title="Cylinders Out" value={stockEntries.reduce((s, x) => s + Number(x?.CycOut || 0), 0)} color={COLORS.orange} />
        <InfoRow icon="box-open" title="Empty Balance" value={stockEntries.reduce((s, x) => s + Number(x?.BalCyc || 0), 0)} color={COLORS.blue} />
      </Card>

      <View style={[styles.infoBanner, { backgroundColor: COLORS.orangeLight }]}>
        <FontAwesome6 name="circle-info" size={20} color={COLORS.orange} />
        <View style={{ flex: 1, marginLeft: 11 }}>
          <Text style={[styles.bannerTitle, { color: "#9A5B00" }]}>Daily stock workflow</Text>
          <Text style={styles.bannerText}>Entries stay pending until submitted. Completed entries can be viewed from today and previous days.</Text>
        </View>
      </View>
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
  const customers = Array.isArray(customersData) ? customersData : [];
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.Comid) return;
    await dispatch(getAllCustomers(user.Comid));
    if (String(user?.UserType) === "Admin" || String(user?.UserType).toLowerCase().includes("delivery")) {
      const d = new Date();
      await dispatch(getDailyStockEntry({ Comid: user.Comid, FromDate: apiDate(d), Todate: apiDate(d), PendingStatus: 0, AdminApproval: 0 }));
    }
  }, [dispatch, user?.Comid, user?.UserType]);

  useEffect(() => { fetchData() }, [fetchData]);
  useEffect(() => { if (focused) fetchData() }, [focused]);

  const onRefresh = async () => { setRefreshing(true); try { await fetchData() } finally { setRefreshing(false) } };
  const entries = Array.isArray(stockData) ? stockData : [];

  const role = roleOf(user);

  return (
    <View style={styles.container}>
      {/* Sticky header: sits outside the ScrollView so it never scrolls away */}
      <CustomNavBar navName="Dashboard" subtitle={SUBTITLES[role]} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {role === "admin" && <AdminDashboard navigation={navigation} customers={customers} stockEntries={entries} />}
        {role === "sales" && <SalesDashboard navigation={navigation} user={user} customers={customers} />}
        {role === "delivery" && <DeliveryDashboard navigation={navigation} user={user} customers={customers} stockEntries={entries} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 16, marginTop: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 },
  collection: { backgroundColor: COLORS.green, flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 17 },
  collectionLeft: { flex: 1 },
  collectionLabel: { fontSize: 9, color: "#D8F5E4", fontWeight: "700", letterSpacing: .6 },
  collectionAmount: { fontSize: 26, color: "#fff", fontWeight: "900", marginTop: 4 },
  collectionSub: { fontSize: 9, color: "#D8F5E4", marginTop: 2 },
  collectionIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: "rgba(255,255,255,.16)", alignItems: "center", justifyContent: "center" },
  bigMetricRow: { flexDirection: "row", alignItems: "center" },
  bigMetricIcon: { width: 50, height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 12 },
  metricLabel: { fontSize: 9, color: COLORS.muted, fontWeight: "700", letterSpacing: .5 },
  metricValue: { fontSize: 26, color: COLORS.text, fontWeight: "900", marginTop: 2 },
  metricSub: { fontSize: 9, color: COLORS.muted },
  infoBanner: { borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", marginTop: 2 },
  bannerTitle: { fontSize: 12, fontWeight: "800", color: "#24599A" },
  bannerText: { fontSize: 10, lineHeight: 15, color: COLORS.muted, marginTop: 3 },
});

export default UserHomeDashboard;