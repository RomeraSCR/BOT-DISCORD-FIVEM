import { Event } from "@/discord/base";
import { Client, GuildMember, Role } from "discord.js";
import dotenv from 'dotenv';
dotenv.config();

new Event({
    name: "guildMemberAdd",
    run: async (member: GuildMember) => {
        try {
            await member.roles.add(process.env.CARGO_VISITANTE??"");
        } catch (error) {
            console.error('Erro ao adicionar cargo de visitante:', error);
        }
    }
});

new Event({
    name: "ready",
    run: async (client: Client) => {
        try {
            const visitorRole = client.guilds.cache.first()?.roles.cache.get( process.env.CARGO_VISITANTE??"") as Role;
            if (!visitorRole) {
                console.error('Cargo de visitante não encontrado.');
                return;
            }

            client.guilds.cache.forEach(guild => {
                guild.members.cache.forEach(async member => {
                    if (member.roles.cache.size === 1) { 
                        try {
                            await member.roles.add(visitorRole);
                            console.log(`Cargo de visitante atribuído a ${member.user.tag}`);
                        } catch (error) {
                            console.error(`Erro ao adicionar cargo de visitante a ${member.user.tag}:`, error);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao atribuir cargo de visitante aos membros sem cargo:', error);
        }
    }
});
