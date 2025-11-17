import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listTables } from "../services/tableService";

export default function TableListScreen({ navigation }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState(1);

  // Fetch data từ API
  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listTables({ limit: 100, sort: "-orderIndex" });
      console.log('API Response:', res);
      
      if (res?.success && res?.data) {
        setTables(res.data);
      } else if (Array.isArray(res?.data)) {
        setTables(res.data);
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
      // Fallback data nếu API lỗi
      setTables([
        { _id: '1', name: 'Bàn 1', status: 'occupied', currentSession: { startTime: new Date(Date.now() - 30*60*1000) } },
        { _id: '2', name: 'Bàn 2', status: 'available' },
        { _id: '3', name: 'Bàn 3', status: 'available' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // Tính thời gian đã chơi
  const calculateTimeUsed = (startTime) => {
    if (!startTime) return '';
    const now = new Date();
    const start = new Date(startTime);
    const diffInMinutes = Math.floor((now - start) / (1000 * 60));
    return `${diffInMinutes} phút`;
  };

  // Map data từ API về format cũ
  const mappedTables = tables.map(table => ({
    id: table._id || table.id,
    status: table.status === 'playing' ? 'occupied' : table.status, // Map 'playing' về 'occupied'
    timeUsed: table.status === 'playing' ? calculateTimeUsed(table.currentSession?.startTime) : null,
    name: table.name
  }));

  // Tính toán thống kê
  const totalTables = mappedTables.length;
  const occupiedTables = mappedTables.filter(table => table.status === 'occupied').length;
  const availableTables = totalTables - occupiedTables;
  const totalOrders = occupiedTables;

  const handleTablePress = (table) => {
    if (table.status === 'available') {
      console.log(`Bàn ${table.name || table.id} được chọn để đặt`);
      navigation.navigate('OrderScreen', { 
        tableId: table.id,
        tableName: table.name || `Bàn ${table.id}`
      });
    } else {
      console.log(`Bàn ${table.name || table.id} đang được sử dụng - chuyển đến OrderScreen`);
      navigation.navigate('OrderScreen', { 
        tableId: table.id,
        tableName: table.name || `Bàn ${table.id}`,
        isOccupied: true,
        timeUsed: table.timeUsed
      });
    }
  };

  const renderTableItem = ({ item, index }) => {
    const isOccupied = item.status === 'occupied';
    
    return (
      <TouchableOpacity
        style={[
          styles.tableCard,
          isOccupied ? styles.occupiedCard : styles.availableCard,
        ]}
        onPress={() => handleTablePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.tableContent}>
          <Text style={[
            styles.tableNumber,
            isOccupied ? styles.occupiedText : styles.availableText
          ]}>
            {item.name ? item.name.replace('Bàn ', '') : item.id}
          </Text>
          
          {isOccupied ? (
            <Text style={styles.timeText}>{item.timeUsed || '0 phút'}</Text>
          ) : (
            <Text style={styles.statusText}>Bàn trống</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.loadingContainer}>
          <Text>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Phần thống kê */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tổng số đơn: </Text>
          <Text style={styles.statValue}>{totalOrders}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Bàn trống: </Text>
          <Text style={styles.statValue}>{availableTables}/{totalTables}</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Sidebar bên trái */}
        <View style={styles.sidebar}>
          <TouchableOpacity 
            style={[
              styles.areaButton,
              selectedArea === 1 && styles.selectedAreaButton
            ]}
            onPress={() => setSelectedArea(1)}
          >
            <Text style={[
              styles.areaText,
              selectedArea === 1 && styles.selectedAreaText 
            ]}>
              Khu vực 1
            </Text>
          </TouchableOpacity>
        </View>

        {/* Khu vực hiển thị bàn */}
        <View style={styles.tableArea}>
          <FlatList
            data={mappedTables}
            renderItem={renderTableItem}
            keyExtractor={(item) => item.id?.toString()}
            numColumns={3}
            contentContainerStyle={styles.tableGrid}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
      <TouchableOpacity 
  style={styles.orderButton}
  onPress={() => navigation.navigate("OrderScreen")}
>
  <Text style={styles.orderButtonText}>Đi đến Order</Text>
</TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e6f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 80,
    backgroundColor: '#d8d6e8',
    paddingVertical: 10,
  },
  areaButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  selectedAreaButton: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  areaText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedAreaText: {
    color: '#333',
    fontWeight: 'bold',
  },
  tableArea: {
    flex: 1,
    backgroundColor: '#e8e6f0',
  },
  tableGrid: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  row: {
    justifyContent: 'flex-start', // Thay đổi từ 'space-around' thành 'flex-start'
    marginBottom: 15,
    paddingHorizontal: 10, // Thêm padding để tạo khoảng cách đều
  },
  tableCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 5, // Giữ marginHorizontal để tạo khoảng cách giữa các bàn
  },
  availableCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  occupiedCard: {
    backgroundColor: '#007AFF',
  },
  tableContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  tableNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  availableText: {
    color: '#333',
  },
  occupiedText: {
    color: '#fff',
  },
  timeText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});