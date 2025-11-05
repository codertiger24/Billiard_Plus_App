import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import BottomTabNavigator from "./BottomTabNavigator";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import BillManagement from "../screens/BillManagement";
import OrderDetail from "../screens/OrderDetail";
const Drawer = createDrawerNavigator();

// ---- Tạo vài màn hình mẫu ----


function RevenueScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>💰 Quản lý thu chi</Text>
    </View>
  );
}

function LanguageScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>🌐 Cài đặt ngôn ngữ</Text>
    </View>
  );
}
function Logout(){
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>🚪 Đăng xuất</Text>
    </View>
  );
}

// ---- Điều hướng Drawer ----
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0099ff" },
          headerTintColor: "#fff",
          drawerActiveTintColor: "#0099ff",
          drawerLabelStyle: { fontSize: 15 },
        }}
      >
        <Drawer.Screen
          name="Trang chủ"
          component={BottomTabNavigator}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="Quản lý hóa đơn"
          component={BillManagement}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="document-text" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="Quản lý thu chi"
          component={RevenueScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="cash" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="Ngôn ngữ"
          component={LanguageScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="globe" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="Đăng xuất"
          component={Logout}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="log-out" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
  name="Tạo hoá đơn"
  component={OrderDetail}
  options={{
    drawerIcon: ({ color, size }) => (
      <Ionicons name="receipt" color={color} size={size} />
    ),
  }}
/>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
