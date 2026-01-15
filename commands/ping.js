const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Check bot latency and response time',
    aliases: ['pong', 'latency'],
    async execute(message, args, db, config) {
        const start = Date.now();
        const sent = await message.reply('🏓 Pinging...');
        
        const botLatency = Date.now() - start;
        const apiLatency = Math.round(message.client.ws.ping);
        
        // Color based on latency quality
        let color = '#2ecc71'; // Green - excellent
        if (apiLatency > 200) color = '#f39c12'; // Orange - good
        if (apiLatency > 400) color = '#e74c3c'; // Red - poor
        
        // Status indicators
        const getStatusEmoji = (ms) => {
            if (ms < 100) return '🟢 Excellent';
            if (ms < 200) return '🟡 Good';
            if (ms < 400) return '🟠 Fair';
            return '🔴 Poor';
        };

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🏓 Pong!')
            .setDescription('Bot latency and connection status')
            .addFields(
                { name: '⏱️ Bot Latency', value: `\`${botLatency}ms\``, inline: true },
                { name: '💓 API Latency', value: `\`${apiLatency}ms\``, inline: true },
                { name: '📶 Status', value: getStatusEmoji(apiLatency), inline: true },
                { name: '🤖 Uptime', value: formatUptime(process.uptime()), inline: true },
                { name: '📊 Servers', value: `${message.client.guilds.cache.size}`, inline: true },
                { name: '👥 Users', value: `${message.client.users.cache.size}`, inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await sent.edit({ content: null, embeds: [embed] });
    }
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds / 3600) % 24;
    const mins = Math.floor(seconds / 60) % 60;
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}
