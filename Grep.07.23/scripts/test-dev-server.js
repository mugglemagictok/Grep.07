#!/usr/bin/env node

const http = require("http");
const https = require("https");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Test origins that should be able to access your dev server
const TEST_ORIGINS = [
  "https://app.tempo.build",
  "http://localhost:3000",
  "https://localhost:3000",
  "http://127.0.0.1:3000",
  "https://127.0.0.1:3000",
];

// Common Expo dev server ports
const EXPO_PORTS = [8081, 19000, 19006, 19001, 19002];

class DevServerTester {
  constructor() {
    this.results = {
      serverStatus: {},
      corsTests: {},
      configIssues: [],
      recommendations: [],
    };
  }

  async testServerVisibility() {
    console.log("🔍 Testing dev server visibility...\n");

    for (const port of EXPO_PORTS) {
      await this.testPort(port);
    }
  }

  async testPort(port) {
    const testUrls = [
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
      `http://0.0.0.0:${port}`,
    ];

    console.log(`📡 Testing port ${port}:`);

    for (const url of testUrls) {
      try {
        const result = await this.makeRequest(url);
        console.log(
          `  ✅ ${url} - ${result.status} (${result.headers["access-control-allow-origin"] || "No CORS header"})`,
        );

        this.results.serverStatus[`${url}`] = {
          accessible: true,
          status: result.status,
          corsHeader: result.headers["access-control-allow-origin"],
        };
      } catch (error) {
        console.log(`  ❌ ${url} - ${error.message}`);
        this.results.serverStatus[`${url}`] = {
          accessible: false,
          error: error.message,
        };
      }
    }
    console.log("");
  }

  async testCorsFromOrigins() {
    console.log("🌐 Testing CORS from external origins...\n");

    // Find active server first
    const activeServer = await this.findActiveServer();
    if (!activeServer) {
      console.log("❌ No active dev server found!");
      return;
    }

    console.log(`🎯 Testing CORS against active server: ${activeServer}\n`);

    for (const origin of TEST_ORIGINS) {
      try {
        const result = await this.testCorsRequest(activeServer, origin);
        console.log(
          `  ${result.success ? "✅" : "❌"} ${origin} - ${result.message}`,
        );

        this.results.corsTests[origin] = result;
      } catch (error) {
        console.log(`  ❌ ${origin} - ${error.message}`);
        this.results.corsTests[origin] = {
          success: false,
          message: error.message,
        };
      }
    }
    console.log("");
  }

  async findActiveServer() {
    for (const port of EXPO_PORTS) {
      try {
        await this.makeRequest(`http://localhost:${port}`);
        return `http://localhost:${port}`;
      } catch (error) {
        // Continue to next port
      }
    }
    return null;
  }

  async testCorsRequest(serverUrl, origin) {
    return new Promise((resolve) => {
      const url = new URL(serverUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: "/",
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "Content-Type",
        },
      };

      const req = http.request(options, (res) => {
        const corsOrigin = res.headers["access-control-allow-origin"];
        const corsHeaders = res.headers["access-control-allow-headers"];

        if (corsOrigin === "*" || corsOrigin === origin) {
          resolve({
            success: true,
            message: `CORS allowed (${corsOrigin})`,
            headers: { corsOrigin, corsHeaders },
          });
        } else {
          resolve({
            success: false,
            message: `CORS blocked (got: ${corsOrigin || "none"})`,
            headers: { corsOrigin, corsHeaders },
          });
        }
      });

      req.on("error", (error) => {
        resolve({
          success: false,
          message: `Request failed: ${error.message}`,
        });
      });

      req.setTimeout(5000, () => {
        resolve({
          success: false,
          message: "Request timeout",
        });
      });

      req.end();
    });
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === "https:" ? https : http;

