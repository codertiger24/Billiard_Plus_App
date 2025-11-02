import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [cart, setCart] = useState([]);
  
  // Nhận thông tin bàn từ TableListScreen
  const { tableId, tableName, isOccupied = false, timeUsed = '' } = route?.params || {};

  // Dữ liệu mẫu
  const menuData = {
    food: [
      {
        id: 1,
        name: 'Cơm rang dưa bò',
        price: 35000,
        image: 'https://giadinh.mediacdn.vn/296230595582509056/2025/6/26/com-rang-ava-17509126036582007364796.jpg',
      },
    ],
    drinks: [
      {
        id: 1,
        name: 'Coca Cola',
        price: 45000,
        image: 'https://media.istockphoto.com/id/487787108/vi/anh/lon-coca-cola-tr%C3%AAn-b%C4%83ng.jpg?s=612x612&w=0&k=20&c=P8s3xUn9gHMzS3Kllt8ETiRSIwO9W82rN-4UytO0y4I=',
      },
      {
        id: 2,
        name: 'Trà đá',
        price: 0,
        image: 'https://cloudcdnvod.tek4tv.vn/Mam/attach/upload/04102022104733/image_1730303171.webp',
      },
    ],
    entertainment: [
      {
        id: 1,
        name: 'bida',
        price: 40000,
        unit: '/1 giờ',
        type: 'BI',
      },
      {
        id: 2,
        name: 'Giờ chơi thường',
        price: 0,
        unit: '/1 phút',
        type: 'GI',
      },
    ],
  };

  const categories = [
    { id: 'food', name: 'Đồ ăn', icon: '🍽️' },
    { id: 'drinks', name: 'Đồ uống', icon: '🥤' },
    { id: 'entertainment', name: 'Giờ chơi', icon: '🎱' },
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const getTotalItems = () => {
    return cart.length;
  };

  const handleContinue = () => {
    navigation.navigate('OrderDetail', {
      cart: cart,
      tableInfo: {
        tableId,
        tableName,
        isOccupied,
        timeUsed
      }
    });
  };

  const renderFoodItem = (item) => (
    <View key={item.id} style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.priceContainer}>
        <Text style={styles.itemPrice}>{item.price.toLocaleString()}đ</Text>
      </View>
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.buyButtonText}>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDrinkItem = (item) => (
    <View key={item.id} style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.priceContainer}>
        <Text style={styles.itemPrice}>
          {item.price > 0 ? `${item.price.toLocaleString()}đ` : '0đ'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.buyButtonText}>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEntertainmentItem = (item) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.entertainmentImageContainer}>
        <Text style={styles.entertainmentType}>{item.type}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString()}đ{item.unit}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.buyButtonText}>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'food':
        return (
          <View style={styles.itemsGrid}>
            {menuData.food.map(item => renderFoodItem(item))}
          </View>
        );
      case 'drinks':
        return (
          <View style={styles.itemsGrid}>
            {menuData.drinks.map(item => renderDrinkItem(item))}
          </View>
        );
      case 'entertainment':
        return (
          <View style={styles.itemsGrid}>
            {menuData.entertainment.map(item => renderEntertainmentItem(item))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.mainContent}>
        {/* Sidebar bên trái */}
        <View style={styles.sidebar}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Khu vực nội dung chính */}
        <View style={styles.contentArea}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderCategoryContent()}
          </ScrollView>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalText}>Thành tiền: {getTotalPrice().toLocaleString()}đ</Text>
          <Text style={styles.itemCount}>Mặt hàng: {getTotalItems()}</Text>
        </View>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Tiếp theo ›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 100,
    backgroundColor: '#e8e6f0',
    paddingVertical: 10,
  },
  categoryButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  selectedCategoryButton: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#333',
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  itemCard: {
    width: '48%',
    aspectRatio: 1, // Tạo hình vuông
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    flex: 1, // Chiếm phần lớn không gian
    resizeMode: 'cover',
  },
  entertainmentImageContainer: {
    width: '100%',
    flex: 1, // Chiếm phần lớn không gian
    backgroundColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entertainmentType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  priceContainer: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 30, // Đảm bảo chiều cao tối thiểu
  },
  itemPrice: {
    fontSize: 12, // Giảm kích thước font
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    numberOfLines: 1, // Giới hạn 1 dòng
  },
  buyButton: {
    backgroundColor: '#4a5568',
    paddingVertical: 8,
    alignItems: 'center',
    minHeight: 35, // Đảm bảo chiều cao tối thiểu
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 11, // Giảm kích thước font
    fontWeight: '500',
    textAlign: 'center',
    numberOfLines: 1, // Giới hạn 1 dòng
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalInfo: {
    flex: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});