import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import { ChevronDown, Search, File, X } from "lucide-react-native";

interface SearchResult {
  id: string;
  name: string;
  path: string;
  type: string;
}

interface FileSearchProps {
  isVisible?: boolean;
  onClose?: () => void;
  onFileSelect?: (file: SearchResult) => void;
}

export default function FileSearch({
  isVisible = true,
  onClose = () => {},
  onFileSelect = () => {},
}: FileSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileType, setFileType] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([
    { id: "1", name: "main.py", path: "/src/main.py", type: ".py" },
    { id: "2", name: "editor.py", path: "/src/editor.py", type: ".py" },
    {
      id: "3",
      name: "control_panel.py",
      path: "/src/control_panel.py",
      type: ".py",
    },
    { id: "4", name: "README.md", path: "/README.md", type: ".md" },
    {
      id: "5",
      name: "requirements.txt",
      path: "/requirements.txt",
      type: ".txt",
    },
  ]);

  const fileTypes = ["All", ".py", ".txt", ".md", ".json"];

  const handleSearch = () => {
    // Mock search functionality
    // In a real implementation, this would search the file system
    const filteredResults = [
      { id: "1", name: "main.py", path: "/src/main.py", type: ".py" },
      { id: "2", name: "editor.py", path: "/src/editor.py", type: ".py" },
      {
        id: "3",
        name: "control_panel.py",
        path: "/src/control_panel.py",
        type: ".py",
      },
      { id: "4", name: "README.md", path: "/README.md", type: ".md" },
      {
        id: "5",
        name: "requirements.txt",
        path: "/requirements.txt",
        type: ".txt",
      },
    ].filter((item) => {
      if (fileType !== "All" && item.type !== fileType) return false;
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });

    setSearchResults(filteredResults);
  };

  const handleFileSelect = (file: SearchResult) => {
    onFileSelect(file);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-gray-800 w-[600px] h-[500px] rounded-lg p-4 flex">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">File Search</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-row space-x-2 mb-4">
            <View className="flex-1">
              <TextInput
                className="bg-gray-700 text-white px-4 py-2 rounded-md"
                placeholder="Search for files..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View className="relative">
              <TouchableOpacity
                className="bg-gray-700 px-4 py-2 rounded-md flex-row items-center"
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text className="text-white mr-2">{fileType}</Text>
                <ChevronDown size={16} color="white" />
              </TouchableOpacity>

              {showDropdown && (
                <View className="absolute top-12 right-0 bg-gray-700 rounded-md w-32 z-10">
                  <ScrollView className="max-h-40">
                    {fileTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        className="px-4 py-2 border-b border-gray-600"
                        onPress={() => {
                          setFileType(type);
                          setShowDropdown(false);
                        }}
                      >
                        <Text className="text-white">{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-md flex-row items-center"
              onPress={handleSearch}
            >
              <Search size={16} color="white" className="mr-2" />
              <Text className="text-white">Search</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 bg-gray-900 rounded-md">
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row items-center px-4 py-3 border-b border-gray-700"
                    onPress={() => handleFileSelect(item)}
                  >
                    <File size={20} color="#9ca3af" className="mr-3" />
                    <View>
                      <Text className="text-white font-medium">
                        {item.name}
                      </Text>
                      <Text className="text-gray-400 text-sm">{item.path}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-400">No results found</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
