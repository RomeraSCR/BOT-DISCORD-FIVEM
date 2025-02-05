"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const settings_1 = require("@/settings");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
class Component {
    static components = new discord_js_1.Collection();
    static get(customId, type) {
        return Component.components.find(c => c.customId == customId && c.type == type) ||
            Component.logical.find(c => c.customId(customId) && c.type == type);
    }
    static logical = [];
    constructor(data) {
        if (typeof data.customId === "string") {
            Component.components.set(data.customId, data);
            settings_1.log.success(chalk_1.default.green(`${chalk_1.default.cyan.underline(data.customId)} componentes registrados com sucesso💫!`));
        }
        else {
            Component.logical.push(data);
            const name = data.name;
            settings_1.log.success(chalk_1.default.green(`${chalk_1.default.cyan.underline(name)} componentes registrados com sucesso💫!`));
        }
    }
}
exports.Component = Component;
