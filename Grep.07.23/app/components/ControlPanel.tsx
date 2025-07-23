import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Folder, Search, Settings, LogOut } from "lucide-react-native";

interface ControlPanelProps {
  onOpenEditor?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  onQuit?: () => void;
}

const ControlPanel = ({
  onOpenEditor = () => console.log("Open Editor clicked"),
  onOpenSearch = () => console.log("Search Files clicked"),
  onOpenSettings = () => console.log("Settings clicked"),
  onQuit = () => console.log("Quit clicked"),
}: ControlPanelProps) => {
  return (
    <View className="w-[300px] h-full bg-gray-900 flex flex-col p-4">
      {/* Header with Kek frog icon */}
      <View className="items-center mb-8 mt-4">
        <Image
          source={{
            uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=kekfrog",
          }}
          className="w-20 h-20 rounded-full bg-green-500"
        />
        <Text className="text-white text-xl font-bold mt-2">Grep</Text>
        <Text className="text-gray-400 text-sm">Text Capture & Automation</Text>
      </View>

      {/* Control buttons */}
      <View className="flex-1">
        <TouchableOpacity
          className="flex-row items-center p-4 mb-2 bg-gray-800 rounded-lg"
          onPress={onOpenEditor}
        >
          <Folder size={24} color="#ffffff" />
          <Text className="text-white text-lg ml-3">Open Grep Editor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center p-4 mb-2 bg-gray-800 rounded-lg"
          onPress={onOpenSearch}
        >
          <Search size={24} color="#ffffff" />
          <Text className="text-white text-lg ml-3">Search Files</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center p-4 mb-2 bg-gray-800 rounded-lg"
          onPress={onOpenSettings}
        >
          <Settings size={24} color="#ffffff" />
          <Text className="text-white text-lg ml-3">Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Quit button at bottom */}
      <TouchableOpacity
        className="flex-row items-center p-4 bg-red-900 rounded-lg mb-4"
        onPress={onQuit}
      >
        <LogOut size={24} color="#ffffff" />
        <Text className="text-white text-lg ml-3">Quit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ControlPanel;
