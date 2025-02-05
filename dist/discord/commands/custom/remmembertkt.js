"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@/discord/base");
const discord_1 = require("@magicyan/discord");
const discord_js_1 = require("discord.js");
const TICKET_ROLE_ID = process.env.CARGO_STAFF;
const BUTTON_IDS = { REMOVE_MEMBER: "removermem-ticket", };
new base_1.Component({
    customId: BUTTON_IDS.REMOVE_MEMBER,
    type: discord_js_1.ComponentType.Button,
    cache: "cached",
    async run(interaction) {
        try {
            if (interaction.deferred || interaction.replied) {
                console.error('Interaction has already been replied or deferred.');
                return;
            }
            if (!interaction.guild) {
                console.error('Guilda inexistente.');
                return;
            }
            const member = await interaction.guild.members.fetch(interaction.user);
            if (!member.roles.cache.has(TICKET_ROLE_ID ?? "")) {
                await interaction.reply({ ephemeral: true, content: "Somente atendentes podem usar esse botão" });
                return;
            }
            new base_1.Modal({
                customId: "remmember_modal",
                cache: "cached",
                isFromMessage: true,
                async run(interaction) {
                },
            });
            const modal = await interaction.showModal(new discord_js_1.ModalBuilder({
                customId: "remmember_modal",
                title: "Remover membro do ticket",
                components: [
                    (0, discord_1.createModalInput)({
                        customId: "input_idrem",
                        label: "ID do Discord do membro :",
                        placeholder: "Coloque o ID do membro",
                        style: discord_js_1.TextInputStyle.Short,
                        minLength: 15,
                        maxLength: 20
                    })
                ]
            }));
            const modalInteraction = await interaction.awaitModalSubmit({ time: 50_000, filter: (i) => i.user.id === interaction.user.id });
            if (!modalInteraction)
                return;
            const { fields } = modalInteraction;
            const memberId = fields.getTextInputValue("input_idrem");
            if (interaction.channel instanceof discord_js_1.TextChannel) {
                const memberToREM = await interaction.guild.members.fetch(memberId).catch(error => {
                    console.error('Erro ao buscar o membro:', error);
                    return null;
                });
                if (memberToREM) {
                    await interaction.channel.send(`<@${memberToREM.id}> - foi Removido do Ticket`);
                }
                else {
                    console.error('Membro não encontrado.');
                }
            }
            else {
                console.error('Channel is not a text channel.');
            }
        }
        catch (error) {
            console.error('Error handling button interaction:', error);
        }
    },
});
