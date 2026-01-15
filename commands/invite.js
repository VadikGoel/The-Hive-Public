const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'invite',
    description: 'Get the bot invite link',
    aliases: ['inv', 'add'],
    execute(message, args, db, config) {
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot`;
        const supportServer = 'https://discord.gg/RHeQFcsGCx'; // Replace with actual support server

        const embed = new EmbedBuilder()
            .setColor('#FF6B9D')
            .setTitle('🎉 Invite Me to Your Server!')
            .setDescription(`Thank you for using **${message.client.user.username}**! 💖\n\n**Features I offer:**\n🎮 Economy System with Bank\n⭐ Leveling & XP System\n🎰 Casino Games\n🎲 Fun Commands\n📊 Leaderboards\n⚙️ Per-Server Configuration`)
            .addFields(
                { name: '📊 Bot Statistics', value: `**Servers:** ${message.client.guilds.cache.size}\n**Users:** ${message.client.users.cache.size}\n**Uptime:** ${formatUptime(message.client.uptime)}`, inline: true },
                { name: '🔧 Information', value: `**Prefix:** \`${db.getGuildSettings(message.guild.id).prefix || config.prefix}\`\n**Version:** 1.0.0\n**Library:** discord.js v14`, inline: true }
            )
            .setThumbnail(message.client.user.displayAvatarURL({ size: 512 }))
            .setImage('https://media.discordapp.net/attachments/1459907365750182095/1460314833344925809/wmremove-transformed_23.jpeg?ex=696677ab&is=6965262b&hm=7c181105cff3c2f0603ba3f81092ab55ff2323bc304313edc2bca5d863eba037&=&format=webp&width=688&height=291')
            .setFooter({ text: `Requested by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📨 Invite Bot')
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteLink),
                new ButtonBuilder()
                    .setLabel('🔗 Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL(supportServer),
                new ButtonBuilder()
                    .setLabel('⭐ Vote')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://top.gg/') // Replace with actual vote link
            );

        message.reply({ embeds: [embed], components: [row] });
    }
};

function formatUptime(uptime) {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(' ') || '0m';
}
