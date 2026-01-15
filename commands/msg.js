const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'msg',
    description: 'Check message count stats',
    aliases: ['messages', 'msgstats'],
    execute(message, args, db, config) {
        // Get target user (mentioned user or command author)
        const target = message.mentions?.users?.first() || message.slashOptions?.user || message.author;
        const user = db.getUser(target.id, message.guild.id);

        if (!user) {
            return message.reply(`${target.username} hasn't been tracked yet!`);
        }

        const totalMessages = user.totalMessages || 0;
        const level = user.level || 1;
        const xp = user.xp || 0;
        const xpNeeded = db.calculateXPNeeded(level);

        // Calculate messages per day (estimate)
        const messagesPerDay = Math.floor(totalMessages / Math.max(1, level));

        // Get rank
        const leaderboard = db.getLeaderboard(message.guild.id, 'level', 100);
        const rank = leaderboard.findIndex(u => u.userId === target.id) + 1;

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('💬 Message Stats')
            .setDescription(`Message statistics for ${target.username}`)
            .addFields(
                { name: '📨 Total Messages', value: totalMessages.toLocaleString(), inline: true },
                { name: '📊 Level', value: `${level}`, inline: true },
                { name: '🏆 Server Rank', value: rank > 0 ? `#${rank}` : 'Unranked', inline: true },
                { name: '⭐ XP', value: `${xp} / ${xpNeeded}`, inline: true },
                { name: '📈 Daily Average', value: `~${messagesPerDay} msgs/day`, inline: true },
                { name: '💪 Activity', value: totalMessages > 1000 ? 'Very Active 🔥' : totalMessages > 500 ? 'Active ✨' : 'Growing 🌱', inline: true }
            )
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `${target.username} • ${message.guild.name} • created by VadikGoel (aka VYPER GAMER)`, iconURL: target.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
