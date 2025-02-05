import { Component } from "@/discord/base";
import { settings } from "@/settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ButtonInteraction, ComponentType, EmbedBuilder, GuildMember, StringSelectMenuBuilder, TextBasedChannel, TextChannel } from "discord.js";

const BUTTON_IDS = { POKAR: "pokar-ticket" };

new Component({
  customId: BUTTON_IDS.POKAR,
  type: ComponentType.Button,
  cache: "cached",
  async run(interaction: ButtonInteraction) {
    try {
      const { user, channel } = interaction;
      
      // Verificar se interaction.guild e channel são nulos
      if (!interaction.guild || !channel) {
        console.error('Guilda ou canal inexistente!');
        return;
      }

      const member: GuildMember = await interaction.guild.members.fetch(interaction.user);
      if (!member.roles.cache.has(process.env.CARGO_STAFF ??"")) {
          await interaction.reply({ ephemeral: true, content: "Somente atendentes podem usar esse botão"});
          return;
      }

      const members = (channel as TextChannel)?.members;
      if (!members) {
        console.error('Não foi possível obter os membros do canal.');
        return;
      }

      const embed = new EmbedBuilder({
        title: "Sistema de Alertar Membro",
        description: "Selecione o Membro a ser alertado",
        color: hexToRgb(settings.colors.theme.default),
        footer: {
          text: "Lembre-se não use sem necessidade",
        },
        thumbnail: {
          url: process.env.THUMBNAIL ?? ""
        },
      });

      // Construir o menu suspenso com opções dos membros do canal
      const selectMenuOptions = members.map(member => ({
        label: member.displayName,
        value: member.id,
        description: "Alertar Membro de ticket aberto",
        emoji: "⚠️",
      }));

      const row = createRow(
        new StringSelectMenuBuilder({
          customId: "selecao-pokar",
          placeholder: "Selecione um player para notificar",
          options: selectMenuOptions,
        })
      );

      const message = await channel.send({ embeds: [embed], components: [row], ephemeral: false } as any);

      interaction.reply({ ephemeral: true, content: ""});

      interaction.client.on("interactionCreate", async (interaction) => {
        if (!interaction.isSelectMenu()) return;
        
        if (interaction.customId === "selecao-pokar") {
          const selectedMemberId = interaction.values[0];
          const selectedMember = await interaction.guild?.members.fetch(selectedMemberId);

          // Construir a embed de aviso
          const embed = new EmbedBuilder({
            title: "Alerta de Ticket Aberto",
            description: "Você está sendo notificado em um ticket\nFavor acessar o discord para ser tratado!",
            color: hexToRgb(settings.colors.theme.default),
            footer: {
              text: "byRomeraSCR",
            },
            thumbnail: {
              url: process.env.THUMBNAIL ?? ""
            },
          });

          // Enviar a embed de aviso para o membro selecionado
          await selectedMember?.send({ embeds: [embed] });

          await message.delete();

          await interaction.reply({ content: 'Alerta enviado para o membro selecionado.', ephemeral: true });
        }
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem direta:", error);
    }
  }
});
