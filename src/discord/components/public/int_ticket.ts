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

new Component({
  customId: "selecao-tickets",
  type: ComponentType.StringSelect,
  cache: "cached",
  async run(interaction) {
    try {
      const { values: [option], member, guild } = interaction;
      const channel = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && c.topic === member.id
      );

      if (channel) {
        reply.warning({
          interaction,
          text: `Você já possui um ticket em aberto ${channel}`,
        });

        setTimeout(() => {
          interaction.deleteReply();
        }, 6000);

        return;
      }

      const channelCreated = await guild.channels.create({
        name: `${TICKET_CATEGORIES[option as keyof typeof TICKET_CATEGORIES]}-${member.displayName}`,
        topic: member.id,
        type: ChannelType.GuildText,
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
            id: process.env.CARGO_STAFF ??"",
            allow: [
              "ViewChannel",
              "SendMessages",
              "AttachFiles",
              "ReadMessageHistory",
            ],
          },
          {
            id: process.env.CARGO_TICKET ??"",
            allow: [
              "ViewChannel",
              "SendMessages",
              "AttachFiles",
              "ReadMessageHistory",
            ],
          },
        ],
      });
      

      reply.success({
        interaction,
        text: `Seu ticket foi aberto com sucesso ${channelCreated}`,
      });

      setTimeout(() => {
        interaction.deleteReply();
      }, 6000);

      const embed = new EmbedBuilder({
        title: "Ticket Criado com Sucesso!",
        description:
          "Todos os responsáveis pelo ticket já estão cientes da abertura\nEvite chamar alguém via DM, basta aguardar alguém já irá lhe\natender...",
        thumbnail: {
          url: interaction.user.displayAvatarURL() ?? process.env.THUMBNAIL,
        },
        color: hexToRgb(settings.colors.theme.default),
        fields: [
          {
            name: "> __**Categoria Escolhida:**__",
            value: `**\`\`\`${TICKET_CATEGORIES[option as keyof typeof TICKET_CATEGORIES]}\n\`\`\`**`,
            inline: true,
          },
        ],
      });

      const row = new ActionRowBuilder<ButtonBuilder>({
        components: [
          new ButtonBuilder({
            customId: BUTTON_IDS.CLOSE,
            label: "Sair ou Cancelar",
            style: ButtonStyle.Danger,
          }),
          new ButtonBuilder({
            customId: BUTTON_IDS.POKAR,
            label: "Pokar Membro",
            style: ButtonStyle.Secondary,
          }),
          new ButtonBuilder({
            customId: BUTTON_IDS.ADD_MEMBER,
            label: "Adicionar Membro",
            style: ButtonStyle.Secondary,
          }),
          new ButtonBuilder({
            customId: BUTTON_IDS.REMOVE_MEMBER,
            label: "Remover Membro",
            style: ButtonStyle.Secondary,
          }),
          new ButtonBuilder({
            customId: BUTTON_IDS.FINALIZE,
            label: "Finalizar Ticket",
            style: ButtonStyle.Success,
          }),
        ],
      });

      channelCreated.send({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error("Error in ticket creation:", error);
    }
  },
});