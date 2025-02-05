import { Component, Modal } from "@/discord/base";
import { createModalInput } from "@magicyan/discord";
import { ButtonInteraction, ComponentType, ModalBuilder, TextChannel, TextInputStyle, VoiceChannel, GuildMember } from "discord.js";
import dotenv from 'dotenv';
const mysql = require('mysql2/promise');

dotenv.config();

const VISITOR_ROLE_ID = process.env.CARGO_VISITANTE;
const NEW_ROLE_ID = process.env.CARGO_CIDADAO;
const CHANNEL_ID = process.env.CANAL_APROVADOS;

new Component({
    customId: "btn_registrar",
    type: ComponentType.Button,
    cache: "cached",
    async run(interaction: ButtonInteraction) {
        try {
            if (interaction.deferred || interaction.replied) {
                console.error('Interaction has already been replied or deferred.');
                return;
            }

            if (!interaction.guild) {
                console.error('Guild not found.');
                return;
            }

            const member: GuildMember = await interaction.guild.members.fetch(interaction.user);
            if (!member.roles.cache.has(VISITOR_ROLE_ID ??"")) {
                await interaction.reply({ ephemeral: true, content: "Discord já aprovado" });
                return;
            }

            new Modal({
                customId: "whitelist_modal",
                cache: "cached",
                isFromMessage: true,
                async run(interaction) {
                    
                },
            });

            const modal = await interaction.showModal(new ModalBuilder({
                customId: "whitelist_modal",
                title: "Faça sua Whitelist",
                components: [
                    createModalInput({
                        customId: "input_id",
                        label: "SEU ID:",
                        placeholder: "Coloque seu ID do jogo",
                        style: TextInputStyle.Short,
                        minLength: 1,
                        maxLength: 10
                    }),
                    createModalInput({
                        customId: "input_nome",
                        label: "SEU NOME:",
                        placeholder: "Coloque seu NOME do jogo",
                        style: TextInputStyle.Short,
                        minLength: 3,
                        maxLength: 20
                    })
                ]
            }));

            const modalInteraction = await interaction.awaitModalSubmit({ time: 50_000, filter: (i) => i.user.id === interaction.user.id });
            if (!modalInteraction) return;

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

            // Verifica se o ID fornecido está na whitelist e não está banido
            const [rows] = await connection.query(`SELECT whitelist FROM vrp_infos WHERE id = '${id}'`);
            if (rows.length > 0) {
                const { whitelist } = rows[0];
                if (whitelist === 0) {
                    // Atualiza o ID com whitelist 1
                    await connection.query(`UPDATE vrp_infos SET whitelist = 1 WHERE id = '${id}'`);


                    // Altera o nickname do membro
                    await member.setNickname(`${name} | ${id}`);
                    // Adiciona e remove cargos conforme necessário
                    const rolesToAdd = NEW_ROLE_ID ? [NEW_ROLE_ID] : [];
                    const rolesToRemove = VISITOR_ROLE_ID ? [VISITOR_ROLE_ID] : [];
                    await member.roles.add(rolesToAdd);
                    await member.roles.remove(rolesToRemove);

                    const channel = interaction.guild.channels.cache.get(CHANNEL_ID ??"");
                    if (channel instanceof TextChannel) {
                        await channel.send(`<@${member.id}> ** - foi liberado no servidor | ID:${id} **`);
                    } else {
                        console.error('Channel is not a text channel.');
                    }
                    modalInteraction.reply({ ephemeral: true, content: "ID Aprovado com Sucesso! Receba as <#" + process.env.CANAL_BEMVINDO + ">" });


                } else {
                    // ID já está na whitelist ou banido
                    await modalInteraction.reply({ ephemeral: true, content: `ID Já se encontra liberado em nossa cidade!` });
                    const rolesToAdd = NEW_ROLE_ID ? [NEW_ROLE_ID] : [];
                    const rolesToRemove = VISITOR_ROLE_ID ? [VISITOR_ROLE_ID] : [];
                    await member.roles.add(rolesToAdd);
                    await member.roles.remove(rolesToRemove);
                }
            } else {
                // ID não encontrado no banco de dados
                await modalInteraction.reply({ ephemeral: true, content: `ID não encontrado, informe um ID valido.` });
            }
            
        } catch (error) {
            console.error('Error handling button interaction:', error);
        }
    },
});

