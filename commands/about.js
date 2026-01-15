const { EmbedBuilder, version: djsVersion } = require('discord.js');

module.exports = {
    name: 'about',
    description: 'Learn about the bot and its features',
    aliases: ['info', 'botinfo'],
    async execute(message, args, db, config) {
        const client = message.client;
        
        // Calculate stats
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const totalCommands = client.commands.size;
        
        // Calculate memory usage
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        
        // Uptime
        const uptime = formatUptime(process.uptime());
        
        // Owner info
        const ownerIds = config.ownerIds || [];
        const ownerMentions = ownerIds.map(id => `<@${id}>`).join(', ') || 'Unknown';
        
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setAuthor({ 
                name: `${client.user.username} - Bot Information`, 
                iconURL: client.user.displayAvatarURL({ size: 256 })
            })
            .setThumbnail(client.user.displayAvatarURL({ size: 512 }))
            .setDescription(`**${client.user.username}** is a feature-rich Discord bot with economy, leveling, casino games, counting system, and more!`)
            .addFields(
                { name: '👑 Owner', value: ownerMentions, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '⏰ Uptime', value: uptime, inline: true },
                { name: '📊 Servers', value: `${totalGuilds}`, inline: true },
                { name: '👥 Users', value: `${totalUsers.toLocaleString()}`, inline: true },
                { name: '📝 Channels', value: `${totalChannels}`, inline: true },
                { name: '⚙️ Commands', value: `${totalCommands}`, inline: true },
                { name: '💾 Memory', value: `${memoryUsage} MB`, inline: true },
                { name: '🔧 Prefix', value: `\`${config.prefix}\``, inline: true },
                { name: '\u200b', value: '\u200b', inline: false },
                { 
                    name: '✨ Features', 
                    value: '```\n• 💰 Advanced Economy System\n• ⭐ Leveling & XP\n• 🎰 Casino & Games (15+ games)\n• 🔢 Counting Channel\n• 📌 Sticky Notes\n• 🛍️ Shop with Boosters\n• 🏆 Leaderboards\n• 🎨 Customizable Welcome\n• 📊 Statistics Tracking```',
                    inline: false 
                },
                { 
                    name: '🛠️ Tech Stack', 
                    value: `\`\`\`\n• Node.js ${process.version}\n• Discord.js v${djsVersion}\n• SQLite Database\n• 57 Slash Commands\`\`\``,
                    inline: false 
                }
            )
            .setImage((config.images && config.images.aboutBannerUrl) || null)
            .setFooter({ 
                text: `Requested by ${message.author.tag} | ${client.user.username} • created by VadikGoel (aka VYPER GAMER)`, 
                iconURL: message.author.displayAvatarURL() 
            })
            .setTimestamp();

        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds / 3600) % 24;
    const mins = Math.floor(seconds / 60) % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    
    return parts.join(' ') || '< 1m';
}
