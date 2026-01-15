const { EmbedBuilder } = require('discord.js');

const slots = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '7️⃣'];

module.exports = {
    name: 'slots',
    description: 'Play the slot machine!',
    aliases: ['slot', 'slotmachine'],
    execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const amount = parseInt(args[0]);

        if (!amount || amount <= 0 || isNaN(amount)) {
            return message.reply('Please specify a valid amount! Example: `!slots 100`');
        }

        if (amount < 50) {
            return message.reply('Minimum bet is 50 coins!');
        }

        const user = db.getUser(message.author.id, message.guild.id);

        if (!user || user.balance < amount) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // Generate slot results
        const slot1 = slots[Math.floor(Math.random() * slots.length)];
        const slot2 = slots[Math.floor(Math.random() * slots.length)];
        const slot3 = slots[Math.floor(Math.random() * slots.length)];

        let winnings = 0;
        let multiplier = 0;

        // Check for wins
        if (slot1 === slot2 && slot2 === slot3) {
            // Jackpot!
            if (slot1 === '💎') {
                multiplier = 10;
            } else if (slot1 === '7️⃣') {
                multiplier = 7;
            } else if (slot1 === '⭐') {
                multiplier = 5;
            } else {
                multiplier = 3;
            }
            winnings = amount * multiplier;
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            // Two matching
            multiplier = 1.5;
            winnings = Math.floor(amount * multiplier);
        }

        const won = winnings > 0;
        const profit = won ? winnings - amount : -amount;

        if (won) {
            db.addCoins(message.author.id, message.guild.id, profit);
        } else {
            db.removeCoins(message.author.id, message.guild.id, amount);
        }

        const newBalance = db.getUser(message.author.id, message.guild.id).balance;

        const embed = new EmbedBuilder()
            .setColor(won ? '#00ff00' : '#ff0000')
            .setTitle('🎰 Slot Machine')
            .setDescription(`┏━━━━━━━━━┓\n┃ ${slot1} ┃ ${slot2} ┃ ${slot3} ┃\n┗━━━━━━━━━┛`)
            .addFields(
                { name: 'Result', value: won ? `🎉 **YOU WIN!**` : '😢 **YOU LOSE!**', inline: false },
                { name: 'Bet Amount', value: `${amount} ${config.currency.symbol}`, inline: true },
                { name: won ? 'Winnings' : 'Lost', value: `${Math.abs(profit)} ${config.currency.symbol}`, inline: true },
                { name: 'New Balance', value: `${newBalance} ${config.currency.symbol}`, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({ 
                text: (won ? `${multiplier}x Multiplier! 🎊` : 'Better luck next time!') + ' • created by VadikGoel (aka VYPER GAMER)',
                iconURL: message.author.displayAvatarURL() 
            })
            .setTimestamp();
        
        // Add appropriate casino banner
        if (won && config.images?.casinoWinBannerUrl) {
            embed.setImage(config.images.casinoWinBannerUrl);
        } else if (!won && config.images?.casinoLossBannerUrl) {
            embed.setImage(config.images.casinoLossBannerUrl);
        }

        // Send to casino channel if set
        if (guildSettings && guildSettings.casinoChannelId) {
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
