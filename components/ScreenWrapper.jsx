import { StatusBar, View, Text } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ScreenWrapper = ({ children, bg }) => {
  const { top } = useSafeAreaInsets();

  const paddingTop = top > 0 ? top + 5 : 1;
  return (
    <View style={{ flex: 1, paddingTop, backgroundColor: bg }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {children}
    </View>
  );
};

export default ScreenWrapper;
