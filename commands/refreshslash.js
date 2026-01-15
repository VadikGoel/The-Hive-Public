const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { registerSlashCommands } = require('../slashRegistrar');
const config = require('../config.json');

module.exports = {
    name: 'refreshslash',
    description: 'Force refresh all slash commands (owner/admin only)',
    aliases: ['refreshslashes','reloadslash','reloadslashes'],
    async execute(message, args) {
        // Owner-only command
        const isOwner = (config.ownerIds || []).includes(message.author.id);
        if (!isOwner) {
            return message.reply('❌ This command is restricted to the bot owner only.');
        }

        const scope = (args[0] || '').toLowerCase();
        const guildScope = scope === 'guild' ? message.guild.id : undefined;

        try {
            // First, clear all existing commands to force Discord to update
            const { REST, Routes } = require('discord.js');
            const rest = new REST({ version: '10' }).setToken(config.token);
            
            if (guildScope) {
                await rest.put(Routes.applicationGuildCommands(config.clientId, guildScope), { body: [] });
                await message.reply('🔄 Clearing old commands...');
                // Wait a bit for Discord to process
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
                await message.reply('🔄 Clearing old commands...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Now register fresh commands
            const result = await registerSlashCommands({ clientId: config.clientId, token: config.token, guildId: guildScope });
            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Slash Commands Refreshed')
                .setDescription(`Cleared old commands and registered ${result.count} fresh commands in ${result.scope} scope.\n\n**Wait 10-30 seconds for Discord to update!**`)
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ Failed to Refresh Slash Commands')
                .setDescription(`${err?.message || err}`)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }
    }
};
