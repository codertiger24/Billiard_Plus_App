import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TableListScreen({ navigation }) {
  // Dữ liệu mẫu cho các bàn bi-a (9 bàn)
  const [tables, setTables] = useState([
    { id: 1, status: 'occupied', timeUsed: '3 phút' },
    { id: 2, status: 'available' },
    { id: 3, status: 'available' },
    { id: 4, status: 'occupied', timeUsed: '3 phút' },
    { id: 5, status: 'available' },
    { id: 6, status: 'available' },
    { id: 7, status: 'available' },
    { id: 8, status: 'available' },
    { id: 9, status: 'available' },
  ]);

  const [selectedArea, setSelectedArea] = useState(1);

  // Tính toán thống kê
  const totalTables = tables.length;
  const occupiedTables = tables.filter(table => table.status === 'occupied').length;
  const availableTables = totalTables - occupiedTables;
  const totalOrders = occupiedTables; // Giả sử mỗi bàn đang sử dụng = 1 đơn

  const handleTablePress = (table) => {
    if (table.status === 'available') {
      // Điều hướng đến màn hình đặt món
      console.log(`Bàn ${table.id} được chọn để đặt`);
      navigation.navigate('OrderScreen', { 
        tableId: table.id,
        tableName: `Bàn ${table.id}` 
      });
    } else {
      // Hiển thị thông tin bàn đang sử dụng hoặc chuyển đến OrderScreen để xem/thêm món
      console.log(`Bàn ${table.id} đang được sử dụng - chuyển đến OrderScreen`);
      navigation.navigate('OrderScreen', { 
        tableId: table.id,
        tableName: `Bàn ${table.id}`,
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
            {item.id}
          </Text>
          
          {isOccupied ? (
            <Text style={styles.timeText}>{item.timeUsed}</Text>
          ) : (
            <Text style={styles.statusText}>Bàn trống</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
            data={tables}
            renderItem={renderTableItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.tableGrid}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e6f0',
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
    justifyContent: 'space-around',
    marginBottom: 15,
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
    marginHorizontal: 5,
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