import { View, Text, LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth, setUserData } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";
LogBox.ignoreLogs([
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRenderEngineProvider",
  "Warning: TNodeChildrenRenderer",
]);
const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout></MainLayout>
    </AuthProvider>
  );
};
const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      // console.log("session user: ", session?.user?.id);
      if (session) {
        //move to home
        setAuth(session?.user);
        updateUserData(session?.user, session?.user?.email);
        //console.log("auth user", session?.user?.email);
        router.replace("/home");
      } else {
        setAuth(null);
        router.replace("welcome");
      }
    });
  }, []);

  const updateUserData = async (user, email) => {
    let res = await getUserData(user?.id);
    // console.log("user", res);
    if (res.success) setUserData({ ...res.data, email });
  };
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(main)/postDetails"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
};

export default _layout;
