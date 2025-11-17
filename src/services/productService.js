import api from './api';

// Lấy danh sách categories
export async function getMenuCategories() {
  try {
    const res = await api.get('/categories');
    console.log('📌 [Product] Categories raw response:', res.data);

    // Backend trả dạng:
    // { data: { items: [...], limit, page, total }, message, status }
    const list = res?.data?.data?.items ?? [];

    console.log('📌 [Product] Categories parsed:', list.length);
    return list; // luôn là mảng
  } catch (err) {
    console.error('❌ [Product] getMenuCategories error:', err);
    throw err;
  }
}

// Lấy danh sách sản phẩm theo category
export async function getMenuItems(categoryId) {
  try {
    console.log('👉 [Product] Fetching items for category:', categoryId);

    const res = await api.get('/products', {
      params: { category: categoryId },
    });

    console.log('📌 [Product] Products raw response:', res.data);

    // Backend cũng trả dạng:
    // { data: { items: [...], limit, page, total }, message, status }
    const list = res?.data?.data?.items ?? [];

    console.log('📌 [Product] Products parsed:', list.length);
    return list; // luôn là mảng
  } catch (err) {
    console.error('❌ [Product] getMenuItems error:', err);
    throw err;
  }
}
