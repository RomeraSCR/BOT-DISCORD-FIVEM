"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_1 = require("@/discord/base");
const discord_js_1 = require("discord.js");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
new base_1.Event({
    name: "ready",
    async run(client) {
        if (!process.env.CANAL_WHITELIST) {
            console.error('O ID DO CANAL WL NÃO FOI DEFINIDO OU ESTÁ INCORRETO!');
            return;
        }
        try {
            const channel = await client.channels.fetch(process.env.CANAL_WHITELIST);
            if (channel instanceof discord_js_1.TextChannel) {
                await sendConnectMessage(channel, client);
                client.on("messageDelete", async (deletedMessage) => {
                    if (deletedMessage.id === process.env.CANAL_WHITELIST) {
                        await sendConnectMessage(channel, client);
                    }
                });
            }
        }
        catch (error) {
            console.error('DESCRIÇÃO DE ERRO CANAL:', error);
        }
    }
});
async function sendConnectMessage(channel, client) {
    await channel.bulkDelete(10, true);
    try {
        const embed = new discord_js_1.EmbedBuilder({
            title: (process.env.TITULOWL),
            thumbnail: {
                url: process.env.THUMBNAIL ?? ""
            },
            image: {
                url: process.env.BANNERWL ?? "",
            },
            description: "Sistema de whitelist exclusivo! \n \n Para fazer sua whitelist clique no botão:",
            timestamp: new Date().toISOString(),
            footer: {
                text: "Sistema de whitelist byRomeraSCR"
            },
        });
        const row = new discord_js_1.ActionRowBuilder({ components: [
                new discord_js_1.ButtonBuilder({
                    customId: "btn_registrar",
                    emoji: "✅",
                    label: "Registrar-se",
                    style: discord_js_1.ButtonStyle.Success
                })
            ] });
        await channel.send({ embeds: [embed], components: [row] });
    }
    catch (error) {
        console.error('DESCRIÇÃO DE ERRO MENSAGEM:', error);
    }
}
