import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native";



const BASE_DURATION = 220;

const defaultMenuItems = [
  { id: "management", title: "Quản lý quán", icon: "people", route: "Management", disabled: true },
  { id: "bills", title: "Quản lý hóa đơn", icon: "receipt", route: "Bills" },
  { id: "settings", title: "Thiết lập", icon: "settings", route: "Settings", disabled: true },
  { id: "logout", title: "Đăng xuất", icon: "log-out", route: "Logout" },
];

export default function Menu({
  visible,
  onClose,
  navigation,
  items = defaultMenuItems,
  user = null, // { name, email, role }
}) {
  const screenWidth = Dimensions.get("window").width;
  const menuWidth = Math.min(420, screenWidth * 0.82);

  const translateX = useRef(new Animated.Value(-menuWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: BASE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: BASE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (showModal) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -menuWidth,
          duration: BASE_DURATION * 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: BASE_DURATION * 0.9,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -menuWidth,
        duration: BASE_DURATION * 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: BASE_DURATION * 0.9,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose && onClose();
    });
  };

  const onItemPress = (item) => {
    if (item.route === "Logout") {
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
      handleClose();
      return;
    }
// Chức năng đang phát triển
  if (item.disabled || !item.route) {
    Alert.alert(
      "Thông báo",
      "Chức năng đang được phát triển, vui lòng quay lại sau."
    );
    handleClose();
    return;
  }

  // Điều hướng bình thường
    navigation.navigate(item.route);
    handleClose();
  };

  const renderProfile = () => {
    const name = user?.name || "Quản trị viên";
    const email = user?.email || null;
    const initials = name
      .split(" ")
      .map(p => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.profileMeta}>
          <Text style={styles.profileName} numberOfLines={1}>
            {name}
          </Text>
          {email ? (
            <Text style={styles.profileEmail} numberOfLines={1}>
              {email}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => {
  const disabled = item.disabled;

  return (
    <Pressable
      onPress={() => !disabled && onItemPress(item)}
      android_ripple={
        disabled ? null : { color: "rgba(0,0,0,0.06)" }
      }
      style={[
        styles.menuItem,
        disabled && { opacity: 0.45 },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={item.icon}
          size={20}
          color={disabled ? "#9ca3af" : "#2f3b4a"}
        />
      </View>

      <Text style={styles.menuItemText}>{item.title}</Text>

      {!disabled && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#9aa6b2"
        />
      )}
    </Pressable>
  );
};


  return (
    <Modal
      transparent
      visible={showModal}
      onRequestClose={handleClose}
      statusBarTranslucent
      animationType="none"
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.menuContainer,
            { width: menuWidth, transform: [{ translateX }] },
          ]}
        >
          <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallText}>
                    {(user?.name || "QT")
                      .split(" ")
                      .map(p => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.menuTitleText}>Menu</Text>
                  <Text style={styles.roleText}>
  {user?.name || "Quản trị viên"}
</Text>

                </View>
              </View>

              <Pressable onPress={handleClose} style={styles.closeCircle}>
                <Ionicons name="close" size={20} />
              </Pressable>
            </View>

            <View style={styles.headerSeparator} />

            {/* PROFILE – CÓ ONPRESS */}
            <Pressable
              onPress={() => {
                navigation.navigate("Profile");
                handleClose();
              }}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
              style={{ paddingVertical: 8 }}
            >
              {renderProfile()}
            </Pressable>

            <View style={styles.separator} />

            <FlatList
              data={items}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.footerNote}>
              <Text style={styles.footerText}>
                Ứng dụng quản lý - Phiên bản 1.0
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>

        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayRight} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.36)",
  },
  container: { flex: 1, flexDirection: "row" },
  menuContainer: {
    height: "100%",
    backgroundColor: "#fff",
    padding: 14,
    elevation: 8,
  },
  safeArea: { flex: 1 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },

  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarSmallText: { fontWeight: "700", color: "#0f4a78" },

  menuTitleText: { fontSize: 18, fontWeight: "700" },
  roleText: { fontSize: 12, color: "#6b7280" },

  closeCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },

  headerSeparator: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 8,
  },

  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#E6EEF8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#16457A" },
  profileMeta: { marginLeft: 12 },
  profileName: { fontSize: 16, fontWeight: "600" },
  profileEmail: { fontSize: 13, color: "#687684" },

  separator: {
    height: 1,
    backgroundColor: "#eef3f7",
    marginVertical: 12,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuItemPressed: { backgroundColor: "#f8fafc" },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#f5f8fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: { flex: 1, fontSize: 16 },

  overlayRight: { flex: 1 },

  footerNote: { marginTop: "auto", paddingVertical: 12 },
  footerText: { fontSize: 12, color: "#9aa6b2" },
});
