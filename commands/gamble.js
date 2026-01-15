const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'gamble',
    description: 'Gamble your coins (50/50 chance)',
    aliases: ['bet'],
    execute(message, args, db, config) {
        const amount = parseInt(args[0]);

        if (!amount || amount <= 0 || isNaN(amount)) {
            return message.reply('Please specify a valid amount to gamble!');
        }

        const user = db.getUser(message.author.id, message.guild.id);

        if (!user || user.balance < amount) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // Apply lucky charm bonus (55% win rate instead of 50%)
        const hasLuckyCharm = db.hasItem(message.author.id, message.guild.id, 'lucky_charm');
        const winChance = hasLuckyCharm ? 0.55 : 0.5;
        const won = Math.random() < winChance;

        if (won) {
            db.addCoins(message.author.id, message.guild.id, amount);
            const newBalance = db.getUser(message.author.id, message.guild.id).balance;

            let description = `You won **${amount}** ${config.currency.symbol} ${config.currency.name}!`;
            if (hasLuckyCharm) description += '\n🍀 **Lucky Charm Bonus Applied!**';

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎰 YOU WON!')
                .setDescription(description)
                .addFields(
                    { name: 'Winnings', value: `+${amount}`, inline: true },
                    { name: 'New Balance', value: `${newBalance} ${config.currency.name}`, inline: true }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // Send to casino channel if set
            const guildSettings = db.getGuildSettings(message.guild.id);
            if (guildSettings.casinoChannelId) {
                const casinoChannel = message.guild.channels.cache.get(guildSettings.casinoChannelId);
                if (casinoChannel) {
                    casinoChannel.send({ embeds: [embed] });
                } else {
                    message.reply({ embeds: [embed] });
                }
            } else {
                message.reply({ embeds: [embed] });
            }
        } else {
            db.removeCoins(message.author.id, message.guild.id, amount);
            const newBalance = db.getUser(message.author.id, message.guild.id).balance;

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🎰 YOU LOST!')
                .setDescription(`You lost **${amount}** ${config.currency.symbol} ${config.currency.name}!`)
                .addFields(
                    { name: 'Lost', value: `-${amount}`, inline: true },
                    { name: 'New Balance', value: `${newBalance} ${config.currency.name}`, inline: true }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // Send to casino channel if set
            const guildSettings = db.getGuildSettings(message.guild.id);
            if (guildSettings.casinoChannelId) {
                const casinoChannel = message.guild.channels.cache.get(guildSettings.casinoChannelId);
                if (casinoChannel) {
                    casinoChannel.send({ embeds: [embed] });
                } else {
                    message.reply({ embeds: [embed] });
                }
            } else {
                message.reply({ embeds: [embed] });
            }
        }
    }
};
