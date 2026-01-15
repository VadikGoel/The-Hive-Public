const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'stats',
    description: 'View bot statistics',
    aliases: ['botinfo', 'info'],
    execute(message, args, db, config) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('📊 Bot Statistics')
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(
                { name: '🖥️ Servers', value: `${message.client.guilds.cache.size}`, inline: true },
                { name: '👥 Users', value: `${message.client.users.cache.size}`, inline: true },
                { name: '📝 Commands', value: `${message.client.commands.size}`, inline: true },
                { name: '⏰ Uptime', value: uptimeString, inline: true },
                { name: '💾 Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
                { name: '🏓 Ping', value: `${Math.round(message.client.ws.ping)}ms`, inline: true },
                { name: '💰 Currency', value: `${config.currency.name} ${config.currency.symbol}`, inline: true },
                { name: '⭐ XP Per Message', value: `${config.leveling.xpPerMessage}+`, inline: true },
                { name: '🎁 Coins Per Level', value: `${config.leveling.coinsPerLevel}x`, inline: true }
            )
            .setFooter({ text: `Bot created for ${message.guild.name} • created by VadikGoel (aka VYPER GAMER)` })
            .setTimestamp();

        if (config.images?.statsBannerUrl) {
            embed.setImage(config.images.statsBannerUrl);
        }

        message.reply({ embeds: [embed] });
    }
};
