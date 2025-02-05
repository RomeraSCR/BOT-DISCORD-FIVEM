"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@/discord/base");
const discord_js_1 = require("discord.js");
const BUTTON_IDS = {
    CLOSE: "close-ticket",
    CONFIRM_YES: "confirm-yes",
    CONFIRM_NO: "confirm-no"
};
new base_1.Component({
    customId: BUTTON_IDS.CLOSE,
    type: discord_js_1.ComponentType.Button,
    cache: "cached",
    async run(interaction) {
        try {
            if (!interaction.guild) {
                console.error('Canal inexistente!');
                return;
            }
            if (interaction.member && 'id' in interaction.member) {
                const memberId = interaction.member.id;
                const logEmbed = new discord_js_1.EmbedBuilder({
                    title: ('Deseja realmente fechar o ticket?\nAo fechar o ticket não será gerado o transcript'),
                    thumbnail: {
                        url: process.env.THUMBNAIL ?? ""
                    },
                    description: "Clique em um dos botões abaixo para confirmar sua escolha:",
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Sistema de ticket byRomeraSCR"
                    },
                });
                const actionRow = new discord_js_1.ActionRowBuilder({
                    components: [
                        new discord_js_1.ButtonBuilder({
                            customId: BUTTON_IDS.CONFIRM_YES,
                            label: "Sim",
                            style: discord_js_1.ButtonStyle.Success,
                        }),
                        new discord_js_1.ButtonBuilder({
                            customId: BUTTON_IDS.CONFIRM_NO,
                            label: "Não",
                            style: discord_js_1.ButtonStyle.Danger,
                        })
                    ],
                });
                const message = await interaction.channel?.send({ embeds: [logEmbed], components: [actionRow] });
                const collector = interaction.channel?.createMessageComponentCollector({ time: 50000 });
                collector?.on('collect', async (interaction) => {
                    if (interaction.user.id === memberId) {
                        await interaction.deferUpdate();
                        if (interaction.customId === BUTTON_IDS.CONFIRM_YES) {
                            closeTicket(interaction, memberId);
                        }
                        else if (interaction.customId === BUTTON_IDS.CONFIRM_NO) {
                            await interaction.followUp({ content: "O fechamento do Ticket foi cancelado!" });
                            await message?.delete().catch(console.error);
                        }
                        collector.stop();
                    }
                });
                collector?.on('end', () => {
                    const components = [actionRow];
                    message?.edit({ components }).catch(console.error);
                });
            }
            else {
                console.error('Interaction member is not a GuildMember.');
            }
        }
        catch (error) {
            console.error("Error in closing ticket:", error);
        }
        function closeTicket(interaction, memberId) {
            try {
                const channel = interaction.guild?.channels.cache.get(process.env.CANAL_LOG_TKT ?? "");
                if (channel) {
                    const logEmbed = new discord_js_1.EmbedBuilder({
                        title: (`Ticket #${interaction.channel?.name} Fechado sem Transcript`),
                        thumbnail: {
                            url: process.env.THUMBNAIL ?? ""
                        },
                        description: `O Ticket foi fechado por <@${memberId}> **sem transcript.**`,
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
    }
});
