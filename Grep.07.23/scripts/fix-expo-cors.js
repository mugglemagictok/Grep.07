#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Script to automatically fix common Expo CORS and connectivity issues
 */
class ExpoCORSFixer {
  constructor() {
    this.changes = [];
    this.backups = [];
  }

  log(message, type = "info") {
    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      fix: "🔧",
    };
    console.log(`${icons[type]} ${message}`);
  }

  backupFile(filePath) {
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      this.backups.push({ original: filePath, backup: backupPath });
      this.log(`Backed up ${filePath} to ${backupPath}`);
    }
  }

  fixAppJson() {
    const appJsonPath = path.join(process.cwd(), "app.json");

    if (!fs.existsSync(appJsonPath)) {
      this.log("app.json not found", "warning");
      return;
    }

    this.backupFile(appJsonPath);

    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
      let modified = false;

      // Ensure server configuration allows external access
      if (!appJson.server) {
        appJson.server = {};
        modified = true;
      }

      // Set host to 0.0.0.0 for external access
      if (appJson.server.host !== "0.0.0.0") {
        appJson.server.host = "0.0.0.0";
        modified = true;
        this.changes.push('Set server.host to "0.0.0.0" for external access');
      }

      // Ensure port is set (default to 8081)
      if (!appJson.server.port) {
        appJson.server.port = 8081;
        modified = true;
        this.changes.push("Set default server port to 8081");
      }

      // Remove any restrictive CORS settings that might conflict
      if (appJson.server.cors) {
        delete appJson.server.cors;
        modified = true;
        this.changes.push(
          "Removed restrictive CORS settings to use Expo defaults",
        );
      }

      // Ensure router origin is not restrictive
      if (appJson.expo?.extra?.router?.origin !== false) {
        if (!appJson.expo) appJson.expo = {};
        if (!appJson.expo.extra) appJson.expo.extra = {};
        if (!appJson.expo.extra.router) appJson.expo.extra.router = {};
        appJson.expo.extra.router.origin = false;
        modified = true;
        this.changes.push(
          "Set router.origin to false for better compatibility",
        );
      }

      if (modified) {
        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        this.log("Updated app.json with CORS-friendly settings", "fix");
      } else {
        this.log("app.json already has correct settings", "success");
      }
    } catch (error) {
      this.log(`Error updating app.json: ${error.message}`, "error");
    }
  }

  createStartScript() {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "start-with-tunnel.sh",
    );
    const scriptDir = path.dirname(scriptPath);

    // Create scripts directory if it doesn't exist
    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir, { recursive: true });
    }

    const scriptContent = `#!/bin/bash

# Expo Dev Server Startup Script with Tunnel and External Access
# This script ensures the dev server is accessible from external origins like Tempo

echo "🚀 Starting Expo dev server with tunnel and external access..."

# Set environment variables for external access
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export EXPO_USE_FAST_RESOLVER=1

# Clear any cached metro bundler state
echo "🧹 Clearing Metro cache..."
npx expo start --clear

# Start with tunnel for external access
echo "🌐 Starting with tunnel for external access..."
npx expo start --tunnel --host 0.0.0.0
`;

    fs.writeFileSync(scriptPath, scriptContent);

    // Make script executable on Unix systems
    if (process.platform !== "win32") {
      fs.chmodSync(scriptPath, "755");
    }

    this.log(`Created startup script: ${scriptPath}`, "fix");
    this.changes.push("Created optimized startup script with tunnel support");
  }

  updatePackageJsonScripts() {
    const packageJsonPath = path.join(process.cwd(), "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      this.log("package.json not found", "warning");
      return;
    }

    this.backupFile(packageJsonPath);

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      let modified = false;

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      // Add tunnel-specific start script
      if (!packageJson.scripts["start:tunnel"]) {
        packageJson.scripts["start:tunnel"] =
          "EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --tunnel --host 0.0.0.0";
        modified = true;
        this.changes.push("Added start:tunnel script for external access");
      }

      // Add clear cache script
      if (!packageJson.scripts["start:clean"]) {
        packageJson.scripts["start:clean"] = "npx expo start --clear";
        modified = true;
        this.changes.push("Added start:clean script for cache clearing");
      }

      if (modified) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.log("Updated package.json with new scripts", "fix");
      }
    } catch (error) {
      this.log(`Error updating package.json: ${error.message}`, "error");
    }
  }

  checkMetroConfig() {
    const metroConfigPath = path.join(process.cwd(), "metro.config.js");

    if (fs.existsSync(metroConfigPath)) {
      const content = fs.readFileSync(metroConfigPath, "utf8");

      // Check for server configurations that might interfere
      if (content.includes("server") && content.includes("host")) {
        this.log(
          "Metro config contains server settings that might override app.json",
          "warning",
        );
        this.log(
          "Consider reviewing metro.config.js for conflicting server settings",
          "info",
        );
      } else {
        this.log("Metro config looks good", "success");
      }
    }
  }

  generateInstructions() {
    console.log("\n" + "=".repeat(60));
    console.log("📋 NEXT STEPS");
    console.log("=".repeat(60));

    console.log("\n1. 🚀 Start your dev server with external access:");
    console.log("   npm run start:tunnel");
    console.log("   OR");
    console.log(
      "   EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --tunnel",
    );

    console.log("\n2. 🔍 Look for the tunnel URL in the output:");
    console.log('   "Tunnel ready: https://your-project.exp.direct"');

    console.log("\n3. ✅ Verify the server is listening on 0.0.0.0:");
    console.log(
      '   Look for "Starting project on 0.0.0.0:8081" (not localhost)',
    );

    console.log("\n4. 🧪 Test connectivity:");
    console.log("   node scripts/test-dev-server.js");

    console.log("\n5. 🌐 If still having issues with Tempo:");
    console.log("   - Try incognito mode");
    console.log("   - Disable browser extensions");
    console.log("   - Check firewall settings");
    console.log("   - Restart the dev server");

    if (this.backups.length > 0) {
      console.log("\n📁 Backup files created:");
      this.backups.forEach((backup) => {
        console.log(`   ${backup.original} -> ${backup.backup}`);
      });
    }
  }

  run() {
    console.log("🔧 Expo CORS & Connectivity Fixer");
    console.log("==================================\n");

    this.log("Analyzing and fixing Expo configuration for external access...");

    // Fix app.json
    this.fixAppJson();

    // Update package.json scripts
    this.updatePackageJsonScripts();

    // Create startup script
    this.createStartScript();

    // Check metro config
    this.checkMetroConfig();

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ CHANGES MADE");
    console.log("=".repeat(60));

    if (this.changes.length === 0) {
      this.log("No changes needed - configuration already optimal!", "success");
    } else {
      this.changes.forEach((change) => {
        console.log(`  • ${change}`);
      });
    }

    this.generateInstructions();
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new ExpoCORSFixer();
  fixer.run();
}

module.exports = ExpoCORSFixer;
