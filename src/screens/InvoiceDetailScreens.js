import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InvoiceDetailScreen() {
  const [showItems, setShowItems] = useState(true);
  const [showFee, setShowFee] = useState(false);
  const [showTax, setShowTax] = useState(false);

  const [invoice, setInvoice] = useState({
    // TODO: Replace static data with API response
    revenue: "35,000đ",
    reference: "100000000",
    serviceType: "Ăn tại bàn",
    area: "(Bàn) Khu vực 1 - 1",
    staff: "Phạm Văn Tứ",
    cashier: "Phạm Văn Tứ",
    orderTime: "21:40 09-11-2025",
    payTime: "21:41 09-11-2025",
    customerCount: 1,
    status: "Đã hoàn thành",
    items: [
      {
        name: "Bạc xỉu nóng (Giá thường)",
        quantity: 1,
        unit: "Cốc",
        price: "35,000đ",
      },
    ],
    feePercent: 1, // phí 1%
    tax: "0đ",
    total: "35,000đ",
  });

  /*
  useEffect(() => {
  // TODO: Gọi API thật khi backend có sẵn
  fetch("http://10.0.2.2:3000/invoices/100000000") // ← thay bằng endpoint thật
    .then(res => res.json())
    .then(data => {
      setInvoice({
        revenue: data.revenue,
        reference: data.reference,
        serviceType: data.serviceType,
        area: data.area,
        staff: data.staff,
        cashier: data.cashier,
        orderTime: data.orderTime,
        payTime: data.payTime,
        customerCount: data.customerCount,
        status: data.status,
        items: data.items,
        feePercent: data.feePercent,
        tax: data.tax,
        total: data.total,
      });
    })
    .catch(err => console.log("Lỗi tải hóa đơn:", err));
}, []);
*/

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Chi tiết hóa đơn</Text>

      {/* Doanh thu */}
      <View style={styles.section}>
        <Text style={styles.revenue}>
          Doanh thu: <Text style={styles.bold}>{invoice.revenue}</Text>
        </Text>
        <Text style={styles.reference}>
          Mã tham chiếu: <Text style={styles.bold}>{invoice.reference}</Text>
        </Text>
      </View>

      {/* Thông tin giao dịch */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Thông tin giao dịch</Text>
        <Row label="Hình thức phục vụ" value={invoice.serviceType} />
        <Row label="Bán tại nhà hàng" value={invoice.area} />
        <Row label="Phục vụ / Tạo đơn" value={invoice.staff} />
        <Row label="Thu ngân" value={invoice.cashier} />
        <Row label="Thời gian gọi món" value={invoice.orderTime} />
        <Row label="Thời gian thanh toán" value={invoice.payTime} />
      </View>

      {/* Thông tin khách hàng */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Thông tin khách hàng</Text>
        <Row label="Số lượng khách hàng" value={invoice.customerCount} />
        <Row
          label="Trạng thái"
          value={invoice.status}
          valueStyle={{ color: "#007AFF" }}
        />
      </View>

      {/* Thông tin thanh toán */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Thông tin thanh toán</Text>

        {/* Mặt hàng, combo */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowItems(!showItems)}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>Mặt hàng, combo</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.value}>{invoice.total}</Text>
            <Ionicons
              name={showItems ? "chevron-up" : "chevron-down"}
              size={18}
              color="#555"
              style={{ marginLeft: 4 }}
            />
          </View>
        </TouchableOpacity>

        {/* Danh sách món */}
        {showItems && (
          <View style={styles.itemContainer}>
            {invoice.items.map((item, index) => (
              <View key={index} style={styles.itemBox}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.itemName}>
                    {item.name} - (x{item.quantity} {item.unit})
                  </Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
                <Text style={styles.itemSub}>Giá thường: {item.price}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Phí */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowFee(!showFee)}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>Phí</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.value}>{invoice.feePercent}%</Text>
            <Ionicons
              name={showFee ? "chevron-up" : "chevron-down"}
              size={18}
              color="#555"
              style={{ marginLeft: 4 }}
            />
          </View>
        </TouchableOpacity>

        {showFee && (
          <View style={styles.itemContainer}>
            <Text style={styles.itemSub}>
              Phí dịch vụ được tính {invoice.feePercent}% trên tổng doanh thu
            </Text>
          </View>
        )}

        {/* Thuế */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowTax(!showTax)}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>Thuế</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.value}>{invoice.tax}</Text>
            <Ionicons
              name={showTax ? "chevron-up" : "chevron-down"}
              size={18}
              color="#555"
              style={{ marginLeft: 4 }}
            />
          </View>
        </TouchableOpacity>

        {showTax && (
          <View style={styles.itemContainer}>
            <Text style={styles.itemSub}>Hiện chưa áp dụng thuế VAT</Text>
          </View>
        )}

        <Row label="Thanh toán" value={invoice.total} />
      </View>
    </ScrollView>
  );
}

// Component dòng thông tin
const Row = ({ label, value, valueStyle }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueStyle]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 8,
  },
  section: {
    alignItems: "center",
    marginBottom: 12,
  },
  revenue: {
    fontSize: 16,
    color: "#000",
  },
  reference: {
    fontSize: 14,
    color: "#555",
  },
  bold: {
    fontWeight: "bold",
  },
  block: {
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
  },
  blockTitle: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 6,
    color: "#1A1A1A",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#444",
  },
  value: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  itemContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  itemBox: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 14,
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
  itemSub: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
});
