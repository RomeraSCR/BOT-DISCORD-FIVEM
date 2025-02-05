"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./discord/base");
const settings_1 = require("./settings");
const client = (0, base_1.createClient)();
client.start();
process.on("uncaughtException", settings_1.log.error);
process.on("unhandledRejection", settings_1.log.error);
