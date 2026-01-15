const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rank',
    description: 'Check your rank and level',
    aliases: ['level', 'lvl', 'profile'],
    execute(message, args, db, config) {
        const target = message.mentions.users.first() || message.author;
        const user = db.createUser(target.id, message.guild.id);
        const rank = db.getUserRank(target.id, message.guild.id);
        const xpNeeded = db.calculateXPNeeded(user.level);
        const xpProgress = ((user.xp / xpNeeded) * 100).toFixed(1);
        const total = user.balance + (user.bank || 0);

        const progressBar = createProgressBar(user.xp, xpNeeded, 15);
        const levelBar = createLevelIndicator(user.level);

        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        const embed = new EmbedBuilder()
            .setColor('#FF6B9D')
            .setAuthor({ name: `${target.username}'s Profile Card`, iconURL: target.displayAvatarURL({ dynamic: true }) })
            .setTitle('━━━━━━━━━━━━━━━━━━━━━━')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription(user.bio ? `> *"${user.bio}"*` : `> *No bio set. Use \`${prefix}setbio\` to add one!*`)
            .addFields(
                { name: '🏆 Server Rank', value: `\`\`\`#${rank}\`\`\``, inline: true },
                { name: `⭐ Level ${user.level}`, value: `\`\`\`${levelBar}\`\`\``, inline: true },
                { name: '💎 Net Worth', value: `\`\`\`${total.toLocaleString()}\`\`\``, inline: true },
                { name: '📈 XP Progress', value: `${progressBar}\n\`${user.xp.toLocaleString()}/${xpNeeded.toLocaleString()}\` **(${xpProgress}%)**`, inline: false },
                { name: '💰 Wallet', value: `\`${user.balance.toLocaleString()}\` ${config.currency.symbol}`, inline: true },
                { name: '🏦 Bank', value: `\`${(user.bank || 0).toLocaleString()}\` ${config.currency.symbol}`, inline: true },
                { name: '💬 Messages', value: `\`${user.totalMessages.toLocaleString()}\``, inline: true }
            )
            .setImage(config.images?.profileBannerUrl || 'https://media.discordapp.net/attachments/1459907365750182095/1459988701579841637/wmremove-transformed_2.jpeg?ex=696547ef&is=6963f66f&hm=ae7480cff38c951f57223d3daac8a15577f137d82c34be5f3d38b9a6ddcb35c8&=&format=webp&width=1280&height=543')
            .setFooter({ 
                text: `Keep chatting to earn more XP and ${config.currency.name}! 🚀 • created by VadikGoel (aka VYPER GAMER)`, 
                iconURL: message.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

function createProgressBar(current, max, length = 15) {
    const percentage = current / max;
    const filled = Math.floor(percentage * length);
    const empty = length - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${ bar}]`;
}

function createLevelIndicator(level) {
    if (level >= 50) return '★★★★★';
    if (level >= 40) return '★★★★☆';
    if (level >= 30) return '★★★☆☆';
    if (level >= 20) return '★★☆☆☆';
    if (level >= 10) return '★☆☆☆☆';
    return '☆☆☆☆☆';
}
