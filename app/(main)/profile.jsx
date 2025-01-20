import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { supabase } from "../../lib/supabase";
import { Alert } from "react-native";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/PostService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/loading";

const profile = () => {
  const { user, setAuth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [hasmore, sethasmore] = useState(true);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  // const onLogout = async () => {
  //   const { error } = await supabase.auth.signOut();
  //   if (error) {
  //     Alert.alert("Sign oUT", "eRROR IN SIGN OUIT");
  //   }
  // };
  const onLogout = async () => {
    // console.log("Attempting to log out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign Out", "Error in Sign Out. Please try again.");
    } else {
      // console.log("Logged out successfully");
    }
  };

  const getPosts = async () => {
    if (!hasmore || isLoading) return null;
    try {
      setIsLoading(true);
      console.log("Fetching posts, limit:", limit);
      const res = await fetchPosts(limit, user.id);

      if (res.success) {
        if (res.data.length === posts.length) {
          sethasmore(false);
        } else {
          setPosts(res.data);
          setLimit((prev) => prev + 10);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getPosts();
    }
  }, [user?.id]);
  const handleLogout = async () => {
    // Confirmation alert
    Alert.alert(
      "Confirm",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: () => onLogout(),
          style: "destructive",
        },
      ],
      { cancelable: true } // Allows dismissing the alert by tapping outside
    );
  };

  // const handleLogout = async () => {
  //   //confirmation
  //   Alert.alert(
  //     "Confirm",
  //     "Are you Sure you want to logout?"[
  //       ({
  //         text: "Cancel",
  //         onPress: () => console.log("Cancel Pressed"),
  //         style: "cancel",
  //       },
  //       {
  //         text: "LogOut",
  //         onPress: () => onLogout(),
  //         style: "destructive",
  //       })
  //     ]
  //   );
  // };
  return (
    <ScreenWrapper bg="white">
      <FlatList
        ListHeaderComponent={
          <UserHeader user={user} router={router} handleLogout={handleLogout} />
        }
        data={posts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        ListHeaderComponentStyle={{ marginBottom: 20 }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUser={user}
            router={router}
            hasShadow={false}
            // showMoreIcon={false}
            refetchPost={true} // Pass the refetchPost prop
          />
        )}
        onEndReached={() => {
          if (!isLoading) {
            getPosts();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasmore ? (
            <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({ user, router, handleLogout }) => {
  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="Profile" mb={30} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" color={theme.colors.rose} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            <Pressable
              style={styles.editIcon}
              onPress={() => router.push("EditProfile")}
            >
              <Icon name="edit" strokeWidth={2.5} size={20}></Icon>
            </Pressable>
          </View>

          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user && user?.name}</Text>
            <Text style={styles.infoText}>USER ADDRESS</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{user && user?.email}</Text>
            </View>

            {user && user?.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{user?.phoneNumber}</Text>
              </View>
            )}

            {user && user.bio && <Text style={styles.bioText}>{user.bio}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
};
export default profile;

const styles = StyleSheet.create({
  info: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.darkLight,
    borderRadius: theme.radius.sm,
    gap: 10,
  },

  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    position: "absolute",
    right: 10,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.darkLight,
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontsize: hp(2),
    textAlign: "center",
    color: theme.colors.textLight,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  profileContainer: {
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  userInfoContainer: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },
  detailsContainer: {
    width: "100%",
    gap: 15,
  },
  bioText: {
    width: "100%",
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.darkLight,
    borderRadius: theme.radius.sm,
  },
  avatarContainer: {
    position: "relative",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
});
