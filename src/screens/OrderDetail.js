import React, {useState} from 'react';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	FlatList,
	TextInput,      
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const mockItems = [
	{id: 'i1', name: 'bida', qty: 1, amount: 40000, note: ''},
	{id: 'i2', name: 'Tiền hàng', qty: 1, amount: 40000, note: ''},
];

function formatCurrency(v) {
	if (!v && v !== 0) return '';
	return v === 0 ? '0đ' : v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
}

export default function OrderDetail() {
	const navigation = useNavigation();
	const [items] = useState(mockItems);

	const total = items.reduce((s, it) => s + (it.amount || 0) * (it.qty || 1), 0);
	const totalQty = items.reduce((s, it) => s + (it.qty || 0), 0);

	const renderItem = ({item}) => (
		<View style={styles.itemRow}>
			<View style={styles.itemLeft}>
				<Text style={styles.itemIcon}>🔵</Text>
				<View style={{marginLeft: 8}}>
					<Text style={styles.itemName}>{item.name}</Text>
					{item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
				</View>
			</View>
			<View style={styles.itemRight}>
				<Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
					<Text style={styles.backIcon}>◀</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Tạo hoá đơn</Text>
				<TouchableOpacity style={styles.menuBtn} onPress={() => {}}>
					<Text style={styles.menuIcon}>⋮</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.selectRow}>
				<TouchableOpacity style={styles.selectBox} onPress={() => {}}>
					<Text style={styles.selectText}>Ăn tại bàn</Text>
					<Text style={styles.selectCaret}>▾</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.selectBox, {marginLeft: 8}]} onPress={() => {}}>
					<Text style={styles.selectText}>Khu vực 1 - 4</Text>
					<Text style={styles.selectCaret}>▾</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={items}
				keyExtractor={i => i.id}
				renderItem={renderItem}
				ItemSeparatorComponent={() => <View style={styles.dashedSep} />}
				style={styles.list}
			/>

			<View style={styles.summaryBar}>
				<Text style={styles.summaryLeft}>SL: {totalQty}</Text>
				<Text style={styles.summaryRight}>Tổng : {formatCurrency(total)}</Text>
			</View>

			<View style={styles.tabsRow}>
				<TouchableOpacity style={styles.tab} onPress={() => {}}>
					<Text style={styles.tabText}>Khuyến mại</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => {}}>
					<Text style={styles.tabText}>Chiết khấu</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => {}}>
					<Text style={styles.tabText}>Thuế & Phí</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.actionsRow}>
				<TouchableOpacity style={[styles.actionBtn, styles.addBtn]} onPress={() => {}}>
					<Text style={styles.addText}>+ Thêm</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={() => {}}>
					<Text style={styles.saveText}>Lưu</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.actionBtn, styles.payBtn]} onPress={() => {}}>
					<Text style={styles.payText}>Thanh toán</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {flex: 1, backgroundColor: '#fff'},
	header: {
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#e6e6e6',
		paddingHorizontal: 12,
	},
	backBtn: {padding: 8},
	backIcon: {fontSize: 18},
	title: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600'},
	menuBtn: {padding: 8},
	menuIcon: {fontSize: 20},
	selectRow: {flexDirection: 'row', padding: 12},
	selectBox: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: '#edf0f5',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 6,
		backgroundColor: '#fff',
	},
	selectText: {color: '#245', fontWeight: '600'},
	selectCaret: {color: '#888'},
	list: {flex: 1, paddingHorizontal: 12},
	itemRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12},
	itemLeft: {flexDirection: 'row', alignItems: 'center', flex: 1},
	itemIcon: {fontSize: 18},
	itemName: {fontSize: 14, fontWeight: '600', color: '#2b2b2b'},
	itemNote: {fontSize: 12, color: '#888'},
	itemRight: {alignItems: 'flex-end'},
	itemAmount: {fontWeight: '700', color: '#2b2b2b'},
	dashedSep: {
		borderStyle: 'dashed',
		borderWidth: 0.7,
		borderRadius: 1,
		borderColor: '#d6d6d6',
		marginVertical: 4,
	},
	summaryBar: {
		height: 44,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#e6e6e6',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
	},
	summaryLeft: {color: '#666'},
	summaryRight: {fontWeight: '700', color: '#1a73e8'},
	tabsRow: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f1f1f1'},
	tab: {paddingVertical: 8, paddingHorizontal: 12},
	tabText: {color: '#2b6'},
	actionsRow: {flexDirection: 'row', padding: 12, alignItems: 'center'},
	actionBtn: {flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6},
	addBtn: {backgroundColor: '#13b97f'},
	addText: {color: '#fff', fontWeight: '700'},
	saveBtn: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#13b97f'},
	saveText: {color: '#13b97f', fontWeight: '700'},
	payBtn: {backgroundColor: '#1a73e8'},
	payText: {color: '#fff', fontWeight: '700'},
});

