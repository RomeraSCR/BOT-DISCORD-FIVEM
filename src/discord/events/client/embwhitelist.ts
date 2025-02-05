import { Event,} from "@/discord/base";
import { Client, TextChannel, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, } from "discord.js";
import dotenv from 'dotenv';
dotenv.config();

new Event({
  name: "ready",
  async run(client: Client) {
    if (!process.env.CANAL_WHITELIST) {
      console.error('O ID DO CANAL WL NÃO FOI DEFINIDO OU ESTÁ INCORRETO!');
      return;
    }

    try {
      const channel = await client.channels.fetch(process.env.CANAL_WHITELIST);

      if (channel instanceof TextChannel) {
        await sendConnectMessage(channel, client);

        client.on("messageDelete", async (deletedMessage) => {
          if (deletedMessage.id === process.env.CANAL_WHITELIST) {
            await sendConnectMessage(channel, client);
          }
        });
      } 
    } catch (error) {
      console.error('DESCRIÇÃO DE ERRO CANAL:', error);
    }
  }
});

async function sendConnectMessage(channel: TextChannel, client: Client) {
    await channel.bulkDelete(10, true);
 
    try {
    const embed = new EmbedBuilder({
      title: (process.env.TITULOWL),
      thumbnail: {
        url: process.env.THUMBNAIL ?? ""
      },
      image: {
        url: process.env.BANNERWL ?? "",
    },
      description: "Sistema de whitelist exclusivo! \n \n Para fazer sua whitelist clique no botão:",
      timestamp: new Date().toISOString(),
      footer: {
        text: "Sistema de whitelist byRomeraSCR"
      },
    });

    const row = new ActionRowBuilder<ButtonBuilder>({ components: [
      new ButtonBuilder({
        customId: "btn_registrar",
        emoji: "✅",
        label: "Registrar-se",
        style: ButtonStyle.Success
      })
    ]});

    await channel.send({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('DESCRIÇÃO DE ERRO MENSAGEM:', error);
  }
}
