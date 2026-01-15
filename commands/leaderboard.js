const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'View the server leaderboard',
    aliases: ['lb', 'top'],
    async execute(message, args, db, config) {
        const type = args[0]?.toLowerCase() === 'money' ? 'balance' : 'level';
        const leaderboard = db.getLeaderboard(message.guild.id, type, 10);

        if (leaderboard.length === 0) {
            return message.reply('No users found on the leaderboard!');
        }

        const title = type === 'balance' ? '💰 Richest Players' : '⭐ Top Levels';
        const embed = new EmbedBuilder()
            .setColor(type === 'balance' ? '#2ecc71' : '#9b59b6')
            .setTitle(`🏆 ${title}`)
            .setDescription(`Top 10 in **${message.guild.name}**`)
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setImage((config.images && config.images.leaderboardBannerUrl) || null)
            .setTimestamp();

        const medals = ['🥇', '🥈', '🥉'];
        
        for (let i = 0; i < leaderboard.length; i++) {
            const userData = leaderboard[i];
            try {
                const user = await message.client.users.fetch(userData.userId);
                const medal = medals[i] || `**${i + 1}.**`;
                
                const balanceText = `${config.currency.symbol} ${Number(userData.balance).toLocaleString()} ${config.currency.name}`;
                const levelText = `⭐ Level ${userData.level} • ${Number(userData.xp).toLocaleString()} XP`;
                const value = type === 'balance' ? `${balanceText} • ${levelText}` : `${levelText} • ${balanceText}`;
                embed.addFields({
                    name: `${medal} ${user.username}`,
                    value,
                    inline: false
                });
            } catch (error) {
                console.error(`Failed to fetch user ${userData.userId}`);
            }
        }

        message.reply({ embeds: [embed] });
    }
};
