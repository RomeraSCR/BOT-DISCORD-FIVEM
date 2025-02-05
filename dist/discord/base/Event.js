"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const tslib_1 = require("tslib");
const settings_1 = require("@/settings");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
class Event {
    static all = [];
    constructor(data) {
        settings_1.log.success(chalk_1.default.green(`${chalk_1.default.yellow.underline(data.name)} eventos registrados com sucesso!`));
        Event.all.push(data);
    }
}
exports.Event = Event;
