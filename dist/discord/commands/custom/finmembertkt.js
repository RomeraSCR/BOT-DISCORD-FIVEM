"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@/discord/base");
const discord_html_transcripts_1 = require("discord-html-transcripts");
const discord_js_1 = require("discord.js");
const BUTTON_IDS = { FINALIZE: "finalizar-ticket", };
new base_1.Component({
    customId: BUTTON_IDS.FINALIZE,
    type: discord_js_1.ComponentType.Button,
    cache: "cached",
    async run(interaction) {
        try {
            if (!interaction.guild) {
                console.error('Canal inexistente!');
                return;
            }
            const member = await interaction.guild.members.fetch(interaction.user);
            if (!member.roles.cache.has(process.env.CARGO_STAFF ?? "")) {
                await interaction.reply({ ephemeral: true, content: "Somente atendentes podem usar esse botão" });
                return;
            }
            const logChannelId = process.env.CANAL_TRANSCRIPT ?? "";
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (!logChannel) {
                console.error('Canal de log inexistente!');
                return;
            }
            const transcript = await (0, discord_html_transcripts_1.createTranscript)(interaction.channel);
            await logChannel.send({ files: [transcript] });
            closeTicket(interaction);
        }
        catch (error) {
            console.error("Erro ao finalizar o ticket:", error);
        }
    }
});
function closeTicket(interaction) {
    try {
        const channel = interaction.guild?.channels.cache.get(process.env.CANAL_LOG_TKT ?? "");
        if (channel) {
            const logEmbed = new discord_js_1.EmbedBuilder({
                title: (`Ticket #${interaction.channel?.name} Fechado com Transcript`),
                thumbnail: {
                    url: process.env.THUMBNAIL ?? ""
                },
                description: `O Ticket foi fechado por <@${interaction.user.id}> **com transcript.**\nLink Transcript:`,
                timestamp: new Date().toISOString(),
                footer: {
                    text: "Sistema de ticket byRomeraSCR"
                },
            });
            channel.send({ embeds: [logEmbed] }).catch(console.error);
        }
        else {
            console.error('Canal de log inexistente');
        }
        interaction.channel?.delete().catch(console.error);
    }
    catch (error) {
        console.error("Erro ao fechar ticket:", error);
    }
}
