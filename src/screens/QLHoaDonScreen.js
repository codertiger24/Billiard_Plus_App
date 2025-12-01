import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { getBills } from "../services/billService";
import { Ionicons } from "@expo/vector-icons";

const QLHoaDonScreen = ({ navigation }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 🔥 TAB FILTER

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await getBills();
      console.log("📌 API trả về:", data);

      if (Array.isArray(data)) {
        setBills(data);
      } else {
        console.log("⚠ API không trả về mảng bills");
        setBills([]);
      }
    } catch (error) {
      console.log("❌ Lỗi tải hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentStatus = (paid, paidAt) => {
    if (paid) {
      const label = "Đã thanh toán";
      const date = paidAt ? ` • ${new Date(paidAt).toLocaleString()}` : "";
      return <Text style={styles.paid}>{label + date}</Text>;
    }
    return <Text style={styles.unpaid}>Chưa thanh toán</Text>;
  };

  const renderItem = ({ item }) => {
    const id = item.id || item._id;
    const paymentMethod = item.paymentMethod || "Không rõ";

    const tableName =
      item.table?.name ||
      item.tableName ||
      "Không rõ";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("InvoiceDetail", { billId: id })}
      >
        <Text style={styles.title}>Mã HD: {item.code || id}</Text>

        <Text>Bàn: {tableName}</Text>

        <Text>
          Ngày:{" "}
          {item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "Không rõ"}
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Phương thức: </Text>
          <Text style={styles.paymentMethod}>
            {String(paymentMethod).toUpperCase()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái: </Text>
          {renderPaymentStatus(item.paid, item.paidAt)}
        </View>

        <Text style={styles.total}>
          Tổng tiền: {item.total ? item.total.toLocaleString() : 0} đ
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  /* 🔥 FILTER BILL THEO SEARCH + THEO TAB */
  const filteredBills = bills.filter((bill) => {
    const text = searchText.trim().toLowerCase();
    const tableName = (bill.table?.name || bill.tableName || "").toLowerCase();

    const matchSearch = tableName.includes(text);

    let matchTab = true;
    if (activeTab === "paid") matchTab = bill.paid === true;
    if (activeTab === "unpaid") matchTab = bill.paid === false;

    return matchSearch && matchTab;
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Quản lý hóa đơn</Text>

        <TouchableOpacity>
          <Ionicons name="filter-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* SEARCH BOX */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên bàn"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </View>

      {/* 🔥 TAB FILTER */}
      <View style={styles.tabContainer}>
        {[
          { label: "Tất cả", value: "all" },
          { label: "Đã thanh toán", value: "paid" },
          { label: "Chưa thanh toán", value: "unpaid" },
        ].map((t) => (
          <TouchableOpacity
            key={t.value}
            onPress={() => setActiveTab(t.value)}
            style={[
              styles.tab,
              activeTab === t.value && styles.activeTab
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t.value && styles.activeTabText
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      {filteredBills.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text>Không có hóa đơn nào.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => String(item.id || item._id)}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingHorizontal: 12,
            paddingBottom: 80,
          }}
        />
      )}
    </View>
  );
};

export default QLHoaDonScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    height: 42,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  /* TABS */
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },

  tab: {
    backgroundColor: "#e5e5e5",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },

  activeTab: {
    backgroundColor: "#007AFF",
  },

  tabText: {
    color: "#333",
    fontSize: 14,
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* LIST CARD */
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  label: {
    fontWeight: "600",
  },

  paymentMethod: {
    marginLeft: 4,
    color: "#333",
  },

  paid: {
    color: "#28a745",
    fontWeight: "600",
    marginLeft: 4,
  },

  unpaid: {
    color: "#d9534f",
    fontWeight: "600",
    marginLeft: 4,
  },

  total: {
    color: "#d9534f",
    fontWeight: "bold",
    marginTop: 8,
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
