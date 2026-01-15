const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'plinko',
    description: 'Watch a ball drop through pegs and win multipliers!',
    execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const bet = parseInt(args[0]);

        if (!bet || bet <= 0 || isNaN(bet)) {
            return message.reply(`Please specify a valid bet! Example: \`${config.prefix}plinko 100\``);
        }

        const user = db.getUser(message.author.id, message.guild.id);

        if (!user || user.balance < bet) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // Plinko board simulation - 8 rows, ball falls left or right
        let position = 3; // Start in middle (0-7 board)
        const path = [];
        
        for (let i = 0; i < 8; i++) {
            const moveRight = Math.random() < 0.5;
            path.push(moveRight ? '→' : '←');
            position = moveRight ? position + 1 : position - 1;
            position = Math.max(0, Math.min(7, position)); // Keep in bounds
        }

        // Multipliers based on final position (center is better)
        const multipliers = [0.2, 0.5, 0.8, 1.2, 2.0, 1.2, 0.8, 0.5];
        const multiplier = multipliers[position];
        const winnings = Math.floor(bet * multiplier);
        const profit = winnings - bet;

        db.removeCoins(message.author.id, message.guild.id, bet);
        if (winnings > 0) {
            db.addCoins(message.author.id, message.guild.id, winnings);
        }

        let description = `🔴 **PLINKO BOARD**\n`;
        description += `\`\`\`\n`;
        description += `${path.join(' ')}\n`;
        description += `Position: ${position + 1}/8\n`;
        description += `\`\`\`\n`;
        description += `Final Multiplier: **${multiplier}x**\n`;
        
        if (profit > 0) {
            description += `💰 **+${profit} coins! YOU WON!**`;
        } else if (profit === 0) {
            description += `🤔 You broke even!`;
        } else {
            description += `😢 You lost ${Math.abs(profit)} coins!`;
        }

        const embed = new EmbedBuilder()
            .setColor(profit > 0 ? '#00ff00' : profit === 0 ? '#ffff00' : '#ff0000')
            .setTitle('🎯 PLINKO GAME')
            .setDescription(description)
            .addFields(
                { name: '💰 Bet', value: `${bet} ${config.currency.symbol}`, inline: true },
                { name: '🎁 Winnings', value: `${winnings} ${config.currency.symbol}`, inline: true }
            )
            .setFooter({ text: 'Center = Big wins! Edges = Small wins or losses • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

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
