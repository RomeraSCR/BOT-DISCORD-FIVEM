"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@/discord/base");
const functions_1 = require("@/functions");
const settings_1 = require("@/settings");
const discord_1 = require("@magicyan/discord");
const discord_js_1 = require("discord.js");
const TICKET_CATEGORIES = {
    Duvidas: "❓Duvidas",
    Doações: "🎁Doações",
    Denuncias: "🚫Denuncia",
    Suporte: "🪛Suporte",
};
const BUTTON_IDS = {
    CLOSE: "close-ticket",
    POKAR: "pokar-ticket",
    ADD_MEMBER: "adicionarmem-ticket",
    REMOVE_MEMBER: "removermem-ticket",
    FINALIZE: "finalizar-ticket",
};
new base_1.Component({
    customId: "selecao-tickets",
    type: discord_js_1.ComponentType.StringSelect,
    cache: "cached",
    async run(interaction) {
        try {
            const { values: [option], member, guild } = interaction;
            const channel = guild.channels.cache.find((c) => c.type === discord_js_1.ChannelType.GuildText && c.topic === member.id);
            if (channel) {
                functions_1.reply.warning({
                    interaction,
                    text: `Você já possui um ticket em aberto ${channel}`,
                });
                setTimeout(() => {
                    interaction.deleteReply();
                }, 6000);
                return;
            }
            const channelCreated = await guild.channels.create({
                name: `${TICKET_CATEGORIES[option]}-${member.displayName}`,
                topic: member.id,
                type: discord_js_1.ChannelType.GuildText,
                parent: process.env.CATEGORIA_TICKETID,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: ["ViewChannel"],
                    },
                    {
                        id: member.id,
                        allow: [
                            "ViewChannel",
                            "SendMessages",
                            "AttachFiles",
                            "ReadMessageHistory",
                        ],
                    },
                    {
                        id: process.env.CARGO_STAFF ?? "",
                        allow: [
                            "ViewChannel",
                            "SendMessages",
                            "AttachFiles",
                            "ReadMessageHistory",
                        ],
                    },
                ],
            });
            functions_1.reply.success({
                interaction,
                text: `Seu ticket foi aberto com sucesso ${channelCreated}`,
            });
            setTimeout(() => {
                interaction.deleteReply();
            }, 6000);
            const embed = new discord_js_1.EmbedBuilder({
                title: "Ticket Criado com Sucesso!",
                description: "Todos os responsáveis pelo ticket já estão cientes da abertura\nEvite chamar alguém via DM, basta aguardar alguém já irá lhe\natender...",
                thumbnail: {
                    url: interaction.user.displayAvatarURL() ?? process.env.THUMBNAIL,
                },
                color: (0, discord_1.hexToRgb)(settings_1.settings.colors.theme.default),
                fields: [
                    {
                        name: "> __**Categoria Escolhida:**__",
                        value: `**\`\`\`${TICKET_CATEGORIES[option]}\n\`\`\`**`,
                        inline: true,
                    },
                ],
            });
            const row = new discord_js_1.ActionRowBuilder({
                components: [
                    new discord_js_1.ButtonBuilder({
                        customId: BUTTON_IDS.CLOSE,
                        label: "Sair ou Cancelar",
                        style: discord_js_1.ButtonStyle.Danger,
                    }),
                    new discord_js_1.ButtonBuilder({
                        customId: BUTTON_IDS.POKAR,
                        label: "Pokar Membro",
                        style: discord_js_1.ButtonStyle.Secondary,
                    }),
                    new discord_js_1.ButtonBuilder({
                        customId: BUTTON_IDS.ADD_MEMBER,
                        label: "Adicionar Membro",
                        style: discord_js_1.ButtonStyle.Secondary,
                    }),
                    new discord_js_1.ButtonBuilder({
                        customId: BUTTON_IDS.REMOVE_MEMBER,
                        label: "Remover Membro",
                        style: discord_js_1.ButtonStyle.Secondary,
                    }),
                    new discord_js_1.ButtonBuilder({
                        customId: BUTTON_IDS.FINALIZE,
                        label: "Finalizar Ticket",
                        style: discord_js_1.ButtonStyle.Success,
                    }),
                ],
            });
            channelCreated.send({ embeds: [embed], components: [row] });
        }
        catch (error) {
            console.error("Error in ticket creation:", error);
        }
    },
});
