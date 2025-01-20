import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createpostcomment,
  fetchPostDetails,
  fetchUserDetails,
  removepostcomment,
  removepost,
} from "../../services/PostService";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import PostCard from "../../components/PostCard";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/loading";
import Input from "../../components/Input";
import { useRef } from "react";
import Icon from "../../assets/icons";
import CommentItem from "../../components/CommentItem";
import { createNotification } from "../../services/notifications";

const postDetails = () => {
  const { postId } = useLocalSearchParams();
  const [post, setpost] = useState(null);
  const { user } = useAuth();
  const router = useRouter();
  const [startloading, setstartloading] = useState(true);
  const inputRef = useRef(null);
  const commentRef = useRef("");
  const [loading, setloading] = useState(false);
  useEffect(() => {
    getPostDetails();
  }, []);

  const getPostDetails = async () => {
    let res = await fetchPostDetails(postId);
    //console.log("got post detailds", res);
    if (res.success) setpost(res.data);
  };

  console.log("postdetails", post);

  const onDeleteComment = async (comment) => {
    console.log("deleted cooment", comment);
    let res = await removepostcomment(comment?.id);
    if (res.success) {
      // getPostDetails();
      setpost((prevpost) => {
        let newpost = { ...prevpost };
        newpost.comments = newpost.comments.filter((c) => c.id !== comment.id);
        return newpost;
      });
    } else {
      Alert.alert("comment", res.msg);
    }
  };
  const onNewComment = async () => {
    if (!commentRef.current) return null;

    let data = {
      userId: user?.id,
      postId: post?.id,
      text: commentRef.current,
    };

    setloading(true);
    let res = await createpostcomment(data);
    setloading(false);

    if (res.success) {
      if (user.id !== post.userId) {
        let notify = {
          senderId: user.id,
          receiverId: post.userId,
          title: "commented on your post",
          data: JSON.stringify({ postId: post.id, commentId: res?.data?.id }),
        };
        await createNotification(notify);
      }
      inputRef?.current?.clear();
      commentRef.current = "";

      // Update the post state with the new comment immediately
      const newComment = {
        ...res.data,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      };

      setpost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, newComment],
      }));
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onEdit = async (post) => {
    router.back();
    router.push({
      pathname: "newpost",
      params: { ...post },
    });
  };

  const onDeletePost = async (post) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setloading(true);
          const res = await removepost(post.id);
          setloading(false);

          if (res.success) {
            Alert.alert("Success", "Post deleted successfully");
            router.back(); // Go back to the previous screen
          } else {
            Alert.alert("Error", res.msg || "Failed to delete post");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {!post ? ( // Show a loading state or placeholder if post is null
        <View style={styles.center}>
          <Loading />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <PostCard
            item={post ? post : {}}
            currentUser={user}
            router={router}
            hasShadow={false}
            showMoreIcon={false}
            showDelete={true}
            onDelete={onDeletePost}
            onEdit={onEdit}
          />

          <View style={styles.inputContainer}>
            <Input
              onChangeText={(value) => (commentRef.current = value)}
              inputRef={inputRef}
              placeholder="Type Comment"
              placeholderTextColor={theme.colors.textLight}
              containerStyle={{
                borderWidth: 1,
                flex: 1,
                height: hp(6.2),
                borderRadius: theme.radius.xl,
              }}
            />
            {loading ? (
              <View style={styles.loading}>
                <Loading size="small" />
              </View>
            ) : (
              <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                <Icon name="send" color={theme.colors.primaryDark} />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginVertical: 15, gap: 17 }}>
            {post?.comments?.map((comment) => (
              <CommentItem
                key={comment?.id?.toString()}
                item={comment}
                canDelete={
                  user.id === comment.userId || user.id === post.userId
                }
                onDelete={onDeleteComment}
              />
            ))}
            {post?.comments?.length == 0 && (
              <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
                Be the First one to comment!
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default postDetails;

const styles = StyleSheet.create({
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
});
