import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMenuCategories, getMenuItems } from '../services/productService';
import { Ionicons } from '@expo/vector-icons';
import { CONFIG } from '../constants/config';

// Hàm lấy URL hình ảnh sản phẩm
const BASE_URL = CONFIG.baseURL.replace(/\/$/, ''); // bỏ dấu / cuối nếu có

function getProductImageUrl(item) {
  const images = item.images || [];
  const imagePath =
    Array.isArray(images) && images.length > 0 ? images[0] : null;

  if (!imagePath) return null;
  // Nếu backend đã trả full URL rồi thì dùng luôn
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Nếu là path kiểu "/uploads/..." thì ghép với BASE_URL
  if (imagePath.startsWith('/')) {
    return `${BASE_URL}${imagePath}`;
  }

  // Nếu là "uploads/..." thì thêm dấu /
  return `${BASE_URL}/${imagePath}`;
}

function getCategoryIcon(category, isActive) {
  const color = isActive ? '#1e293b' : '#1e293b';
  const size = 22;

  // Tùy backend của bạn: dùng code / name / slug...
  const code = (category.code || category.name || '').toLowerCase();

  if (code.includes('ăn') || code.includes('food') || code === 'do_an') {
    // Đồ ăn
    return <Ionicons name="fast-food-outline" size={size} color={color} />;
  }

  if (code.includes('uống') || code.includes('drink') || code === 'do_uong') {
    // Đồ uống
    return <Ionicons name="beer-outline" size={size} color={color} />;
  }

  if (code.includes('chơi') || code.includes('play') || code === 'gio_choi') {
    // Giờ chơi
    return <Ionicons name="game-controller-outline" size={size} color={color} />;
  }

  // Mặc định
  return <Ionicons name="grid-outline" size={size} color={color} />;
}


export default function OrderScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Load danh sách categories khi component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load menu items khi category thay đổi
  useEffect(() => {
    if (selectedCategory) {
      loadMenuItems(selectedCategory);
    }
  }, [selectedCategory]);

// Lấy categories
const loadCategories = useCallback(async () => {
  setLoading(true);
  try {
    const list = await getMenuCategories(); // luôn là mảng

    console.log('[UI] Categories loaded:', list.length);
    setCategories(list);

    // Set category đầu tiên làm mặc định
    if (list.length > 0) {
      setSelectedCategory(list[0]._id || list[0].id);
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  } finally {
    setLoading(false);
  }
}, []);

// Lấy sản phẩm theo category
const loadMenuItems = useCallback(async (categoryId) => {
  setCategoryLoading(true);
  try {
    console.log("[UI] Fetching products for category:", categoryId);

    const items = await getMenuItems(categoryId);   // <-- items là MẢNG

    console.log("[Product] Items for category:", items.length, items);

    // Lưu thẳng mảng vào menuData
    setMenuData(prev => ({
      ...prev,
      [categoryId]: items
    }));

  } catch (error) {
    console.error(`Error loading menu items for ${categoryId}:`, error);
  } finally {
    setCategoryLoading(false);
  }
}, []);





  const renderProductItem = (item) => {
  console.log('ITEM >>>', JSON.stringify(item, null, 2));
  console.log('IMAGES FIELD >>>', item.images);

  const imageUrl = getProductImageUrl(item);

  return (
    <View key={item._id || item.id} style={styles.itemCard}>
      <Image
        source={{
          uri:
            imageUrl ||
            'https://via.placeholder.com/300x200.png?text=No+Image',
        }}
        style={styles.itemImage}
      />

      <View style={styles.priceContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString()}đ</Text>
      </View>

      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => console.log(`Added ${item.name} to cart`)}
      >
        <Text style={styles.buyButtonText}>Thêm vào giỏ</Text>
      </TouchableOpacity>
    </View>
  );
};



  const renderCategoryContent = () => {
    const items = menuData[selectedCategory] ?? [];

    
    if (categoryLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (!items || items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
        </View>
      );
    }

    return (
      <View style={styles.itemsGrid}>
        {items.map(item => renderProductItem(item))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.mainContent}>
        {/* Sidebar bên trái */}
<View style={styles.sidebar}>
  {categories.map((category) => {
    const id = category._id || category.id;
    const isActive = selectedCategory === id;

    return (
      <TouchableOpacity
        key={id}
        style={[
          styles.categoryButton,
          isActive && styles.selectedCategoryButton
        ]}
        onPress={() => setSelectedCategory(id)}
      >
        {/* Icon thực tế */}
        <View style={[
          styles.categoryIcon,
          isActive && styles.selectedCategoryIcon
        ]}>
          {getCategoryIcon(category, isActive)}
        </View>

        {/* Tên category */}
        <Text
          style={[
            styles.categoryText,
            isActive && styles.selectedCategoryText
          ]}
          numberOfLines={2}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>


        {/* Khu vực nội dung chính */}
        <View style={styles.contentArea}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderCategoryContent()}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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

// ✅ Thêm cái này để icon luôn có chỗ đứng riêng
categoryIconWrapper: {
  width: 28,
  height: 28,
  borderRadius: 14,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 4,
},

categoryText: {
  fontSize: 14,
  color: '#666',
  textAlign: 'center',
},

// ✅ Khi selected, chỉ đổi màu chữ
selectedCategoryText: {
  color: '#111827',
  fontWeight: '600',
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
    height: 120,
    resizeMode: 'cover',
    backgroundColor: '#f0f0f0',
  },
  priceContainer: {
    padding: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  buyButton: {
    backgroundColor: '#4a5568',
    paddingVertical: 8,
    alignItems: 'center',
    minHeight: 35,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});