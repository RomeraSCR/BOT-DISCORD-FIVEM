"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const settings_1 = require("@/settings");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
class Command {
    data;
    static commands = new discord_js_1.Collection();
    constructor(data) {
        this.data = data;
        settings_1.log.success(chalk_1.default.green(`${chalk_1.default.blue.underline(data.name)} comandos registrados com sucesso💫!`));
        Command.commands.set(data.name, data);
    }
}
exports.Command = Command;
