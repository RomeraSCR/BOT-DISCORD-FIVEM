import { Component, Modal } from "@/discord/base";
import { reply } from "@/functions";
import { settings } from "@/settings";
import { brBuilder, createModalInput, hexToRgb, toNull } from "@magicyan/discord";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  ComponentType,
  EmbedBuilder,
  TextChannel,
  ModalBuilder,
  GuildMember,
  TextInputStyle,
  

} from "discord.js";


const TICKET_ROLE_ID = process.env.CARGO_STAFF;

const BUTTON_IDS = { ADD_MEMBER: "adicionarmem-ticket",}

new Component({
    customId: BUTTON_IDS.ADD_MEMBER,
    type: ComponentType.Button,
    cache: "cached",
    async run(interaction: ButtonInteraction) {
      try {
        if (interaction.deferred || interaction.replied) {
          console.error('Interaction has already been replied or deferred.');
          return;
        }
  
        if (!interaction.guild) {
          console.error('Guilda inexistente.');
          return;
        }
  
        const member: GuildMember = await interaction.guild.members.fetch(interaction.user);
        if (!member.roles.cache.has(TICKET_ROLE_ID ??"")) {
            await interaction.reply({ ephemeral: true, content: "Somente atendentes podem usar esse botão"});
            return;
        }
  
        // Criando um modal para receber o ID do membro a ser adicionado
        new Modal({
          customId: "addmember_modal",
          cache: "cached",
          isFromMessage: true,
          async run(interaction) {
              
          },
        });
  
        const modal = await interaction.showModal(new ModalBuilder({
          customId: "addmember_modal",
          title: "Adicionar membro ao ticket",
          components: [
              createModalInput({
                  customId: "input_idadd",
                  label: "ID do Discord do membro :",
                  placeholder: "Coloque o ID do membro",
                  style: TextInputStyle.Short,
                  minLength: 15,
                  maxLength: 20
              })
          ]
        }));
  
        const modalInteraction = await interaction.awaitModalSubmit({ time: 50_000, filter: (i) => i.user.id === interaction.user.id });
        if (!modalInteraction) return;
  
        const { fields } = modalInteraction;
        const memberId = fields.getTextInputValue("input_idadd");
  
        // Verifica se o canal atual é um canal de texto
        if (interaction.channel instanceof TextChannel) {
          // Adiciona o membro ao canal com base no ID fornecido
          const memberToAdd = await interaction.guild.members.fetch(memberId).catch(error => {
            console.error('Erro ao buscar o membro:', error);
            return null;
          });
          
          if (memberToAdd) {
            // Adiciona o membro ao canal de texto
            await interaction.channel.send(`<@${memberToAdd.id}> - foi Adicionado ao Ticket`);
          } else {
            console.error('Membro não encontrado.');
          }
        } else {
          console.error('Channel is not a text channel.');
        }
  
      } catch (error) {
        console.error('Error handling button interaction:', error);
      }
    },
  });