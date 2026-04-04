const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Stub native-only libraries when bundling for web
const nativeOnlyModules = {
    "react-native-country-picker-modal": path.resolve(__dirname, "stubs/react-native-country-picker-modal.js"),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === "web" && nativeOnlyModules[moduleName]) {
        return { type: "sourceFile", filePath: nativeOnlyModules[moduleName] };
    }
    if (originalResolveRequest) {
        return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './app/globals.css' });