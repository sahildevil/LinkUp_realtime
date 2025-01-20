import React, { useEffect, useState } from "react";
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import moment from "moment";
import Icon from "../assets/icons";
import RenderHtml from "react-native-render-html";
import { Image } from "expo-image";
import { downloadfile, getSupabaseFileUrl } from "../services/ImageService";
import { Video } from "expo-av";
import { createpostlike, removepostlike } from "../services/PostService";
import Loading from "./loading";
import * as ImageManipulator from "expo-image-manipulator";

const textStyles = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};

const tagsStyles = {
  div: textStyles,
  p: textStyles,
  ol: textStyles,
  h1: {
    color: theme.colors.dark,
  },
  h4: {
    color: theme.colors.dark,
  },
};

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  refetchPost,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
}) => {
  const shadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const createdAt = moment(item?.created_at).format("MMM D");
  const [post, setPost] = useState(item);
  const [likes, setLikes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [optimizedImageUri, setOptimizedImageUri] = useState(null);

  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: "postDetails", params: { postId: item?.id } });
  };

  const fetchLikes = () => {
    if (Array.isArray(item?.postLikes)) {
      setLikes(item.postLikes);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetchPostDetails(item.id);
      if (res.success) {
        setPost(res.data);
        if (Array.isArray(res.data?.postLikes)) {
          setLikes(res.data.postLikes);
        }
      }
    };
    fetchPost();
  }, [item.id, refetchPost]);

  useEffect(() => {
    fetchLikes();
  }, [item]);

  const liked = likes.some((like) => like.userId === currentUser?.id);

  const [loading, setloading] = useState(false);
  const onLike = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (liked) {
        const res = await removepostlike(item?.id, currentUser?.id);

        if (res.success) {
          setLikes((prevLikes) =>
            prevLikes.filter((like) => like.userId !== currentUser?.id)
          );
        } else {
          Alert.alert("Post", "Something went wrong while unliking the post.");
        }
      } else {
        const data = {
          userId: currentUser?.id,
          postId: item?.id,
        };
        const res = await createpostlike(data);

        if (res.success) {
          setLikes((prevLikes) => [...prevLikes, { userId: currentUser?.id }]);
        } else {
          Alert.alert("Post", "Something went wrong while liking the post.");
        }
      }
    } catch (error) {
      Alert.alert("Post", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const onShare = async () => {
    try {
      let content = { message: stripHtmlTags(item?.body) };

      if (item?.file) {
        setloading(true);
        const fileUrl = getSupabaseFileUrl(item?.file).uri;
        const localFileUri = await downloadfile(fileUrl);
        setloading(false);

        if (localFileUri) {
          content.url = localFileUri;
        }
      }

      await Share.share(content);
    } catch (error) {
      console.error("Error sharing post:", error);
      Alert.alert("Post", "An error occurred while sharing.");
    }
  };

  const handleonDelete = () => {
    Alert.alert("Delete", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(item),
      },
    ]);
  };

  const handleEdit = () => {
    router.push({
      pathname: "newpost",
      params: {
        id: item.id,
        body: item.body,
        file: item.file,
        userId: item.userId,
      },
    });
  };

  const handleImageLoad = async (imageUri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setOptimizedImageUri(result.uri);
    } catch (error) {
      console.error("Error optimizing image:", error);
      setImageError(true);
    }
  };

  useEffect(() => {
    if (item?.file && item?.file.includes("postImages")) {
      const imageUri = getSupabaseFileUrl(item?.file).uri;
      handleImageLoad(imageUri);
    }
  }, [item?.file]);

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.posttime}>{createdAt}</Text>
          </View>
        </View>

        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon
              name="threeDotsHorizontal"
              size={hp(3.4)}
              strokeWidth={3}
              color={theme.colors.textDark}
            />
          </TouchableOpacity>
        )}

        {showDelete && currentUser.id === item?.userId && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={handleEdit}>
              <Icon name="edit" size={hp(2.5)} color={theme.colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleonDelete}>
              <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.postbody}>
          {item?.body && (
            <RenderHtml
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagsStyles}
            />
          )}
        </View>

        {item?.file && item?.file.includes("postImages") && !imageError && (
          <View style={styles.imageContainer}>
            {!optimizedImageUri ? (
              <Loading size="small" />
            ) : (
              <Image
                source={{ uri: optimizedImageUri }}
                transition={100}
                style={styles.postmedia}
                contentFit="contain"
                contentPosition="center"
                onError={() => setImageError(true)}
              />
            )}
          </View>
        )}

        {item?.file && item?.file.includes("postVideos") && (
          <Video
            source={getSupabaseFileUrl(item?.file)}
            style={[styles.postmedia, { height: hp(30) }]}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike} disabled={isLoading}>
            <Icon
              name="heart"
              size={24}
              fill={liked ? theme.colors.rose : "none"}
              color={liked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes.length}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="comment" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>
            {Array.isArray(item?.comments) ? item.comments.length : 0}
          </Text>
        </View>

        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small"></Loading>
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Icon name="share" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  posttime: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  postbody: {
    marginLeft: 5,
  },
  imageContainer: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.gray,
  },
  postmedia: {
    height: "100%",
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
});
