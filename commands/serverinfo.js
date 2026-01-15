const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'View server information and settings',
    aliases: ['server', 'guildinfo'],
    execute(message, args, db, config) {
        const guild = message.guild;
        const guildSettings = db.getGuildSettings(guild.id);
        
        const welcomeChannel = guildSettings.welcomeChannelId 
            ? `<#${guildSettings.welcomeChannelId}>` 
            : 'Not configured';

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle(`📋 ${guild.name} Information`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '\u200b', value: '**Bot Configuration**', inline: false },
                { name: '🎉 Welcome Channel', value: welcomeChannel, inline: true },
                { name: '✅ Welcomes Enabled', value: guildSettings.welcomeEnabled ? 'Yes' : 'No', inline: true },
                { name: '⚡ Prefix', value: `\`${guildSettings.prefix || config.prefix}\``, inline: true },
                { name: '📊 Level Messages', value: guildSettings.levelUpMessages ? 'Enabled' : 'Disabled', inline: true }
            )
            .setFooter({ text: `Server ID: ${guild.id} • created by VadikGoel (aka VYPER GAMER)` })
            .setTimestamp();

        if (guild.banner) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        message.reply({ embeds: [embed] });
    }
};
