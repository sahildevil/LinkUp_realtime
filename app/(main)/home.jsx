import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/PostService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/loading";
import { getUserData } from "../../services/userService";

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [hasmore, sethasmore] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const handlePostEvent = async (payload) => {
    console.log("Post event:", payload.eventType);

    if (payload.eventType === "INSERT" && payload?.new?.id) {
      // Handle new post
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.user = res.success ? res.data : {};
      newPost.postLikes = [];
      newPost.comments = [];
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    } else if (payload.eventType === "DELETE") {
      // Handle post deletion
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== payload.old.id)
      );
    }
    if (payload.eventType === "UPDATE" && payload?.new?.id) {
      // Handle UPDATE POST
      setPosts((prevPosts) => {
        let updatedposts = prevPosts.map((post) => {
          if (post.id === payload.new.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });
        return updatedposts;
      });
    }
  };

  const handleCommentEvent = async (payload) => {
    if (payload.eventType === "INSERT") {
      // Handle new comment
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.new.postId) {
            // Get the user data for the comment
            const newComment = {
              ...payload.new,
              user: {
                id: user.id,
                name: user.name,
                image: user.image,
              },
            };
            return {
              ...post,
              comments: [...(post.comments || []), newComment],
            };
          }
          return post;
        });
      });
    } else if (payload.eventType === "DELETE") {
      // Handle comment deletion
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.old.postId) {
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment.id !== payload.old.id
              ),
            };
          }
          return post;
        });
      });
    }
  };

  const handleLikeEvent = async (payload) => {
    if (payload.eventType === "INSERT") {
      // Handle new like
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.new.postId) {
            return {
              ...post,
              postLikes: [...(post.postLikes || []), payload.new],
            };
          }
          return post;
        });
      });
    } else if (payload.eventType === "DELETE") {
      // Handle unlike
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.old.postId) {
            return {
              ...post,
              postLikes: post.postLikes.filter(
                (like) => like.userId !== payload.old.userId
              ),
            };
          }
          return post;
        });
      });
    }
  };

  useEffect(() => {
    // Set up real-time subscriptions
    const postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();

    const commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        handleCommentEvent
      )
      .subscribe();

    const likeChannel = supabase
      .channel("postLikes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "postLikes" },
        handleLikeEvent
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(likeChannel);
    };
  }, []);

  const getPosts = async () => {
    if (!hasmore || isLoading) return null;
    try {
      setIsLoading(true);
      console.log("Fetching posts, limit:", limit);
      const res = await fetchPosts(limit);

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
    getPosts();
  }, []);

  const fetchUnreadNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("id")
      .eq("receiverId", user.id)
      .eq("read", false);

    if (!error && data) {
      setUnreadNotifications(data.length);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();

    const notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user.id}`,
        },
        () => {
          setUnreadNotifications((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>LinkUp!</Text>
          <View style={styles.icons}>
            <Pressable
              onPress={() => {
                console.log("Notifications pressed");
                router.push("/notifications");
              }}
              style={styles.iconContainer}
            >
              <Icon
                name="heart"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                console.log("New post pressed");
                router.push("/newpost");
              }}
            >
              <Icon
                name="plus"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                console.log("Profile pressed");
                router.push("/profile");
              }}
            >
              <Avatar
                uri={user?.image}
                size={hp(3.2)}
                rounded={theme.radius.sm}
              />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard
              item={item}
              currentUser={user}
              router={router}
              hasShadow={false}
              refetchPost={true}
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
                <Text style={styles.noposts}>No more posts</Text>
              </View>
            )
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noposts: {
    fontSize: hp(2),
    color: theme.colors.text,
    textAlign: "center",
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: "bold",
  },
});
