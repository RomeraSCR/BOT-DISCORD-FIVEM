import { Command } from "@/discord/base";
import { settings } from "@/settings";
import { brBuilder, createRow, hexToRgb } from "@magicyan/discord";
import {
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

new Command({
  name: "ponto",
  description: "Abrir bate-ponto :byRomeraSCR",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const formattedDate = (date: Date) =>
      `${date.toLocaleDateString()} às ${date.toLocaleTimeString()}`;
    const user = interaction.user.toString();
    const entrada = formattedDate(new Date());
    let inicio: Date | null = new Date();
    let pausas: Date[] = [];
    let voltas: Date[] = [];
    let finish: Date | null = null;

    const createButtonsRow = () => {
      let primaryButton;
      let secondaryButton;
      
      if (pausas.length === 0) {
        primaryButton = new ButtonBuilder({
          customId: "button-finish",
          label: "Finalizar",
          style: ButtonStyle.Danger,
        });
        secondaryButton = new ButtonBuilder({
          customId: "button-pause",
          label: "Pausar",
          style: ButtonStyle.Secondary,
        });
      } else if (pausas.length > voltas.length) {
        primaryButton = new ButtonBuilder({
          customId: "button-finish",
          label: "Finalizar",
          style: ButtonStyle.Danger,
        });
        secondaryButton = new ButtonBuilder({
          customId: "button-return",
          label: "Voltar",
          style: ButtonStyle.Primary,
        });
      } else {
        primaryButton = new ButtonBuilder({
          customId: "button-finish",
          label: "Finalizar",
          style: ButtonStyle.Danger,
        });
        secondaryButton = new ButtonBuilder({
          customId: "button-pause",
          label: "Pausar",
          style: ButtonStyle.Secondary,
        });
      }
    
      return createRow(primaryButton, secondaryButton);
    };
    
    const embed = new EmbedBuilder({
      author: {
        name: "Sistema de Bate-Ponto⏱️",
        iconURL: "https://media.discordapp.net/attachments/1093336397252923470/1190034273143619694/RomeraSCR.png?ex=65a054c8&is=658ddfc8&hm=fb4508ffbd0e81e8a0b8b6ad05e2f1c77397595c00310103ce76e423e86cbe76&=&format=webp&quality=lossless",
      },
      description: `**Use o comando /para reabrir esse ponto**\n\n**Usuário:**\n${user}\n\n**Entrada:**\n${entrada}\n`,
      color: hexToRgb(settings.colors.theme.default),
      footer: {
        text: "Sistema de Bate-Ponto! byRomeraSCR",
        iconURL: "https://media.discordapp.net/attachments/1093336397252923470/1190034273143619694/RomeraSCR.png?ex=65a054c8&is=658ddfc8&hm=fb4508ffbd0e81e8a0b8b6ad05e2f1c77397595c00310103ce76e423e86cbe76&=&format=webp&quality=lossless",
      },
    });

    const message = await interaction.reply({
      ephemeral: false,
      fetchReply: true,
      embeds: [embed],
      components: [createButtonsRow()],
    });

    const collector = message.createMessageComponentCollector();

    let buttonsVisible = true;

    collector.on("collect", async (buttonInteraction) => {
      if (!buttonsVisible) return;

      const { customId } = buttonInteraction;

      switch (customId) {
        case "button-finish": {
          finish = new Date();

          if (inicio) {
            let totalTime = finish.getTime() - inicio.getTime();

            pausas.forEach((pausa) => {
              totalTime -= pausa.getTime();
            });

            voltas.forEach((volta) => {
              totalTime += volta.getTime();
            });

            const seconds = Math.floor(totalTime / 1000);
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;

            let pausesText = "";
            if (pausas.length > 0) {
              pausesText = "**Pausa:**";
              pausas.forEach((pausa) => {
                pausesText += `\n${formattedDate(pausa)}`;
              });
            }

            let voltasText = "";
            if (voltas.length > 0) {
              voltasText = "**Volta:**";
              voltas.forEach((volta) => {
                voltasText += `\n${formattedDate(volta)}`;
              });
            }

            await buttonInteraction.update({
              embeds: [
                new EmbedBuilder({
                  author: {
                    name: "Sistema de Bate-Ponto⏱️",
                    iconURL: "https://media.discordapp.net/attachments/1093336397252923470/1190034273143619694/RomeraSCR.png?ex=65a054c8&is=658ddfc8&hm=fb4508ffbd0e81e8a0b8b6ad05e2f1c77397595c00310103ce76e423e86cbe76&=&format=webp&quality=lossless",
                  },
                  description: `**Use o comando /para reabrir esse ponto**\n\n**Usuário:**\n${user}\n\n**Entrada:**\n${entrada}\n\n${pausesText ? `${pausesText}\n\n` : ""}${voltasText ? `${voltasText}\n\n` : ""}**Saida:**\n${formattedDate(finish)}\n------------------------------\n**Tempo total:**\n${hours} horas, ${minutes} minutos, ${remainingSeconds} segundos`,
                  color: hexToRgb(settings.colors.theme.default),
                  footer: {
                    text: "Sistema de Bate-Ponto! byRomeraSCR",
                    iconURL: "https://media.discordapp.net/attachments/1093336397252923470/1190034273143619694/RomeraSCR.png?ex=65a054c8&is=658ddfc8&hm=fb4508ffbd0e81e8a0b8b6ad05e2f1c77397595c00310103ce76e423e86cbe76&=&format=webp&quality=lossless",
                  },
                }),
              ],
              components: [],
            });

            buttonsVisible = false;
          }
          break;
        }

        case "button-pause": {
          pausas.push(new Date());
        
          let pausesText = "**Pausa:**";
          pausas.forEach((pausa) => {
            pausesText += `\n${formattedDate(pausa)}`;
          });
        
          let voltasText = "**Volta:**";
          voltas.forEach((volta) => {
            voltasText += `\n${formattedDate(volta)}`;
          });
        
          const row = createButtonsRow();
          await buttonInteraction.update({
            embeds: [
              new EmbedBuilder({
                author: {
                  name: "Sistema de Bate-Ponto⏱️",
                  iconURL: "https://media.discordapp.net/attachments/1093336397252923470/1190034273143619694/RomeraSCR.png?ex=65a054c8&is=658ddfc8&hm=fb4508ffbd0e81e8a0b8b6ad05e2f1c77397595c00310103ce76e423e86cbe76&=&format=webp&quality=lossless",
                },
                description: `**Use o comando /para reabrir esse ponto**\n\n**Usuário:**\n${user}\n\n**Entrada:**\n${entrada}\n\n${pausesText}\n\n${voltasText}\n\n`,
                color: hexToRgb(settings.colors.theme.default),
                footer: {
                  text: "Sistema de Bate-Ponto! byRomeraSCR",
                  iconURL: "https://media.discordapp.net/attachments/1093336397252923470/1190034273143619694/RomeraSCR.png?ex=65a054c8&is=658ddfc8&hm=fb4508ffbd0e81e8a0b8b6ad05e2f1c77397595c00310103ce76e423e86cbe76&=&format=webp&quality=lossless",
                },
              }),
            ],
            components: [row],
          });
        
          break;
        }
        
        case "button-return": {
          voltas.push(new Date());
        
          let pausesText = "**Pausa:**";
          pausas.forEach((pausa) => {
            pausesText += `\n${formattedDate(pausa)}`;
          });
        
          let voltasText = "**Volta:**";
          voltas.forEach((volta) => {
            voltasText += `\n${formattedDate(volta)}`;
          });
        
          const row = createButtonsRow();
          await buttonInteraction.update({
            embeds: [
              new EmbedBuilder({
                author: {
                  name: "Sistema de Bate-Ponto⏱️",
                  iconURL: "https://media.discordapp.net/attachments/1093336397252923470/1190034273143619694/RomeraSCR.png?ex=65a054c8&is=658ddfc8&hm=fb4508ffbd0e81e8a0b8b6ad05e2f1c77397595c00310103ce76e423e86cbe76&=&format=webp&quality=lossless",
                },
                description: `**Use o comando /para reabrir esse ponto**\n\n**Usuário:**\n${user}\n\n**Entrada:**\n${entrada}\n\n${pausesText}\n\n${voltasText}\n\n`,
                color: hexToRgb(settings.colors.theme.default),
                footer: {
                  text: "Sistema de Bate-Ponto! byRomeraSCR",
                  iconURL: "https://media.discordapp.net/attachments/1093336397252923470/1190034273143619694/RomeraSCR.png?ex=65a054c8&is=658ddfc8&hm=fb4508ffbd0e81e8a0b8b6ad05e2f1c77397595c00310103ce76e423e86cbe76&=&format=webp&quality=lossless",
                },
              }),
            ],
            components: [row],
          });
        
          break;
        }
      }
    });
  },
});


