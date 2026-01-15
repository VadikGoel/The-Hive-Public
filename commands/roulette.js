const { EmbedBuilder } = require('discord.js');

// Simple roulette: bet on red/black/green
// red/black: ~47.5% win, pays 1.9x; green: ~5% win, pays 14x
module.exports = {
    name: 'roulette',
    description: 'Bet on red, black, or green',
    aliases: ['rl'],
    execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        const choice = (args[0] || '').toLowerCase();
        const amount = parseInt(args[1], 10);

        if (!['red', 'black', 'green'].includes(choice)) {
            return message.reply(`Choose **red**, **black**, or **green**. Example: \`${prefix}roulette red 200\``);
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply(`Please bet a valid amount. Example: \`${prefix}roulette red 200\``);
        }

        const user = db.getUser(message.author.id, message.guild.id);
        if (!user || user.balance < amount) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // take the bet
        db.removeCoins(message.author.id, message.guild.id, amount);

        // roll
        const roll = Math.random();
        let outcomeColor;
        if (roll <= 0.05) outcomeColor = 'green';
        else if (roll <= 0.525) outcomeColor = 'red';
        else outcomeColor = 'black';

        let win = 0;
        if (choice === outcomeColor) {
            win = outcomeColor === 'green' ? Math.floor(amount * 14) : Math.floor(amount * 1.9);
            db.addCoins(message.author.id, message.guild.id, win);
        }

        const embed = new EmbedBuilder()
            .setColor(win > 0 ? '#2ECC71' : '#E74C3C')
            .setTitle('🎡 Roulette')
            .addFields(
                { name: 'Your Bet', value: `${choice.toUpperCase()} for ${amount.toLocaleString()} ${config.currency.symbol}`, inline: true },
                { name: 'Outcome', value: outcomeColor.toUpperCase(), inline: true },
                { name: win > 0 ? 'You Won' : 'You Lost', value: win > 0 ? `${win.toLocaleString()} ${config.currency.symbol}` : `${amount.toLocaleString()} ${config.currency.symbol}`, inline: false }
            )
            .setFooter({ text: (win > 0 ? 'Nice spin!' : 'Better luck next time!') + ' • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();
        
        // Add appropriate casino banner
        if (win > 0 && config.images?.casinoWinBannerUrl) {
            embed.setImage(config.images.casinoWinBannerUrl);
        } else if (win === 0 || (win < 0 && amount > 0)) {
            if (config.images?.casinoLossBannerUrl) {
                embed.setImage(config.images.casinoLossBannerUrl);
            }
        }

        // Send to casino channel if set
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
};
