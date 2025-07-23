import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import ControlPanel from "./components/ControlPanel";
import Editor from "./components/Editor";
import LiveOutputPanel from "./components/LiveOutputPanel";
import FileSearch from "./components/FileSearch";
import "../global.css";

type ColorMode = "dark" | "light" | "plain";

interface SearchResult {
  id: string;
  name: string;
  path: string;
  type: string;
}

export default function App() {
  const [showFileSearch, setShowFileSearch] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>("dark");
  const [editorContent, setEditorContent] = useState("");
  const [outputContent, setOutputContent] = useState("");
  const [isMultiMonitor, setIsMultiMonitor] = useState(false);

  // Simulate multi-monitor detection
  useEffect(() => {
    // In a real implementation, this would use macOS APIs via pyobjc/Quartz
    // For now, we'll just simulate based on screen width
    const { width } = Dimensions.get("window");
    setIsMultiMonitor(width > 1920); // Arbitrary threshold for demo purposes
  }, []);

  // Handle file search toggle
  const toggleFileSearch = () => {
    setShowFileSearch(!showFileSearch);
  };

  // Handle color mode change
  const changeColorMode = (mode: ColorMode) => {
    setColorMode(mode);
  };

  // Handle editor content change
  const handleEditorChange = (text: string) => {
    setEditorContent(text);
  };

  // Handle script execution (simulated)
  const runScript = () => {
    setOutputContent(
      `Running script...\n> Executing ${editorContent.split("\n")[0] || "script"}...\n> Process completed successfully.`,
    );
  };

  // Simulate ChatGPT text capture
  const simulateCaptureText = (text: string) => {
    setEditorContent((prev) => prev + "\n" + text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.appContainer}>
        <ControlPanel
          onOpenEditor={() => console.log("Open Editor clicked")}
          onOpenSearch={toggleFileSearch}
          onOpenSettings={() => console.log("Settings clicked")}
          onQuit={() => console.log("Quit clicked")}
        />
        <View style={styles.mainContent}>
          <Editor
            content={editorContent}
            onContentChange={handleEditorChange}
            onRunScript={runScript}
          />
          <LiveOutputPanel
            output={outputContent}
            isVisible={true}
            theme={colorMode}
          />
        </View>
      </View>

      {showFileSearch && (
        <FileSearch
          isVisible={showFileSearch}
          onClose={toggleFileSearch}
          onFileSelect={(file: SearchResult) => {
            setEditorContent(
              `// Content of ${file.path}\n// This is a placeholder for file content`,
            );
            toggleFileSearch();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  appContainer: {
    flex: 1,
    flexDirection: "row",
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
});
