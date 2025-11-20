// src/screens/ThanhToanScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, StatusBar, View, Text, TouchableOpacity,
  ScrollView, TextInput, StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { sessionService } from '../services/sessionService';
import { createBillFromSession } from '../services/billService'; // Import bill service

const currency = (n = 0) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0
  });

export default function ThanhToanScreen({ navigation, route }) {
  const [paidBy] = useState("Tiền mặt");
  const [customerCash, setCustomerCash] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [playingTime, setPlayingTime] = useState(0);
  const [processing, setProcessing] = useState(false); // State cho việc xử lý thanh toán

  // Lấy params từ navigation
  const { sessionId, tableName, totalAmount } = route?.params || {};

  // Load session data
  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      console.log('💳 Loading payment data for session:', sessionId);
      
      const response = await sessionService.getById(sessionId);
      const session = response.data || response;
      
      setSessionData(session);
      
      // Tính thời gian chơi
      if (session.startTime) {
        const startTime = new Date(session.startTime);
        const currentTime = new Date();
        const playingMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
        setPlayingTime(playingMinutes);
      }
      
      console.log('✅ Payment data loaded:', {
        sessionId,
        tableName: session.table?.name,
        totalAmount
      });
      
    } catch (error) {
      console.error('❌ Error loading payment data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán và tạo bill
  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      if (!sessionData) {
        Alert.alert('Lỗi', 'Không có thông tin session để thanh toán');
        return;
      }

      // Kiểm tra tiền khách trả
      const paidAmount = Number(customerCash || 0);
      if (paidAmount < needToPay) {
        Alert.alert('Lỗi', 'Số tiền khách trả không đủ');
        return;
      }

      console.log('💳 Processing payment for session:', sessionId);

      // Tạo bill từ session data
      const paymentData = {
        tableName: tableName,
        paymentMethod: paidBy === 'Tiền mặt' ? 'cash' : 'card',
        ratePerHour: sessionData.pricingSnapshot?.ratePerHour || 40000,
        totalAmount: needToPay,
        paidAmount: paidAmount,
        changeAmount: Math.max(change, 0)
      };

      const newBill = await createBillFromSession(sessionData, paymentData);
      
      console.log('✅ Bill created successfully:', newBill);

      // Chuyển tới màn thành công
      navigation.navigate("ThanhToanSuccess", {
        sessionId: sessionId,
        billId: newBill._id || newBill.id,
        tableName: tableName || sessionData?.table?.name,
        area: "Khu vực 1 - 10",
        need: needToPay,
        paid: paidAmount,
        change: Math.max(change, 0),
        billCode: newBill.code
      });

    } catch (error) {
      console.error('❌ Payment error:', error);
      Alert.alert(
        'Lỗi thanh toán', 
        error.response?.data?.message || error.message || 'Không thể xử lý thanh toán'
      );
    } finally {
      setProcessing(false);
    }
  };

  // Tính toán các giá trị
  const subtotal = totalAmount || 0;
  const needToPay = subtotal;
  const change = useMemo(
    () => Number(customerCash || 0) - needToPay,
    [customerCash, needToPay]
  );

  const quicks = [0, needToPay, Math.ceil(needToPay / 100000) * 100000];

  // Format thời gian
  const formatTime = () => {
    if (!sessionData?.startTime) return "Chưa bắt đầu";
    
    const startTime = new Date(sessionData.startTime);
    return startTime.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1677FF" />
          <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (!sessionData && !totalAmount) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin thanh toán</Text>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh Toán</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Thông tin hoá đơn */}
        <Section title="Thông tin hoá đơn" icon={<FontAwesome5 name="receipt" size={16} color="#111827" />}>
          <Row left="Dùng tại bàn" right={tableName || sessionData?.table?.name || "Không xác định"} />
          <Row left="Thời gian bắt đầu" right={formatTime()} />
          {playingTime > 0 && (
            <Row left="Thời gian chơi" right={`${Math.floor(playingTime / 60)}h${playingTime % 60}m`} />
          )}
        </Section>

        {/* Thông tin khách hàng */}
        <Section title="Thông tin khách hàng" icon={<Ionicons name="person-circle" size={18} color="#111827" />}>
          <TouchableOpacity style={styles.inputLike}>
            <Text style={styles.muted}>Khách lẻ</Text>
            <Ionicons name="search" size={18} color="#3b82f6" />
          </TouchableOpacity>
        </Section>

        {/* Thông tin thanh toán */}
        <Section title="Thông tin thanh toán" icon={<Ionicons name="cash-outline" size={18} color="#111827" />}>
          <Row left={`Tổng tạm tính`} right={currency(subtotal)} />

          {/* Cần thanh toán */}
          <View style={styles.needPayBox}>
            <Text style={styles.needPayLabel}>Cần thanh toán</Text>
            <Text style={styles.needPayValue}>{currency(needToPay)}</Text>
          </View>

          {/* PT thanh toán */}
          <View style={styles.inline}>
            <Text style={styles.label}>PT thanh toán</Text>
            <View style={styles.methodBtn}>
              <Text style={styles.methodText}>{paidBy}</Text>
              <Ionicons name="chevron-forward" size={18} color="#3b82f6" />
            </View>
          </View>

          {/* Nhập tiền khách trả */}
          <View style={styles.inline}>
            <Text style={styles.label}>Nhập tiền khách trả</Text>
            <View style={styles.amountInputWrap}>
              <TextInput
                value={customerCash}
                onChangeText={setCustomerCash}
                placeholder="0đ"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={styles.amountInput}
                editable={!processing}
              />
            </View>
          </View>

          {/* Tiền thừa */}
          <Row left="Tiền thừa" right={currency(Math.max(change, 0))} />

          {/* Quick amounts */}
          <View style={styles.quickWrap}>
            {quicks.map((q, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.quickBtn, processing && styles.quickBtnDisabled]}
                onPress={() => setCustomerCash(String(q))}
                disabled={processing}
              >
                <Text style={styles.quickText}>{currency(q)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Nút xác nhận */}
        <TouchableOpacity
          style={[styles.primaryBtn, processing && styles.primaryBtnDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.primaryText, { marginLeft: 8 }]}>Đang xử lý...</Text>
            </View>
          ) : (
            <Text style={styles.primaryText}>Xác nhận thanh toán</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const Section = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.sectionIcon}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Row = ({ left, right }) => (
  <View style={styles.row}>
    <Text style={styles.rowLeft}>{left}</Text>
    <Text style={styles.rowRight}>{right}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F7FB" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#F5F7FB" },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", color: "#111827" },
  container: { padding: 12, paddingBottom: 0 },
  
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtnText: {
    color: '#1677FF',
    fontWeight: '600',
  },
  
  section: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden" },
  sectionHeader: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#F4F6FA", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionIcon: { width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#E5EAF6" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  sectionBody: { padding: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  rowLeft: { color: "#374151", fontSize: 14 },
  rowRight: { color: "#111827", fontSize: 14, fontWeight: "700" },
  inputLike: { height: 44, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  muted: { color: "#6B7280", fontSize: 14 },
  needPayBox: { marginTop: 6, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#F9FAFB" },
  needPayLabel: { color: "#6B7280", fontSize: 13, marginBottom: 4, fontWeight: "600" },
  needPayValue: { color: "#111827", fontSize: 20, fontWeight: "800" },
  inline: { marginTop: 8, marginBottom: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: "#374151", fontSize: 14 },
  methodBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  methodText: { color: "#3b82f6", fontSize: 14, fontWeight: "700" },
  amountInputWrap: { width: 140, height: 40, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 10, justifyContent: "center" },
  amountInput: { fontSize: 16, fontWeight: "700", color: "#111827" },
  quickWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  quickBtnDisabled: { opacity: 0.5 },
  quickText: { fontWeight: "700", color: "#111827" },
  
  // Button states
  primaryBtn: { marginTop: 4, backgroundColor: "#1677FF", paddingVertical: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.2 },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
