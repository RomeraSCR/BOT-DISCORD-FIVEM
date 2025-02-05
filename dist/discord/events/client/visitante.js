"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_1 = require("@/discord/base");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
new base_1.Event({
    name: "guildMemberAdd",
    run: async (member) => {
        try {
            await member.roles.add(process.env.CARGO_VISITANTE ?? "");
        }
        catch (error) {
            console.error('Erro ao adicionar cargo de visitante:', error);
        }
    }
});
new base_1.Event({
    name: "ready",
    run: async (client) => {
        try {
            const visitorRole = client.guilds.cache.first()?.roles.cache.get(process.env.CARGO_VISITANTE ?? "");
            if (!visitorRole) {
                console.error('Cargo de visitante não encontrado.');
                return;
            }
            client.guilds.cache.forEach(guild => {
                guild.members.cache.forEach(async (member) => {
                    if (member.roles.cache.size === 1) {
                        try {
                            await member.roles.add(visitorRole);
                            console.log(`Cargo de visitante atribuído a ${member.user.tag}`);
                        }
                        catch (error) {
                            console.error(`Erro ao adicionar cargo de visitante a ${member.user.tag}:`, error);
                        }
                    }
                });
            });
        }
        catch (error) {
            console.error('Erro ao atribuir cargo de visitante aos membros sem cargo:', error);
        }
    }
});