      const req = client.get(url, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
        });
      });

      req.on("error", reject);
      req.setTimeout(3000, () => {
        reject(new Error("Timeout"));
      });
    });
  }

  checkConfigFiles() {
    console.log("📋 Checking configuration files...\n");

    // Check app.json
    this.checkAppJson();

    // Check metro.config.js
    this.checkMetroConfig();

    // Check package.json scripts
    this.checkPackageJson();

    console.log("");
  }

  checkAppJson() {
    const appJsonPath = path.join(process.cwd(), "app.json");

    if (fs.existsSync(appJsonPath)) {
      try {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
        console.log("📱 app.json analysis:");

        // Check for server config
        if (appJson.server) {
          console.log(
            `  📡 Server config found:`,
            JSON.stringify(appJson.server, null, 2),
          );

          if (appJson.server.host && appJson.server.host !== "0.0.0.0") {
            this.results.configIssues.push(
              `Server host is set to '${appJson.server.host}' instead of '0.0.0.0'`,
            );
            this.results.recommendations.push(
              'Set server.host to "0.0.0.0" in app.json for external access',
            );
          }
        } else {
          console.log("  ℹ️  No server config found");
        }

        // Check for scheme conflicts
        if (appJson.expo?.scheme) {
          console.log(`  🔗 URL scheme: ${appJson.expo.scheme}`);
        }

        // Check for extra router config
        if (appJson.expo?.extra?.router) {
          console.log(
            `  🛣️  Router config:`,
            JSON.stringify(appJson.expo.extra.router, null, 2),
          );
        }
      } catch (error) {
        console.log(`  ❌ Error reading app.json: ${error.message}`);
        this.results.configIssues.push(
          `Failed to parse app.json: ${error.message}`,
        );
      }
    } else {
      console.log("  ❌ app.json not found");
    }
  }

  checkMetroConfig() {
    const metroConfigPath = path.join(process.cwd(), "metro.config.js");

    if (fs.existsSync(metroConfigPath)) {
      console.log("🚇 metro.config.js found:");
      try {
        const metroConfig = fs.readFileSync(metroConfigPath, "utf8");
        console.log("  📄 Content preview:");
        console.log(
          metroConfig
            .split("\n")
            .slice(0, 10)
            .map((line) => `    ${line}`)
            .join("\n"),
        );

        // Check for server-related configurations
        if (metroConfig.includes("server")) {
          console.log("  ⚠️  Server configuration detected in metro.config.js");
          this.results.configIssues.push(
            "Custom server config in metro.config.js may override CORS settings",
          );
        }
      } catch (error) {
        console.log(`  ❌ Error reading metro.config.js: ${error.message}`);
      }
    } else {
      console.log("🚇 No metro.config.js found (using defaults)");
    }
  }

  checkPackageJson() {
    const packageJsonPath = path.join(process.cwd(), "package.json");

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8"),
        );
        console.log("📦 package.json scripts:");

        Object.entries(packageJson.scripts || {}).forEach(([name, script]) => {
          if (name.includes("start") || name.includes("dev")) {
            console.log(`  ${name}: ${script}`);
          }
        });
      } catch (error) {
        console.log(`  ❌ Error reading package.json: ${error.message}`);
      }
    }
  }

  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 FINAL REPORT");
    console.log("=".repeat(60));

    // Server accessibility summary
    console.log("\n🖥️  SERVER ACCESSIBILITY:");
    const accessibleServers = Object.entries(this.results.serverStatus).filter(
      ([_, result]) => result.accessible,
    );

    if (accessibleServers.length === 0) {
      console.log("  ❌ No accessible servers found!");
      console.log("  💡 Make sure to start your dev server first:");
      console.log(
        "     EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --tunnel",
      );
    } else {
      console.log(
        `  ✅ Found ${accessibleServers.length} accessible server(s)`,
      );
      accessibleServers.forEach(([url, result]) => {
        console.log(`     ${url} - CORS: ${result.corsHeader || "None"}`);
      });
    }

    // CORS test summary
    console.log("\n🌐 CORS TEST RESULTS:");
    const corsResults = Object.entries(this.results.corsTests);
    if (corsResults.length === 0) {
      console.log("  ⚠️  No CORS tests performed (no active server)");
    } else {
      const successful = corsResults.filter(([_, result]) => result.success);
      console.log(
        `  ✅ Successful: ${successful.length}/${corsResults.length}`,
      );

      corsResults.forEach(([origin, result]) => {
        console.log(
          `     ${result.success ? "✅" : "❌"} ${origin}: ${result.message}`,
        );
      });
    }

    // Configuration issues
    if (this.results.configIssues.length > 0) {
      console.log("\n⚠️  CONFIGURATION ISSUES:");
      this.results.configIssues.forEach((issue) => {
        console.log(`  • ${issue}`);
      });
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log("\n💡 RECOMMENDATIONS:");
      this.results.recommendations.forEach((rec) => {
        console.log(`  • ${rec}`);
      });
    }

    // Standard recommendations
    console.log("\n🔧 STANDARD TROUBLESHOOTING STEPS:");
    console.log(
      "  1. Start dev server with tunnel and bind to all interfaces:",
    );
    console.log(
      "     EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --tunnel",
    );
    console.log("  2. Check that tunnel URL is active and accessible");
    console.log("  3. Verify no browser extensions are blocking requests");
    console.log("  4. Try accessing from incognito mode");
    console.log("  5. Check firewall settings for the dev server ports");

    console.log("\n" + "=".repeat(60));
  }

  async run() {
    console.log("🚀 Expo Dev Server Connectivity Tester");
    console.log("=====================================\n");

    // Check configuration files first
    this.checkConfigFiles();

    // Test server visibility
    await this.testServerVisibility();

    // Test CORS from different origins
    await this.testCorsFromOrigins();

    // Generate final report
    this.generateReport();
  }
}

// Run the tester
if (require.main === module) {
  const tester = new DevServerTester();
  tester.run().catch(console.error);
}

module.exports = DevServerTester;
