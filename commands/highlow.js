const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// High-Low card game: user bets if next card is higher or lower than shown card.
module.exports = {
    name: 'highlow',
    description: 'Guess if the next card is higher or lower',
    aliases: ['hl'],
    async execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        const amount = parseInt(args[0], 10);

        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply(`Bet an amount. Example: \`${prefix}highlow 200\``);
        }

        const user = db.getUser(message.author.id, message.guild.id);
        if (!user || user.balance < amount) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // take bet
        db.removeCoins(message.author.id, message.guild.id, amount);

        // Generate current card
        const current = Math.floor(Math.random() * 13) + 2;

        // Show current card and ask for guess
        const guessEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🂡 Higher or Some')
            .setDescription(`\`\`\`Current Card\n${renderCardVisual(current)}\`\`\`\n**Your bet: ${amount.toLocaleString()} ${config.currency.symbol}**\n\nGuess if the next card will be **Higher** or **Lower**!`)
            .setFooter({ text: 'Click a button below to make your guess • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        const guessButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('hl_higher')
                    .setLabel('📈 Higher')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('hl_lower')
                    .setLabel('📉 Lower')
                    .setStyle(ButtonStyle.Danger)
            );

        const guessMsg = await message.reply({ embeds: [guessEmbed], components: [guessButtons] });

        // Collect button response
        const filter = i => i.user.id === message.author.id && (i.customId === 'hl_higher' || i.customId === 'hl_lower');
        const collector = guessMsg.createMessageComponentCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', async (interaction) => {
            const wantsHigher = interaction.customId === 'hl_higher';
            
            // Generate next card
            const next = Math.floor(Math.random() * 13) + 2;
            
            const result = next === current ? 'push' : next > current ? 'higher' : 'lower';

            let winnings = 0;
            let resultStatus = '';
            let resultColor = '#1A1A2E';

            if (result === 'push') {
                db.addCoins(message.author.id, message.guild.id, amount);
                resultStatus = '🔄 PUSH';
                resultColor = '#9B59B6';
            } else if ((result === 'higher' && wantsHigher) || (result === 'lower' && !wantsHigher)) {
                winnings = Math.floor(amount * 1.9);
                db.addCoins(message.author.id, message.guild.id, winnings);
                resultStatus = '✅ WIN';
                resultColor = '#00C853';
            } else {
                resultStatus = '❌ LOSE';
                resultColor = '#D32F2F';
            }

            // Calculate odds
            const higherOdds = calculateOdds(current, 'higher');
            const lowerOdds = calculateOdds(current, 'lower');

            const cardDisplay = renderCardVisual(current) + '\n' + renderCardVisual(next);

            const resultEmbed = new EmbedBuilder()
                .setColor(resultColor)
                .setTitle('🂡 Higher or Some')
                .setDescription(`\`\`\`Current Card        Next Card\n${cardDisplay}\`\`\``)
                .addFields(
                    { name: '💰 Bet Amount', value: `${amount.toLocaleString()} ${config.currency.symbol}`, inline: true },
                    { name: '📊 Your Guess', value: wantsHigher ? '📈 HIGHER' : '📉 LOWER', inline: true },
                    { name: '🎰 Result', value: resultStatus, inline: true },
                    { 
                        name: '📈 Higher Odds', 
                        value: `${higherOdds}%`, 
                        inline: true 
                    },
                    { 
                        name: '📉 Lower Odds', 
                        value: `${lowerOdds}%`, 
                        inline: true 
                    },
                    {
                        name: result === 'push' ? '🔄 Push' : (winnings > 0 ? '💵 Profit' : '💸 Loss'),
                        value: result === 'push' ? `${amount.toLocaleString()} ${config.currency.symbol}` : (winnings > 0 ? `+${winnings.toLocaleString()} ${config.currency.symbol}` : `-${amount.toLocaleString()} ${config.currency.symbol}`),
                        inline: false
                    }
                )
                .setFooter({ text: '🎰 Aces (14) are highest • 2s are lowest • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            await interaction.update({ embeds: [resultEmbed], components: [] });

            // Send to casino channel if set
            if (guildSettings.casinoChannelId) {
                const casinoChannel = message.guild.channels.cache.get(guildSettings.casinoChannelId);
                if (casinoChannel) {
                    casinoChannel.send({ embeds: [resultEmbed] });
                }
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                // Refund if no response
                db.addCoins(message.author.id, message.guild.id, amount);
                message.reply('❌ Guess timed out! Bet refunded.');
            }
        });
    }
};

function renderCardVisual(value) {
    const faces = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    const cardValue = faces[value] || value.toString();
    const suit = ['♠', '♥', '♦', '♣'][Math.floor(Math.random() * 4)];
    
    const cardStr = `${cardValue}${suit}`.padEnd(8);
    return `[${cardStr}]`;
}

function calculateOdds(currentCard, direction) {
    let favorableCards = 0;
    
    if (direction === 'higher') {
        for (let i = currentCard + 1; i <= 14; i++) {
            favorableCards++;
        }
    } else {
        for (let i = 2; i < currentCard; i++) {
            favorableCards++;
        }
    }
    
    const odds = (favorableCards / 13) * 100;
    return odds.toFixed(2);
}
