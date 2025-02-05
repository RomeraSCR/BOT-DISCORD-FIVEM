import { Component, Modal } from "@/discord/base";
import { reply } from "@/functions";
import { settings } from "@/settings";
import { brBuilder, createModalInput, hexToRgb, toNull } from "@magicyan/discord";
import { createTranscript } from "discord-html-transcripts";
import { Storage } from '@google-cloud/storage';
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


const BUTTON_IDS = { 
  FINALIZE: "finalizar-ticket",
  TRANSCRIPT: "acessar-transcrip",
  CONFIRM_YES: "confirm-yes",
  CONFIRM_NO: "confirm-no"
}

new Component({
  customId: BUTTON_IDS.FINALIZE,
  type: ComponentType.Button,
  cache: "cached",
  async run(interaction) {
    try {
  
      if (!interaction.guild) {
        console.error('Canal inexistente!');
        return;
      }

      const member: GuildMember = await interaction.guild.members.fetch(interaction.user);
      if (!member.roles.cache.has(process.env.CARGO_STAFF ??"")) {
          await interaction.reply({ ephemeral: true, content: "Somente atendentes podem usar esse botão"});
          return;
      }

      if (interaction.member && 'id' in interaction.member) {
        const memberId = interaction.member.id;

        const logEmbed = new EmbedBuilder({
          title:('Deseja Finalizar o ticket?\nAo fechar o ticket será gerado o transcript'),
          thumbnail: {
            url: process.env.THUMBNAIL ?? ""
          },
          description: "Clique em um dos botões abaixo para confirmar sua escolha:",
          timestamp: new Date().toISOString(),
          footer: {
            text: "Sistema de ticket byRomeraSCR"
          },
        });
        
        const actionRow = new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              customId: BUTTON_IDS.CONFIRM_YES,
              label: "Sim",
              style: ButtonStyle.Success,
            }),
            new ButtonBuilder({
              customId: BUTTON_IDS.CONFIRM_NO,
              label: "Não",
              style: ButtonStyle.Danger,
            })
          ],
        });

        const message = await interaction.reply({
          content: "byRomeraSCR - Cancelar ticketc",
          components: [actionRow],
          embeds: [logEmbed],
        });
       
        const collector = interaction.channel?.createMessageComponentCollector({ time: 15000 });
        collector?.on('collect', async (interaction: ButtonInteraction) => {
          if (interaction.user.id === memberId) {
            if (interaction.customId === BUTTON_IDS.CONFIRM_YES) {
              const transcript = await createTranscript(interaction.channel as TextChannel);
              await logChannel.send({ files: [transcript] });
              closeTicket(interaction);
            } else if (interaction.customId === BUTTON_IDS.CONFIRM_NO) {
              await interaction.followUp({ content: "A Finalização do Ticket foi cancelado!" });
            }
            collector.stop();
          }
        });

        collector?.on('end', async () => {
          if (message) {
            const components = [actionRow];
            await message.edit({ components }).catch(console.error);
          } else {
            console.error('A mensagem ou o canal não existem mais.');
          }
        });

      } 

      const logChannelId = process.env.CANAL_TRANSCRIPT ?? ""; 
      const logChannel = interaction.guild.channels.cache.get(logChannelId) as TextChannel;
      if (!logChannel) {
        console.error('Canal de log inexistente!');
        return;
      }
    } catch (error) {
      console.error("Erro ao finalizar o ticket:", error);
    }
  }
});

function closeTicket(interaction: ButtonInteraction) {
  try {
    const channel = interaction.guild?.channels.cache.get(process.env.CANAL_LOG_TKT ?? "") as TextChannel;
    if (interaction.channel instanceof TextChannel && interaction.channel.name) {
      const logEmbed = new EmbedBuilder({
        title:(`Ticket  #${interaction.channel?.name}  Fechado com Transcript`),
        thumbnail: {
          url: process.env.THUMBNAIL ?? ""
        },
        description: `O Ticket foi fechado por <@${interaction.user.id}> **com transcript.**\nPara acessar o Transcript basta clicar no botão!`,
        timestamp: new Date().toISOString(),
        footer: {
          text: "Sistema de ticket byRomeraSCR"
        },
      });

      const actionRow = new ActionRowBuilder<ButtonBuilder>({
        components: [
          new ButtonBuilder({
            url: "https://firebasestorage.googleapis.com/v0/b/botdiscord-b5ce0.appspot.com/o/transcripts%2Ftranscript-1229933863019741316.html?alt=media&token=327919f5-653a-4ce6-b6da-997aa9cb3497",
            label: "Acessar Transcript",
            emoji: "🌐", 
            style: ButtonStyle.Link,
          })
        ],
      });

      channel.send({ embeds: [logEmbed], components: [actionRow] }).catch(console.error);
    } else {
      console.error('Canal de log inexistente');
    }
    interaction.channel?.delete().catch(console.error);
  } catch (error) {
    console.error("Erro ao fechar ticket:", error);
  }
}