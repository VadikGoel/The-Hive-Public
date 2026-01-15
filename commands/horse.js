const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'horse',
    description: 'Bet on horse racing! Multiple horses race to the finish line.',
    execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const bet = parseInt(args[0]);

        if (!bet || bet <= 0 || isNaN(bet)) {
            return message.reply(`Bet on horse racing! Example: \`${config.prefix}horse 100\``);
        }

        const user = db.getUser(message.author.id, message.guild.id);

        if (!user || user.balance < bet) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        const horses = [
            { name: '🐎 Lightning', odds: 2.0 },
            { name: '🐎 Thunder', odds: 2.5 },
            { name: '🐎 Storm', odds: 3.0 },
            { name: '🐎 Blaze', odds: 2.0 },
            { name: '🐎 Shadow', odds: 3.5 }
        ];

        // Simulate race
        const raceLog = [];
        const horsePositions = horses.map(() => 0);
        const finishLine = 10;

        for (let turn = 0; turn < 15; turn++) {
            for (let i = 0; i < horses.length; i++) {
                const speed = Math.floor(Math.random() * 3) + 1;
                horsePositions[i] += speed;
            }
            
            const leader = horses[horsePositions.indexOf(Math.max(...horsePositions))];
            if (horsePositions.some(p => p >= finishLine)) {
                raceLog.push(`Turn ${turn + 1}: ${leader.name} takes the lead!`);
                break;
            } else {
                raceLog.push(`Turn ${turn + 1}: ${leader.name} leads!`);
            }
        }

        const winnerIdx = horsePositions.indexOf(Math.max(...horsePositions));
        const winner = horses[winnerIdx];

        // 30% of the time you pick the winner
        const pickedWinner = Math.random() < 0.30;
        let winnings = 0;

        if (pickedWinner) {
            winnings = Math.floor(bet * winner.odds);
            db.removeCoins(message.author.id, message.guild.id, bet);
            db.addCoins(message.author.id, message.guild.id, winnings);
        } else {
            db.removeCoins(message.author.id, message.guild.id, bet);
        }

        // Build race visualization
        let raceDisplay = '';
        horses.forEach((horse, idx) => {
            const position = horsePositions[idx];
            const barFilled = Math.max(0, Math.floor(position / 2));
            const barEmpty = Math.max(0, 5 - barFilled);
            const bar = '█'.repeat(barFilled) + '░'.repeat(barEmpty);
            const status = idx === winnerIdx ? ' 🏆 WINNER!' : '';
            raceDisplay += `${horse.name.split(' ')[0]} ${bar} ${position}${status}\n`;
        });

        const embed = new EmbedBuilder()
            .setColor(pickedWinner ? '#00ff00' : '#ff0000')
            .setTitle('🏇 HORSE RACING')
            .setDescription(`**Race Results:**\n\`\`\`\n${raceDisplay}\n\`\`\``)
            .addFields(
                { name: '🏆 Winner', value: winner.name, inline: true },
                { name: '💰 Bet', value: `${bet} ${config.currency.symbol}`, inline: true },
                { name: '📊 Odds', value: `${winner.odds}:1`, inline: true },
                { name: '💸 You', value: pickedWinner ? `Won ${winnings} ${config.currency.symbol}!` : `Lost ${bet} ${config.currency.symbol}!`, inline: true }
            )
            .setFooter({ text: raceLog[raceLog.length - 1] + ' • created by VadikGoel (aka VYPER GAMER)' })
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
