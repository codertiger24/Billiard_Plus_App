// Full-bleed layout - Nâng cấp giao diện với Animation
// NOTE: area đang bị comment trong route.params - cần fix sau
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, StatusBar, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const currency = (n=0)=> (Number(n)||0).toLocaleString("vi-VN",{style:"currency",currency:"VND",maximumFractionDigits:0});

export default function PaymentSuccessScreen({ route, navigation }) {
  const { 
    //  area = "khu vực 1 - 10",  // ⚠️ TODO: Đang bị comment - cần uncomment khi có data
    need = 0, 
    paid = 0, 
    change = 0,
    shouldRefreshTables = false 
  } = route.params || {};
  const [eInvoice, setEInvoice] = useState(false);

  // Animation values - CHỈ cho phần thông báo
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Scale icon circle
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }),
      // 2. Draw checkmark
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();

    // Animation cho badge và title
    Animated.parallel([
      Animated.spring(badgeAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        delay: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleComplete = () => {
    if (shouldRefreshTables) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: {
              screen: 'Table',
              params: { refreshData: true }
            }
          }
        ]
      });
    } else {
      navigation.popToTop();
    }
  };

  // Animated rotation for checkmark
  const checkmarkRotate = checkmarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg']
  });

  // Transaction ID
  const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
  const currentTime = new Date().toLocaleString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      {/* Banner với gradient */}
      <LinearGradient
        colors={['#16a34a', '#22c55e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.iconWrapper}>
          <Animated.View 
            style={[
              styles.iconCircle,
              {
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Animated checkmark */}
            <Animated.View
              style={{
                opacity: checkmarkAnim,
                transform: [
                  { rotate: checkmarkRotate },
                  { scale: checkmarkAnim }
                ]
              }}
            >
              <Ionicons name="checkmark" size={60} color="#16a34a" />
            </Animated.View>
            
            {/* Ripple effect */}
            <Animated.View 
              style={[
                styles.ripple,
                {
                  opacity: scaleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.3, 0]
                  }),
                  transform: [
                    { 
                      scale: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.5]
                      })
                    }
                  ]
                }
              ]} 
            />
          </Animated.View>
        </View>
      </LinearGradient>

      {/* Nội dung */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Animated Success Badge */}
        <Animated.View 
          style={{
            opacity: badgeAnim,
            transform: [
              { 
                scale: badgeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              },
              {
                translateY: badgeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }
            ]
          }}
        >
          <View style={styles.successBadge}>
            <View style={styles.badgeGlow} />
            <LinearGradient
              colors={['#16a34a', '#22c55e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeGradient}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.badgeText}>Thành công</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        <Text style={styles.title}>Thanh toán hoàn tất!</Text>
        
        {/* TODO: Uncomment khi area có data */}
        {/* <Text style={styles.area}>{area}</Text> */}
        
        {/* Timestamp và Transaction ID */}
        <View style={styles.metaInfo}>
          <View style={styles.subtitleWrapper}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.subtitle}>{currentTime}</Text>
          </View>
          <Text style={styles.transactionId}>Mã GD: #{transactionId}</Text>
        </View>

        {/* Thông tin thanh toán - KHÔNG có animation */}
        <View style={styles.infoCard}>
          <Row left="Cần thanh toán" right={currency(need)} bold />
          <View style={styles.divider} />
          <Row left="Tiền khách trả" right={currency(paid)} />
          <View style={styles.divider} />
          <Row left="Tiền thừa trả khách" right={currency(change)} highlight />
        </View>

        {/* Checkbox hóa đơn điện tử - KHÔNG có animation */}
        <TouchableOpacity 
          onPress={() => setEInvoice(!eInvoice)} 
          style={styles.checkboxCard}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxWrapper}>
            <View 
              style={[
                styles.checkbox, 
                eInvoice && styles.checkboxActive,
              ]}
            >
              {eInvoice && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkboxText}>Xuất hóa đơn điện tử</Text>
              <Text style={styles.checkboxSubtext}>Hóa đơn sẽ được gửi qua email</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Note về máy in - KHÔNG có animation */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.noteText}>
              Thiết bị chưa kết nối máy in.{" "}
              <Text style={styles.link} onPress={() => Linking.openURL("https://example.com")}>
                Kết nối ngay
              </Text>
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Button hoàn tất - KHÔNG có animation */}
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#1677FF', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.primaryText}>Hoàn tất thanh toán</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const Row = ({ left, right, bold, highlight }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLeft, bold && styles.rowBold]}>{left}</Text>
    <Text style={[styles.rowRight, bold && styles.rowBold, highlight && styles.rowHighlight]}>
      {right}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  banner: {
    height: 180,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20
  },
  iconWrapper: {
    marginBottom: -40,
    position: "relative"
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  ripple: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#16a34a",
    zIndex: -1
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 50
  },
  successBadge: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 16
  },
  badgeGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: "#22c55e",
    opacity: 0.2,
    borderRadius: 20,
    zIndex: -1
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  badgeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.5
  },
  metaInfo: {
    alignItems: "center",
    marginBottom: 28
  },
  subtitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500"
  },
  transactionId: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "600",
    fontFamily: "monospace",
    letterSpacing: 0.5
  },
  area: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 4,
    marginBottom: 8
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  rowLeft: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500"
  },
  rowRight: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  rowBold: {
    fontSize: 18,
    fontWeight: "800"
  },
  rowHighlight: {
    color: "#16a34a"
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4
  },
  checkboxCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  checkboxActive: {
    backgroundColor: "#1677FF",
    borderColor: "#1677FF"
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827"
  },
  checkboxSubtext: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2
  },
  noteCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b"
  },
  noteText: {
    fontSize: 14,
    color: "#78716c",
    lineHeight: 20
  },
  link: {
    color: "#0ea5e9",
    fontWeight: "700",
    textDecorationLine: "underline"
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#1677FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 16
  },
  btnGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5
  }
});