"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = void 0;
const tslib_1 = require("tslib");
const settings_1 = require("@/settings");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
class Modal {
    run(interaction) {
        throw new Error("Method not implemented.");
    }
    static all = new discord_js_1.Collection();
    static get(customId) {
        return Modal.all.get(customId) || Modal.logical.find(m => m.customId(customId));
    }
    static logical = [];
    constructor(data) {
        if (typeof data.customId === "string") {
            Modal.all.set(data.customId, data);
            settings_1.log.success(chalk_1.default.green(`${chalk_1.default.cyan.underline(data.customId)} modal registered successfully!`));
        }
        else {
            Modal.logical.push(data);
            const name = data.name;
            settings_1.log.success(chalk_1.default.green(`${chalk_1.default.cyan.underline(name)} modal registered successfully!`));
        }
    }
}
exports.Modal = Modal;
