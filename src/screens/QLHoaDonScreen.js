import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

export default function QLHoaDonScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  // Mock data cho danh sách hóa đơn
  const bills = [
    { id: '#100000008', amount: '0đ', date: '23/10/2025 21:33', status: 'Đã hoàn thành' },
    { id: '#100000007', amount: '45,000đ', date: '23/10/2025 21:30', status: 'Đã hoàn thành' },
    { id: '#100000006', amount: '27,000đ', date: '15/10/2025 12:53', status: 'Đã hoàn thành' },
    { id: '#100000005', amount: '30,000đ', date: '15/10/2025 12:21', status: 'Đã hoàn thành' },
    { id: '#100000004', amount: '45,000đ', date: '15/10/2025 11:59', status: 'Đã hoàn thành' },
    { id: '#100000003', amount: '75,000đ', date: '15/10/2025 11:58', status: 'Đã hoàn thành' },
  ];

  const renderBillItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.billItem}
      onPress={() => navigation.navigate('BillDetail', { billId: item.id })}
    >
      <View style={styles.billHeader}>
        <Text style={styles.billId}>{item.id}</Text>
        <Text style={styles.billAmount}>{item.amount}</Text>
      </View>
      <View style={styles.billFooter}>
        <Text style={styles.billDate}>{item.date}</Text>
        <Text style={styles.billStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý hóa đơn</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo mã tham chiếu/tên đơn"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={bills}
        renderItem={renderBillItem}
        keyExtractor={item => item.id}
        onPress={() => navigation.navigate('BillDetail')}
        contentContainerStyle={styles.billList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  billList: {
    padding: 16,
  },
  billItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billId: {
    fontSize: 16,
    fontWeight: '500',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billDate: {
    fontSize: 14,
    color: '#666',
  },
  billStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
});