import { Component } from "@/discord/base";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

const BUTTON_IDS = {
  CLOSE: "close-ticket",
  CONFIRM_YES: "confirm-yes",
  CONFIRM_NO: "confirm-no",
};

new Component({
  customId: BUTTON_IDS.CLOSE,
  type: ComponentType.Button,
  cache: "cached",
  async run(interaction) {
    try {
      if (!interaction.guild) {
        console.error("Canal inexistente!");
        return;
      }

      if (interaction.member && "id" in interaction.member) {
        const memberId = interaction.member.id;

        const logEmbed = new EmbedBuilder({
          title:
            "Deseja realmente fechar o ticket?\nAo fechar o ticket não será gerado o transcript",
          thumbnail: {
            url: process.env.THUMBNAIL ?? "",
          },
          description:
            "Clique em um dos botões abaixo para confirmar sua escolha:",
          timestamp: new Date().toISOString(),
          footer: {
            text: "Sistema de ticket byRomeraSCR",
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
            }),
          ],
        });

        const message = await interaction.reply({
          content: "Essa é a resposta do botão",
          components: [actionRow],
          embeds: [logEmbed],
        });

        const collector = interaction.channel?.createMessageComponentCollector(
          { time: 15000 }
        );
        collector?.on("collect", async (interaction: ButtonInteraction) => {
          if (interaction.user.id === memberId) {
            if (interaction.customId === BUTTON_IDS.CONFIRM_YES) {
              closeTicket(interaction, memberId);
            } else if (interaction.customId === BUTTON_IDS.CONFIRM_NO) {
              await interaction.reply({
                content: "O fechamento do Ticket foi cancelado!",
              }).then(() => {
                if (message) message.delete().catch(console.error);
              }).catch(console.error);
            }
            collector.stop();
          }
        });

        collector?.on("end", async () => {
          if (message) {
            const components = [actionRow];
            await message.edit({ components }).catch(console.error);
          } else {
            console.error("A mensagem não existe mais.");
          }
        });
      } else {
        console.error("Interaction member is not a GuildMember.");
      }
    } catch (error) {
      console.error("Error in closing ticket:", error);
    }

    function closeTicket(
      interaction: ButtonInteraction,
      memberId: string
    ) {
      try {
        const channel = interaction.guild?.channels.cache.get(
          process.env.CANAL_LOG_TKT ?? ""
        ) as TextChannel;
        if (interaction.channel instanceof TextChannel && interaction.channel.name) {
          const logEmbed = new EmbedBuilder({
            title: `Ticket #${interaction.channel.name} Foi Fechado sem Transcript`,
            thumbnail: {
              url: process.env.THUMBNAIL ?? "",
            },
            description: `O Ticket foi fechado por <@${memberId}> **sem transcript.**`,
            timestamp: new Date().toISOString(),
            footer: {
              text: "Sistema de ticket byRomeraSCR",
            },
          });
          channel.send({ embeds: [logEmbed] }).catch(console.error);
        } else {
          console.error("Canal de log inexistente ou sem nome");
        }

        interaction.channel?.delete().catch(console.error);
      } catch (error) {
        console.error("Erro ao fechar ticket:", error);
      }
    }
  },
});
