import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import Home from "../assets/icons/Home";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Input from "../components/Input";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";

const signup = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setloading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please fill all the details!");
      return;
    }
    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setloading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    setloading(false);
    // console.log("session", session);
    // console.log("error", error);
    if (error) {
      Alert.alert("Error", error.message);
    }
  };
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark"></StatusBar>
      <View style={styles.container}>
        <BackButton router={router} />

        <View>
          <Text style={styles.welcomeText}>Let's Start</Text>
        </View>

        <View style={styles.form}>
          <Text style={{ fontSize: hp(2), color: theme.colors.text }}>
            {" "}
            Please Sign Up To Continue
          </Text>
          <Input
            icon={<Icon name="user" size={26} />}
            placeholder="Name"
            onChangeText={(value) => (nameRef.current = value)}
          />
          <Input
            icon={<Icon name="mail" size={26} />}
            placeholder="Email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} />}
            placeholder="New Password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />

          <Button title={"Sign Up"} loading={loading} onPress={onSubmit} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.push("login")}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.primaryDark,
                  fontWeight: theme.fonts.bold,
                },
              ]}
            >
              Log In
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {},
});
