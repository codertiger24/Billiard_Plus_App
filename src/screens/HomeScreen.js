// HomeScreen.js - Fixed version with proper ID handling

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../components/Header";
import Menu from "../components/Menu";

import { sessionService } from "../services/sessionService";
import { tableService } from "../services/tableService";
import { listAreas } from "../services/areaService";

// Improved ID extraction with better error handling
const getId = (val) => {
  // Null/undefined check
  if (val === null || val === undefined) return undefined;
  
  // Already a string
  if (typeof val === "string" && val.trim() !== "") return val.trim();
  
  // Number (rare but possible)
  if (typeof val === "number") return String(val);
  
  // Object with MongoDB $oid format
  if (typeof val === "object") {
    // Direct $oid property
    if (val.$oid && typeof val.$oid === "string") return val.$oid;
    
    // Nested _id.$oid
    if (val._id && typeof val._id === "object" && val._id.$oid) {
      return val._id.$oid;
    }
    
    // _id as string
    if (val._id && typeof val._id === "string") return val._id;
  }
  
  // Last resort: convert to string if not empty
  const str = String(val);
  return str !== "undefined" && str !== "null" && str !== "" ? str : undefined;
};

export default function HomeScreen({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [areas, setAreas] = useState([]);
  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // ==================== LOAD AREAS ====================
      const areaRes = await listAreas();
      const rawAreas = areaRes.data?.data || areaRes.data || areaRes;

      console.log("📊 Raw areas sample:", rawAreas?.[0]);

      const normAreas = (Array.isArray(rawAreas) ? rawAreas : [])
        .map((a, index) => {
          const id = getId(a._id) || getId(a.id) || `area-fallback-${index}`;
          return {
            ...a,
            _id: id,
            originalId: a._id, // Keep original for debugging
          };
        })
        .filter(a => a._id && !a._id.startsWith('area-fallback')); // Remove items with fallback IDs

      console.log(`✅ Normalized ${normAreas.length} areas`);
      setAreas(normAreas);

      // ==================== LOAD TABLES ====================
      const tableRes = await tableService.list();
      const rawTables = tableRes.data?.items || tableRes.data?.data || tableRes.data || tableRes;

      console.log("📊 Raw tables sample:", rawTables?.[0]);

      const normTables = (Array.isArray(rawTables) ? rawTables : [])
        .map((t, index) => {
          const id = getId(t._id) || getId(t.id) || `table-fallback-${index}`;
          const areaId = getId(t.areaId) || getId(t.area) || getId(t.area_id);
          
          return {
            ...t,
            _id: id,
            areaId: areaId,
            originalId: t._id,
            originalAreaId: t.areaId,
          };
        })
        .filter(t => t._id && !t._id.startsWith('table-fallback')); // Remove items with fallback IDs

      console.log(`✅ Normalized ${normTables.length} tables`);
      setTables(normTables);

      // ==================== LOAD SESSIONS ====================
      const sessionRes = await sessionService.list();
      const rawSessions = sessionRes.data?.items || sessionRes.data?.data || sessionRes.data || sessionRes;

      console.log("📊 Raw sessions sample:", rawSessions?.[0]);

      const normSessions = (Array.isArray(rawSessions) ? rawSessions : [])
        .map((s, index) => {
          const id = getId(s._id) || getId(s.id) || `session-${Date.now()}-${index}`;
          const tableId = getId(s.tableId) || getId(s.table_id) || getId(s.table);
          
          return {
            ...s,
            _id: id,
            tableId: tableId,
            originalId: s._id,
            originalTableId: s.tableId,
          };
        });

      // Filter only active sessions
      const playingOnly = normSessions.filter(s => {
        const isActive = !s.endTime || s.status === "playing";
        const hasValidTableId = !!s.tableId;
        return isActive && hasValidTableId;
      });

      console.log(`✅ Normalized ${playingOnly.length} active sessions`);
      setSessions(playingOnly);

    } catch (err) {
      console.error("❌ Load error:", err);
      console.error("Error details:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const tablesByArea = (areaId) => {
    if (!areaId) return [];
    return tables.filter((t) => t.areaId === areaId);
  };

  const calculateSessionInfo = (tableId) => {
    if (!tableId) return null;
    
    const session = sessions.find((s) => s.tableId === tableId);
    if (!session || !session.startTime) return null;

    const start = new Date(session.startTime);
    const now = new Date();
    const diffMs = now - start;
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    const table = tables.find((t) => t._id === tableId) || {};
    const rate = table.ratePerHour || 0;
    const money = Math.ceil((totalMinutes / 60) * rate);

    return { formatted, money };
  };

  const formatMoney = (v) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  const renderTable = (table, index) => {
    if (!table || !table._id) return null;
    
    const isPlaying = table.status === "playing";
    const info = isPlaying ? calculateSessionInfo(table._id) : null;

    // Generate safe key
    const key = table._id || `table-${table.name}-${index}`;

    return (
      <TouchableOpacity
        key={key}
        style={[styles.tableCard, isPlaying && { borderLeftColor: "#00d68f" }]}
        onPress={() => {
          if (isPlaying) {
            const s = sessions.find((x) => x.tableId === table._id);
            if (s) {
              navigation.navigate("OrderDetail", { session: s, table });
            }
          } else {
            navigation.navigate("OrderScreen", { table });
          }
        }}
      >
        <View style={styles.tableHeader}>
          <Text style={styles.tableName}>{table.name || "Bàn"}</Text>

          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { 
                  backgroundColor: 
                    table.status === "available" ? "#999" : 
                    table.status === "playing" ? "#00d68f" : 
                    table.status === "reserved" ? "#ff9800" : 
                    "#e53935" 
                },
              ]}
            />
            <Text style={styles.statusText}>
              {table.status === "available" ? "Trống" : 
               table.status === "playing" ? "Đang chơi" : 
               table.status === "reserved" ? "Đặt trước" : 
               "Bảo trì"}
            </Text>
          </View>
        </View>

        {isPlaying && info && (
          <View style={{ marginTop: 6 }}>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.playingText}>{info.formatted}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="cash-outline" size={16} color="#666" />
              <Text style={styles.playingText}>{formatMoney(info.money)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00d68f" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setMenuVisible(true)} />
      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} navigation={navigation} />

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {areas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có khu vực nào</Text>
          </View>
        ) : (
          areas.map((area, areaIndex) => {
            const areaTables = tablesByArea(area._id);
            const key = area._id || `area-${area.name}-${areaIndex}`;
            
            if (areaTables.length === 0) return null;
            
            return (
              <View key={key} style={styles.areaSection}>
                <Text style={[styles.areaTitle, { color: area.color || "#000" }]}>
                  {area.name || "Khu vực"}
                </Text>

                {areaTables.map((table, tableIndex) => renderTable(table, tableIndex))}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate("OrderScreen")}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <Text style={styles.addButtonText}>Tạo đơn</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 40 
  },
  emptyText: { 
    fontSize: 16, 
    color: "#999" 
  },

  areaSection: { marginBottom: 20, paddingHorizontal: 12 },
  areaTitle: { fontSize: 22, fontWeight: "700", marginBottom: 10 },

  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#999",
  },

  tableHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tableName: { fontSize: 18, fontWeight: "700", color: "#333" },

  statusBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#eee", 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 13, color: "#444" },

  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  playingText: { marginLeft: 6, color: "#333", fontSize: 14 },

  addButton: { 
    position: "absolute", 
    bottom: 30, 
    right: 20, 
    backgroundColor: "#00d68f", 
    borderRadius: 30, 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 18, 
    paddingVertical: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 4 },
});