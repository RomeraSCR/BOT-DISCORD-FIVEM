"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_1 = require("@/discord/base");
const discord_1 = require("@magicyan/discord");
const discord_js_1 = require("discord.js");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const mysql = require('mysql2/promise');
dotenv_1.default.config();
const VISITOR_ROLE_ID = process.env.CARGO_VISITANTE;
const NEW_ROLE_ID = process.env.CARGO_CIDADAO;
const CHANNEL_ID = process.env.CANAL_APROVADOS;
new base_1.Component({
    customId: "btn_registrar",
    type: discord_js_1.ComponentType.Button,
    cache: "cached",
    async run(interaction) {
        try {
            if (interaction.deferred || interaction.replied) {
                console.error('Interaction has already been replied or deferred.');
                return;
            }
            if (!interaction.guild) {
                console.error('Guild not found.');
                return;
            }
            const member = await interaction.guild.members.fetch(interaction.user);
            if (!member.roles.cache.has(VISITOR_ROLE_ID ?? "")) {
                await interaction.reply({ ephemeral: true, content: "Discord já aprovado" });
                return;
            }
            new base_1.Modal({
                customId: "whitelist_modal",
                cache: "cached",
                isFromMessage: true,
                async run(interaction) {
                },
            });
            const modal = await interaction.showModal(new discord_js_1.ModalBuilder({
                customId: "whitelist_modal",
                title: "Faça sua Whitelist",
                components: [
                    (0, discord_1.createModalInput)({
                        customId: "input_id",
                        label: "SEU ID:",
                        placeholder: "Coloque seu ID do jogo",
                        style: discord_js_1.TextInputStyle.Short,
                        minLength: 1,
                        maxLength: 10
                    }),
                    (0, discord_1.createModalInput)({
                        customId: "input_nome",
                        label: "SEU NOME:",
                        placeholder: "Coloque seu NOME do jogo",
                        style: discord_js_1.TextInputStyle.Short,
                        minLength: 3,
                        maxLength: 20
                    })
                ]
            }));
            const modalInteraction = await interaction.awaitModalSubmit({ time: 50_000, filter: (i) => i.user.id === interaction.user.id });
            if (!modalInteraction)
                return;
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });
            const { fields } = modalInteraction;
            const name = fields.getTextInputValue("input_nome");
            const id = fields.getTextInputValue("input_id");
            if (!interaction.guild) {
                await modalInteraction.reply({ ephemeral: true, content: `Esta funcionalidade está disponível apenas em servidores.` });
                return;
            }
            const [rows] = await connection.query(`SELECT whitelist FROM vrp_infos WHERE id = '${id}'`);
            if (rows.length > 0) {
                const { whitelist } = rows[0];
                if (whitelist === 0) {
                    await connection.query(`UPDATE vrp_infos SET whitelist = 1 WHERE id = '${id}'`);
                    await member.setNickname(`${name} | ${id}`);
                    const rolesToAdd = NEW_ROLE_ID ? [NEW_ROLE_ID] : [];
                    const rolesToRemove = VISITOR_ROLE_ID ? [VISITOR_ROLE_ID] : [];
                    await member.roles.add(rolesToAdd);
                    await member.roles.remove(rolesToRemove);
                    const channel = interaction.guild.channels.cache.get(CHANNEL_ID ?? "");
                    if (channel instanceof discord_js_1.TextChannel) {
                        await channel.send(`<@${member.id}> ** - foi liberado no servidor | ID:${id} **`);
                    }
                    else {
                        console.error('Channel is not a text channel.');
                    }
                    modalInteraction.reply({ ephemeral: true, content: "ID Aprovado com Sucesso! Receba as <#" + process.env.CANAL_BEMVINDO + ">" });
                }
                else {
                    await modalInteraction.reply({ ephemeral: true, content: `ID Já se encontra liberado em nossa cidade!` });
                    const rolesToAdd = NEW_ROLE_ID ? [NEW_ROLE_ID] : [];
                    const rolesToRemove = VISITOR_ROLE_ID ? [VISITOR_ROLE_ID] : [];
                    await member.roles.add(rolesToAdd);
                    await member.roles.remove(rolesToRemove);
                }
            }
            else {
                await modalInteraction.reply({ ephemeral: true, content: `ID não encontrado, informe um ID valido.` });
            }
        }
        catch (error) {
            console.error('Error handling button interaction:', error);
        }
    },
});
