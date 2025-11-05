import React, {useMemo, useState} from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TextInput,
	TouchableOpacity,
	SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const mockBills = [
	{
		id: '1',
		billNo: '#100000008',
		ref: 'E29742',
		amount: 0,
		date: '23/10/2025',
		time: '21:33',
		payment: 'Tiền mặt',
		status: 'Đã hoàn thành',
	},
	{
		id: '2',
		billNo: '#100000007',
		ref: 'E20902',
		amount: 45000,
		date: '23/10/2025',
		time: '21:30',
		payment: 'Tiền mặt',
		status: 'Đã hoàn thành',
	},
	{
		id: '3',
		billNo: '#100000006',
		ref: 'E04879',
		amount: 27000,
		date: '15/10/2025',
		time: '12:53',
		payment: 'Tiền mặt',
		status: 'Đã hoàn thành',
	},
	{
		id: '4',
		billNo: '#100000005',
		ref: 'E05072',
		amount: 30000,
		date: '15/10/2025',
		time: '12:21',
		payment: 'Tiền mặt',
		status: 'Đã hoàn thành',
	},
	{
		id: '5',
		billNo: '#100000004',
		ref: 'T99153',
		amount: 45000,
		date: '15/10/2025',
		time: '11:59',
		payment: 'Tiền mặt',
		status: 'Đã hoàn thành',
	},
];

function formatCurrency(v) {
	if (!v && v !== 0) return '';
	return v === 0 ? '0đ' : v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
}

export default function BillManagement() {
	const navigation = useNavigation();
	const [query, setQuery] = useState('');

	const data = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return mockBills;
		return mockBills.filter(
			item =>
				item.billNo.toLowerCase().includes(q) ||
				item.ref.toLowerCase().includes(q),
		);
	}, [query]);

	const renderItem = ({item}) => (
		<TouchableOpacity
			style={styles.card}
			activeOpacity={0.8}
			onPress={() => navigation.navigate('OrderDetail', {billId: item.id})}>
			<View style={styles.row}>
				<View style={styles.left}>
					<Text style={styles.billNo}>{item.billNo}</Text>
					<Text style={styles.ref}>{item.ref}</Text>
				</View>

				<View style={styles.center}>
					<Text style={styles.date}>{item.date}</Text>
					<Text style={styles.time}>{item.time}</Text>
				</View>

				<View style={styles.right}>
					<Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
					<Text style={styles.payment}>{item.payment}</Text>
					<View style={styles.statusPill}>
						<Text style={styles.statusText}>{item.status}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.container}>


			<View style={styles.searchWrap}>
				<TextInput
					placeholder="Tìm kiếm theo mã tham chiếu/tên đơn"
					placeholderTextColor="#999"
					style={styles.searchInput}
					value={query}
					onChangeText={setQuery}
				/>
			</View>

			<FlatList
				data={data}
				keyExtractor={i => i.id}
				renderItem={renderItem}
				contentContainerStyle={{paddingBottom: 24}}
				ItemSeparatorComponent={() => <View style={styles.sep} />}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {flex: 1, backgroundColor: '#fff'},

	headerTitle: {fontSize: 18, fontWeight: '600', color: '#2b2b2b'},
	filterBtn: {position: 'absolute', right: 16, top: 12},
	filterIcon: {fontSize: 18},
	searchWrap: {padding: 12, paddingHorizontal: 16},
	searchInput: {
		backgroundColor: '#f5f7fb',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		fontSize: 14,
		color: '#222',
	},
	card: {paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff'},
	row: {flexDirection: 'row', alignItems: 'center'},
	left: {flex: 1},
	center: {width: 110, alignItems: 'flex-start'},
	right: {alignItems: 'flex-end'},
	billNo: {fontWeight: '700', color: '#2b2b2b', marginBottom: 4},
	ref: {color: '#999', fontSize: 12},
	date: {color: '#666', fontSize: 13},
	time: {color: '#999', fontSize: 12},
	amount: {fontWeight: '700', color: '#2b2b2b'},
	payment: {color: '#666', fontSize: 12, marginTop: 4},
	statusPill: {
		marginTop: 8,
		backgroundColor: '#e9f5ff',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 16,
	},
	statusText: {color: '#2a86ff', fontSize: 12, fontWeight: '600'},
	sep: {height: 1, backgroundColor: '#f0f0f0'},
});

