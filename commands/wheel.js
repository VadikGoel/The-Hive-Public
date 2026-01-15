const { EmbedBuilder } = require('discord.js');

// Lucky wheel with weighted rewards
const wedges = [
    { label: 'x0.5', multiplier: 0.5, weight: 10 },
    { label: 'x1', multiplier: 1, weight: 25 },
    { label: 'x1.5', multiplier: 1.5, weight: 20 },
    { label: 'x2', multiplier: 2, weight: 15 },
    { label: 'x3', multiplier: 3, weight: 8 },
    { label: 'x5', multiplier: 5, weight: 5 },
    { label: 'JACKPOT x10', multiplier: 10, weight: 2 }
];

function pickWedge() {
    const total = wedges.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * total;
    for (const w of wedges) {
        if ((r -= w.weight) <= 0) return w;
    }
    return wedges[0];
}

module.exports = {
    name: 'wheel',
    description: 'Spin a weighted lucky wheel',
    aliases: ['spin'],
    execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        const amount = parseInt(args[0], 10);
        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply(`Please bet a valid amount. Example: \`${prefix}wheel 200\``);
        }

        const user = db.getUser(message.author.id, message.guild.id);
        if (!user || user.balance < amount) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // take bet
        db.removeCoins(message.author.id, message.guild.id, amount);

        const wedge = pickWedge();
        const winnings = Math.floor(amount * wedge.multiplier);
        if (winnings > 0) {
            db.addCoins(message.author.id, message.guild.id, winnings);
        }

        const net = winnings - amount;
        const embed = new EmbedBuilder()
            .setColor(net >= 0 ? '#2ECC71' : '#E74C3C')
            .setTitle('🎡 Lucky Wheel')
            .addFields(
                { name: 'Bet', value: `${amount.toLocaleString()} ${config.currency.symbol}`, inline: true },
                { name: 'Result', value: wedge.label, inline: true },
                { name: net >= 0 ? 'You Won' : 'You Lost', value: `${Math.abs(net).toLocaleString()} ${config.currency.symbol}`, inline: true }
            )
            .setFooter({ text: (net >= 0 ? 'Huge congrats!' : 'Spin again for a comeback!') + ' • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        // Add appropriate casino banner
        if (net >= 0 && config.images?.casinoWinBannerUrl) {
            embed.setImage(config.images.casinoWinBannerUrl);
        } else if (net < 0 && config.images?.casinoLossBannerUrl) {
            embed.setImage(config.images.casinoLossBannerUrl);
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
