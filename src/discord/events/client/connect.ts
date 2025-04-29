import { Event } from "@/discord/base";
import { Client, EmbedBuilder, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import dotenv from 'dotenv';
const FiveM = require("fivem-server-api");
dotenv.config();

const server = new FiveM.Server(process.env.IP_SERVIDOR);

interface ServerStatus {
    status: string;
    players: string;
}

new Event({
    name: "ready",
    async run(client: Client) {
        if (!process.env.CANAL_CONNECTID) {
            console.error('Channel ID not provided in the environment variable.');
            return;
        }

        try {
            const channel = await client.channels.fetch(process.env.CANAL_CONNECTID);

            if (channel instanceof TextChannel) {
                await sendConnectMessage(channel);

                client.on("messageDelete", async (deletedMessage) => {
                    if (deletedMessage.id === process.env.CANAL_CONNECTID) {
                        await sendConnectMessage(channel);
                    }
                });

                setInterval(async () => {
                    await sendConnectMessage(channel);
                }, 100000);
            } else {
                console.error('Channel does not exist');
            }
        } catch (error) {
            console.error('Error fetching channel:', error);
        }
    }
});

async function sendConnectMessage(channel: TextChannel) {
    try {
        await channel.bulkDelete(10, true);
    } catch (error) {
        console.error('Error deleting messages:', error);
    }

    try {
        const timeoutPromise: Promise<ServerStatus> = new Promise((resolve) => {
            setTimeout(() => resolve({ status: "🔴Offline", players: "[0/0]" }), 3000); // Defina o tempo limite para 5 segundos
        });

        const serverStatus: ServerStatus = await Promise.race([checkServerConnection(), timeoutPromise]);

        let embed = new EmbedBuilder({
            title: process.env.TITULO,
            thumbnail: {
                url: process.env.THUMBNAIL ?? "Link not provided"
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: "Atualizado a cada 2 minutos | Ultima atualização"
            },
            image: {
                url: process.env.LOGO ?? "Link not provided",
            },
            fields: [
                {
                    name: "> __**Status:**__",
                    value: `**\`\`\`yaml\n${serverStatus.status}\`\`\`**`,
                    inline: true
                },
                {
                    name: "> __**Players:**__",
                    value: `**\`\`\`ini\n${serverStatus.players}\`\`\`**`,
                    inline: true
                },
                {
                    name: "> __**IP FiveM:**__",
                    value: `**\`\`\`fix\n${process.env.IP_SERVER ?? "Not defined"}\`\`\`**`
                }
            ]
        });

        const row = new ActionRowBuilder<ButtonBuilder>({ components: [
            new ButtonBuilder({
                url: process.env.FIVEMURL,
                label: "Conectar-se",
                style: ButtonStyle.Link,
                emoji: "<:icons8meuscinco48:1366072726732935300>"
            }),
            new ButtonBuilder({
                url: process.env.LOJAURL,
                label: "Acesse a Loja",
                style: ButtonStyle.Link,
                emoji: "<:icons8loja40:1366072744864911412>"
            }),
            new ButtonBuilder({
                url: process.env.TIKTOKURL,
                label: "TikTok",
                style: ButtonStyle.Link,
                emoji: "<:icons8tiktok50:1366072758349598782>"
            }),
        ]});

        
        await channel.send({ embeds: [embed], components: [row] });
    } catch (error) {
        console.error('Error sending message:', error);
    }
}


async function checkServerConnection(): Promise<ServerStatus> {
    try {
        const isConnected = await server.getServerStatus();

        let playersInfo = "Error Occured";
        if (isConnected) {
            const players = await server.getPlayers();
            if (players !== "Error Occured") {
                const maxPlayers = await server.getMaxPlayers();
                playersInfo = `[${players}/${maxPlayers}]`;
            } else {
                playersInfo = "[0/0]";
            }
        }

        const status = playersInfo === "[0/0]" ? "Offline" : isConnected ? "🟢Online" : "🔴Offline";
        return { status, players: playersInfo };
    } catch (error) {
        console.error('Error checking server connection:', error);
        return { status: "🔴Offline", players: "[0/0]" };
    }
}
