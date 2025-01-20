import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Header from "../../components/Header";
import { Image } from "expo-image";
import { getUserImageSource, uploadFile } from "../../services/ImageService";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../assets/icons";
import Input from "../../components/Input";
import Loading from "../../components/loading";
import Button from "../../components/Button";
import { updateUserData } from "../../services/userService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
const EditProfile = () => {
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setloading] = useState(false);
  const router = useRouter();
  const [user, setuser] = useState({
    name: "",
    phoneNumber: "",
    image: null,
    bio: "",
    address: "",
  });

  useEffect(() => {
    if (currentUser) {
      setuser({
        name: currentUser.name || "",
        phoneNumber: currentUser.phoneNumber || "",
        image: getUserImageSource(currentUser.id) || null,
        bio: currentUser.bio || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);
  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setuser({ ...user, image: result.assets[0] });
    }
  };

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phoneNumber, address, image, bio } = userData;
    if (!name || !phoneNumber || !address || !bio || !image) {
      Alert.alert("Edit Profile", "Please fill all the details");
    }
    setloading(true);
    if (typeof image == "object") {
      //upload image
      let imageRes = await uploadFile("profiles", image?.uri, true);
      if (imageRes.success) userData.image = imageRes.data;
      else userData.image = null;
    }
    const res = await updateUserData(currentUser?.id, userData);
    setloading(false);
    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      router.back();
    }
    console.log("updateeeeee", res);
  };
  let imageSource =
    user.image && typeof user.image == "object"
      ? user.image.uri
      : getUserImageSource(user.image);
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Header title="Edit Profile" />

          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" size={20} strokeWidth={2.5} />
              </Pressable>
            </View>

            <Text style={{ fontSize: hp(2), color: theme.colors.text }}>
              Please Fill your Details
            </Text>
            <Input
              icon={<Icon name="user" />}
              placeholder="Enter Your Name"
              value={user.name}
              onChangeText={(value) => setuser({ ...user, name: value })}
            />
            <Input
              icon={<Icon name="call" />}
              placeholder="Enter Your Mobile No."
              value={user.phoneNumber}
              onChangeText={(value) => setuser({ ...user, phoneNumber: value })}
            />
            <Input
              icon={<Icon name="location" />}
              placeholder="Enter Your City"
              value={user.address}
              onChangeText={(value) => setuser({ ...user, address: value })}
            />
            <Input
              // icon={<Icon name="call" />}
              placeholder="Your Bio"
              value={user.bio}
              multiline={true}
              containerStyle={styles.bio}
              onChangeText={(value) => setuser({ ...user, bio: value })}
            />
            <Button title="Update" loading={loading} onPress={onSubmit} />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(15),
    width: wp(30),
    alignSelf: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xxl * 1.0,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  form: {
    gap: 15,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
});
