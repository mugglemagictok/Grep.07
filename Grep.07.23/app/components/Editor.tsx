import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ChevronDown, FileText, Save, Plus, Play } from "lucide-react-native";

interface EditorProps {
  content?: string;
  onContentChange?: (text: string) => void;
  onRunScript?: () => void;
  onSaveFile?: () => void;
  onOpenFile?: () => void;
  onNewFile?: () => void;
}

type ColorMode = "dark" | "light" | "plain";

export default function Editor({
  content = "Welcome to Grep Editor!\n\nStart typing or capture text from ChatGPT.",
  onContentChange = () => {},
  onRunScript = () => {},
  onSaveFile = () => {},
  onOpenFile = () => {},
  onNewFile = () => {},
}: EditorProps) {
  const [colorMode, setColorMode] = useState<ColorMode>("dark");
  const [showColorModeDropdown, setShowColorModeDropdown] = useState(false);

  const getBackgroundColor = () => {
    switch (colorMode) {
      case "dark":
        return "#000000";
      case "light":
        return "#ffffff";
      case "plain":
        return "#e0e0e0";
      default:
        return "#000000";
    }
  };

  const getTextColor = () => {
    switch (colorMode) {
      case "dark":
        return "#ffffff";
      case "light":
        return "#000000";
      case "plain":
        return "#333333";
      default:
        return "#ffffff";
    }
  };

  const toggleColorModeDropdown = () => {
    setShowColorModeDropdown(!showColorModeDropdown);
  };

  const changeColorMode = (mode: ColorMode) => {
    setColorMode(mode);
    setShowColorModeDropdown(false);
  };

  return (
    <View
      className="flex-1 bg-gray-900"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      {/* Editor Toolbar */}
      <View className="flex-row items-center justify-between p-2 border-b border-gray-700">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onNewFile}
            className="flex-row items-center px-3 py-2 mr-2 rounded-md bg-gray-800"
          >
            <Plus size={16} color="#ffffff" />
            <Text className="ml-1 text-white">New</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenFile}
            className="flex-row items-center px-3 py-2 mr-2 rounded-md bg-gray-800"
          >
            <FileText size={16} color="#ffffff" />
            <Text className="ml-1 text-white">Open</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSaveFile}
            className="flex-row items-center px-3 py-2 mr-2 rounded-md bg-gray-800"
          >
            <Save size={16} color="#ffffff" />
            <Text className="ml-1 text-white">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRunScript}
            className="flex-row items-center px-3 py-2 rounded-md bg-green-700"
          >
            <Play size={16} color="#ffffff" />
            <Text className="ml-1 text-white">Run</Text>
          </TouchableOpacity>
        </View>

        <View className="relative">
          <TouchableOpacity
            onPress={toggleColorModeDropdown}
            className="flex-row items-center px-3 py-2 rounded-md bg-gray-800"
          >
            <Text className="mr-1 text-white">
              Theme: {colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}
            </Text>
            <ChevronDown size={16} color="#ffffff" />
          </TouchableOpacity>

          {showColorModeDropdown && (
            <View
              className="absolute right-0 z-10 mt-1 w-32 rounded-md bg-gray-800"
              style={{
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
            >
              <TouchableOpacity
                onPress={() => changeColorMode("dark")}
                className="px-4 py-2 hover:bg-gray-700"
              >
                <Text className="text-white">Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeColorMode("light")}
                className="px-4 py-2 hover:bg-gray-700"
              >
                <Text className="text-white">Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeColorMode("plain")}
                className="px-4 py-2 hover:bg-gray-700"
              >
                <Text className="text-white">Plain</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Text Editor Area */}
      <ScrollView className="flex-1 p-4">
        <TextInput
          multiline
          value={content}
          onChangeText={onContentChange}
          className="flex-1 text-base font-mono"
          style={{ color: getTextColor() }}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}
