const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'balance',
    description: 'Check your or another user\'s balance',
    aliases: ['bal', 'money', 'wallet'],
    execute(message, args, db, config) {
        const target = message.mentions.users.first() || message.author;
        const user = db.createUser(target.id, message.guild.id);
        const total = user.balance + (user.bank || 0);

        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setAuthor({ name: `${target.username}'s Economy`, iconURL: target.displayAvatarURL({ dynamic: true }) })
            .setTitle('💰 Balance Information')
            .setDescription('━━━━━━━━━━━━━━━━━━━━━━')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '💵 Wallet', value: `\`\`\`${user.balance.toLocaleString()}\`\`\` ${config.currency.symbol}`, inline: true },
                { name: '🏦 Bank', value: `\`\`\`${(user.bank || 0).toLocaleString()}\`\`\` ${config.currency.symbol}`, inline: true },
                { name: '💎 Net Worth', value: `\`\`\`${total.toLocaleString()}\`\`\` ${config.currency.symbol}`, inline: true },
                { name: '\u200b', value: '━━━━━━━━━━━━━━━━━━━━━━', inline: false },
                { name: '⭐ Level', value: `\`${user.level}\``, inline: true },
                { name: '📊 XP', value: `\`${user.xp}/${db.calculateXPNeeded(user.level)}\``, inline: true },
                { name: '💬 Messages', value: `\`${user.totalMessages}\``, inline: true }
            )
            .setFooter({ 
                text: `${target.username} • Use deposit/withdraw to manage your bank • created by VadikGoel (aka VYPER GAMER)`, 
                iconURL: target.displayAvatarURL() 
            })
            .setTimestamp();

        if (config.images?.bankBannerUrl) {
            embed.setImage(config.images.bankBannerUrl);
        }

        message.reply({ embeds: [embed] });
    }
};
