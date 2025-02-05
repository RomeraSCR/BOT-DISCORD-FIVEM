"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const discord_1 = require("@magicyan/discord");
const _1 = require("./");
const settings_1 = require("@/settings");
const fast_glob_1 = require("fast-glob");
const node_path_1 = require("node:path");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
function createClient(options) {
    const client = new discord_js_1.Client({
        intents: discord_1.CustomItents.All,
        partials: [
            discord_js_1.Partials.Channel,
            discord_js_1.Partials.GuildScheduledEvent,
            discord_js_1.Partials.GuildMember,
            discord_js_1.Partials.Message,
            discord_js_1.Partials.User,
            discord_js_1.Partials.ThreadMember
        ],
        failIfNotExists: false,
        ...options
    });
    client.start = async function (options) {
        client.once("ready", (client) => {
            whenReady(client);
            options?.whenReady?.(client);
        });
        const discordDir = (0, node_path_1.join)(__dirname, "..");
        const folders = [
            "commands/**/*.{ts,js}",
            "events/**/*.{ts,js}",
            "components/**/*.{ts,js}",
        ];
        const paths = await (0, fast_glob_1.glob)(folders, { cwd: discordDir });
        for (const path of paths)
            await Promise.resolve(`${(0, node_path_1.join)(discordDir, path)}`).then(s => tslib_1.__importStar(require(s)));
        _1.Event.all.forEach(({ run, name, once }) => once
            ? this.once(name, run)
            : this.on(name, run));
        this.login(process.env.BOT_TOKEN);
    };
    client.on("interactionCreate", interaction => {
        if (interaction.isCommand())
            onCommand(interaction);
        if (interaction.isAutocomplete())
            onAutoComplete(interaction);
        if (interaction.isMessageComponent())
            onComponent(interaction);
        if (interaction.isModalSubmit())
            onModal(interaction);
    });
    return client;
}
exports.createClient = createClient;
async function whenReady(client) {
    console.log();
    settings_1.log.success((0, discord_1.brBuilder)(`${chalk_1.default.green("Bot online")} ${chalk_1.default.blue.underline("discord.js")} 📦 ${chalk_1.default.yellow(discord_js_1.version)}`, `${chalk_1.default.greenBright(`➝ Connected as ${chalk_1.default.underline(client.user.username)}`)}`));
    console.log();
    await client.application.commands.set(Array.from(_1.Command.commands.values()))
        .then(() => settings_1.log.success(chalk_1.default.green("Commands registered successfully!")))
        .catch(settings_1.log.error);
}
function onCommand(commandInteraction) {
    const command = _1.Command.commands.get(commandInteraction.commandName);
    if (command) {
        command.run(commandInteraction, command.store ?? {});
        return;
    }
    settings_1.log.warn(`Missing function to ${commandInteraction.commandName} command`);
}
function onAutoComplete(interaction) {
    const command = _1.Command.commands.get(interaction.commandName);
    if (command?.type !== discord_js_1.ApplicationCommandType.ChatInput || !command.autoComplete)
        return;
    command.autoComplete(interaction, command.store ?? {});
}
function onComponent(interaction) {
    const component = _1.Component.get(interaction.customId, interaction.componentType);
    if (component)
        component.run(interaction);
}
function onModal(interaction) {
    const modal = _1.Modal.get(interaction.customId);
    if (modal)
        modal.run(interaction);
}
