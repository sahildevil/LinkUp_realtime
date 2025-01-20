import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchUserNotifications } from "../../services/notifications";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Avatar from "../../components/Avatar";
import { useRouter } from "expo-router";
import Loading from "../../components/loading";
import { supabase } from "../../lib/supabase";

const NotificationItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.notificationItem}
    onPress={() => onPress(item)}
  >
    <Avatar uri={item.sender?.image} size={hp(5)} />
    <View style={styles.notificationContent}>
      <Text style={styles.userName}>{item.sender?.name}</Text>
      <Text style={styles.notificationText}>{item.title}</Text>
      <Text style={styles.timeStamp}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  </TouchableOpacity>
);

const Notifications = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markNotificationsAsRead();
  }, []);

  const fetchNotifications = async () => {
    const res = await fetchUserNotifications(user.id);
    if (res.success) {
      setNotifications(res.data);
    }
    setLoading(false);
  };

  const markNotificationsAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("receiverId", user.id)
      .eq("read", false);
  };

  const handleNotificationPress = (notification) => {
    try {
      const data = JSON.parse(notification.data);
      if (data.postId) {
        router.push(`/postDetails?postId=${data.postId}`);
      }
    } catch (error) {
      console.log("Error parsing notification data:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={handleNotificationPress} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications yet</Text>
        }
      />
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: hp(2),
  },
  title: {
    fontSize: hp(2.8),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
  },
  list: {
    paddingHorizontal: wp(4),
  },
  notificationItem: {
    flexDirection: "row",
    padding: wp(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: "center",
  },
  notificationContent: {
    marginLeft: wp(3),
    flex: 1,
  },
  userName: {
    fontSize: hp(1.8),
    fontWeight: "600",
    color: theme.colors.text,
  },
  notificationText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  timeStamp: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.textLight,
    marginTop: hp(20),
  },
});
