"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@/discord/base");
const discord_js_1 = require("discord.js");
new base_1.Command({
    name: "atividade",
    description: "Controla a atividade de bot",
    type: discord_js_1.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "definir",
            description: "Escolha uma mensagem a ser exibida na atividade do bot",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "mensagem",
                    description: "mensagem que será exibida na atividade",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    maxLength: 120,
                    required: true,
                },
                {
                    name: "tipo",
                    description: "Tipo de atividade",
                    type: discord_js_1.ApplicationCommandOptionType.Number,
                    choices: [
                        { name: "Jogando", value: 0 },
                        { name: "Transmitindo", value: 1 },
                        { name: "Ouvindo", value: 2 },
                        { name: "Assistindo", value: 3 },
                        { name: "Competindo", value: 4 },
                    ],
                },
                {
                    name: "status",
                    description: "status da presença do bot",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    choices: Object.entries(discord_js_1.PresenceUpdateStatus).map(([name, value]) => ({ name, value })),
                },
            ],
        },
        {
            name: "limpar",
            description: "Limpa a atividade do bot",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
        },
    ],
    async run(interaction) {
        const { client, options } = interaction;
        switch (options.getSubcommand(true)) {
            case "definir": {
                const message = options.getString("mensagem", true);
                const type = options.getNumber("tipo") ?? discord_js_1.ActivityType.Playing;
                const status = (options.getString("status") ??
                    "online");
                client.user.setPresence({
                    status,
                    activities: [{ name: message, type }],
                });
                interaction.reply({
                    ephemeral: true,
                    content: `Mensagem de atividade do bot definida para: ${(0, discord_js_1.codeBlock)(message)}`,
                });
                return;
            }
            case "limpar": {
                client.user.setActivity();
                interaction.reply({
                    ephemeral: true,
                    content: "A atividade do bot foi limpa!",
                });
                return;
            }
        }
    },
});
