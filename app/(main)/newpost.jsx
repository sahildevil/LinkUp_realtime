import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import RichTextEditor from "../../components/RichTextEditor";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "../../assets/icons";
import Button from "../../components/Button";
import * as ImagePicker from "expo-image-picker";
import { getSupabaseFileUrl } from "../../services/ImageService";
import { Image } from "react-native";
import { Video } from "expo-av";
import { createorupdatepost } from "../../services/PostService";
const newpost = () => {
  const post = useLocalSearchParams();
  console.log("posttttt", post);
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const [file, setfile] = useState(null);

  useEffect(() => {
    if (post && post.id && !isNaN(post.id)) {
      bodyRef.current = post.body || "";
      setfile(post.file || null);
      setTimeout(() => {
        editorRef?.current?.setContentHTML(post.body || "");
      }, 300);
    }
  }, []);

  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    };

    if (!isImage) {
      mediaConfig = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
      };
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

      if (!result.canceled) {
        console.log("Selected File:", result.assets[0]);
        setfile(result.assets[0]); // Correctly set the file
      } else {
        console.log("ImagePicker was canceled.");
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
    }
  };

  const isLocalFile = (file) => {
    if (!file) return null;
    if (typeof file == "object") return true;
    return false;
  };
  const getFileType = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type;
    }
    //check for remote files
    if (file.includes("postImage")) {
      return "image";
    }
    return "video";
  };

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert("Post", "Please choose image or add post body");
      return;
    }

    let data = {
      file,
      body: bodyRef.current,
      userId: user?.id,
    };

    // Add id to data if this is an edit operation
    if (post && post.id) {
      data.id = post.id;
    }

    //create post
    setloading(true);
    let res = await createorupdatepost(data);
    setloading(false);

    if (res.success) {
      setfile(null);
      bodyRef.current = "";
      editorRef.current?.setContentHTML("");
      router.back();
    } else {
      Alert.alert("Post", "Failed to create post", res.msg);
    }
  };

  const getFileUri = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      console.log("Local file URI:", file.uri);
      return file.uri; // This should give the correct URI
    }
    const remoteUri = getSupabaseFileUrl(file)?.uri;
    console.log("Remote file URI:", remoteUri);
    return remoteUri;
  };

  //console.log("uriiiiiiiii", getFileUri(file));
  return (
    <ScreenWrapper bg="white">
      <View>
        <Header title="Create Post" />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          <View style={styles.header}>
            <Avatar
              style={styles.avatar}
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />
            <View>
              <Text style={styles.username}>{user && user?.name}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>

          <View style={styles.texteditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body) => {
                if (typeof body !== "string") {
                  console.error("Invalid body content type:", typeof body);
                } else {
                  bodyRef.current = body;
                }
              }}
            />

            {file && (
              <View style={styles.file}>
                {getFileType(file) === "video" ? (
                  <Video
                    style={{ width: "100%", height: "100%" }} // Ensure it fills the container
                    source={{ uri: getFileUri(file) }} // Correct URI for video
                    resizeMode="contain" // Proper resizing for video content
                    isLooping // Makes the video loop
                    useNativeControls // Adds playback controls
                    shouldPlay // Auto-play the video when selected
                  />
                ) : (
                  <Image
                    source={{ uri: getFileUri(file) }}
                    resizeMode="cover"
                    style={{ width: "100%", height: "100%" }} // Ensure it takes the container size
                  />
                )}

                <Pressable
                  style={styles.closeIcon}
                  onPress={() => setfile(null)}
                >
                  <Icon name="delete" size={22} color="white" />
                </Pressable>
              </View>
            )}
          </View>
          <View style={styles.media}>
            <Text style={styles.addimagetext}>Add to Your post</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <Button
            buttonStyle={{ height: hp(6.2), width: "50%" }}
            title={post && post.id ? "Update" : "Post"}
            loading={loading}
            hasShadow={false}
            onPress={onSubmit}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default newpost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: wp(2),
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  avatar: {
    marginLeft: 10,
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addimagetext: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  imageIcon: {
    borderRadius: theme.radius.md,
  },
  texteditor: {
    paddingHorizontal: wp(2),
  },
  file: {
    marginTop: 10,
    width: "100%",
    height: hp(25), // Adjust height as needed
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.gray,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.lightGray, // Optional background for better visibility
  },

  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    backgroundColor: "rgba(255,0,0,0.6)",
    borderRadius: 20,
  },
});
