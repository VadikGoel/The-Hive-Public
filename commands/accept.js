const { EmbedBuilder } = require('discord.js');
const { activeBets } = require('./coinflippvp.js');

module.exports = {
    name: 'accept',
    description: 'Accept a coinflip duel',
    execute(message, args, db, config) {
        // Find active bet for this user
        let betData = null;
        let betKey = null;

        for (const [key, data] of activeBets.entries()) {
            if (data.opponent === message.author.id && data.guildId === message.guild.id) {
                betData = data;
                betKey = key;
                break;
            }
        }

        if (!betData) {
            return message.reply('You don\'t have any pending duel challenges!');
        }

        const challenger = message.guild.members.cache.get(betData.challenger);
        const opponent = message.author;
        const bet = betData.bet;

        if (!challenger) {
            activeBets.delete(betKey);
            return message.reply('The challenger is no longer in the server!');
        }

        // Check balances again
        const challengerUser = db.getUser(challenger.id, message.guild.id);
        const opponentUser = db.getUser(opponent.id, message.guild.id);

        if (!challengerUser || challengerUser.balance < bet) {
            activeBets.delete(betKey);
            return message.reply('The challenger no longer has enough coins!');
        }

        if (!opponentUser || opponentUser.balance < bet) {
            activeBets.delete(betKey);
            return message.reply('You no longer have enough coins!');
        }

        // Flip the coin
        const challengerWins = Math.random() < 0.5;
        const winner = challengerWins ? challenger : opponent;
        const loser = challengerWins ? opponent : challenger;

        // Process transaction
        db.removeCoins(challenger.id, message.guild.id, bet);
        db.removeCoins(opponent.id, message.guild.id, bet);
        db.addCoins(winner.id, message.guild.id, bet * 2);

        // Remove bet
        activeBets.delete(betKey);

        const embed = new EmbedBuilder()
            .setColor(challengerWins ? '#00ff00' : '#ff6b6b')
            .setTitle('🪙 Coinflip Duel Results!')
            .setDescription(`The coin has been flipped!\n\n🏆 **${winner} wins the duel!**`)
            .addFields(
                { name: '👑 Winner', value: `${winner}`, inline: true },
                { name: '💸 Winnings', value: `+${bet} ${config.currency.symbol}`, inline: true },
                { name: '😢 Loser', value: `${loser}`, inline: true }
            )
            .setFooter({ text: 'Better luck next time! • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
