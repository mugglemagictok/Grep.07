import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

interface LiveOutputPanelProps {
  output?: string;
  isVisible?: boolean;
  theme?: "dark" | "light" | "plain";
}

export default function LiveOutputPanel({
  output = "No output to display. Run a script to see results here.",
  isVisible = true,
  theme = "dark",
}: LiveOutputPanelProps) {
  // Determine background and text colors based on theme
  const getStyles = () => {
    switch (theme) {
      case "dark":
        return {
          backgroundColor: "#1e1e1e",
          textColor: "#ffffff",
        };
      case "light":
        return {
          backgroundColor: "#ffffff",
          textColor: "#000000",
        };
      case "plain":
      default:
        return {
          backgroundColor: "#f0f0f0",
          textColor: "#333333",
        };
    }
  };

  const { backgroundColor, textColor } = getStyles();

  if (!isVisible) return null;

  return (
    <View
      className="w-full h-[200px] border-t border-gray-700"
      style={{ backgroundColor }}
    >
      <View className="flex-row justify-between items-center px-4 py-2 border-b border-gray-700">
        <Text style={{ color: textColor }} className="font-bold">
          Output Panel
        </Text>
        <Text style={{ color: textColor }} className="text-xs">
          Script execution results
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
        <Text
          style={{ color: textColor, fontFamily: "SpaceMono-Regular" }}
          className="text-sm"
        >
          {output}
        </Text>
      </ScrollView>
    </View>
  );
}
