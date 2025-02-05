"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = exports.log = void 0;
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const node_fs_1 = require("node:fs");
const consola_1 = require("consola");
Object.defineProperty(exports, "log", { enumerable: true, get: function () { return consola_1.consola; } });
const settings_json_1 = tslib_1.__importDefault(require("./settings.json"));
exports.settings = settings_json_1.default;
require("./constants");
const developmentEnvPath = rootTo(".env.development");
dotenv_1.default.config({
    path: (0, node_fs_1.existsSync)(developmentEnvPath)
        ? developmentEnvPath
        : rootTo(".env")
});
