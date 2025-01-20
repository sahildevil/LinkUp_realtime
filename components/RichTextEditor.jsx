// import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";
import { theme } from "../constants/theme";

const RichTextEditor = ({ editorRef, onChange }) => {
  return (
    <View style={{ minHeight: 285 }}>
      <RichToolbar
        actions={[
          actions.insertImage,
          actions.setBold,
          actions.setItalic,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertLink,
          actions.keyboard,
          actions.setStrikethrough,
          actions.setUnderline,
          actions.removeFormat,
          actions.insertVideo,
          actions.checkboxList,
          actions.undo,
          actions.redo,
          actions.heading1,
          actions.heading4,
        ]}
        iconMap={{
          [actions.heading1]: ({ tintColor }) => (
            <Text style={{ color: tintColor }}>H1</Text>
          ),
          [actions.heading4]: ({ tintColor }) => (
            <Text style={{ color: tintColor }}>H4</Text>
          ),
        }}
        style={styles.richbar}
        flatContainerStyle={styles.flatStyle}
        selectedIconTint={theme.colors.primaryDark}
        disabled={false}
        editor={editorRef}
      />

      <RichEditor
        ref={editorRef}
        containerStyle={styles.rich}
        editorStyle={styles.contentStyle}
        placeholder={"What's on your mind?"}
        onChange={(content) => {
          console.log("Content:", content);
          onChange(content);
        }}
      />
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  richbar: {
    marginHorizontal: 10,
    borderTopRightRadius: theme.radius.xl,
    borderTopLeftRadius: theme.radius.xl,
    backgroundColor: theme.colors.gray,
  },
  rich: {
    minHeight: 240,
    flex: 1,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.radius.xl,
    borderColor: theme.colors.gray,
    borderBottomRightRadius: theme.radius.xl,
    padding: 5,
  },
  contentStyle: {
    color: theme.colors.text,
    placeholderColor: "gray",
  },
  flatStyle: {
    paddingHorizontal: 8,
  },
});
