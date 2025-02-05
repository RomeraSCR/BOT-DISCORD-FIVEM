"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reply = exports.embedReply = void 0;
const settings_1 = require("@/settings");
const discord_1 = require("@magicyan/discord");
const discord_js_1 = require("discord.js");
function embedReply({ interaction, text, ...options }) {
    const { ephemeral = true, update = false, color, embed: data, clear, content, } = options;
    const embed = new discord_js_1.EmbedBuilder({
        color: (0, discord_1.hexToRgb)(color),
        description: text,
        ...data,
    });
    const components = clear ? [] : undefined;
    if (update) {
        if (interaction.isMessageComponent()) {
            interaction.update({ content, embeds: [embed], components });
            return;
        }
        interaction.editReply({ content, embeds: [embed], components });
        return;
    }
    interaction.reply({ ephemeral, embeds: [embed], content });
}
exports.embedReply = embedReply;
exports.reply = {
    success(options) {
        embedReply({
            color: settings_1.settings.colors.theme.success,
            clear: true,
            ...options,
        });
    },
    danger(options) {
        embedReply({
            color: settings_1.settings.colors.theme.danger,
            clear: true,
            ...options,
        });
    },
    primary(options) {
        embedReply({
            color: settings_1.settings.colors.theme.primary,
            clear: true,
            ...options,
        });
    },
    warning(options) {
        embedReply({
            color: settings_1.settings.colors.theme.warning,
            clear: true,
            ...options,
        });
    },
};
