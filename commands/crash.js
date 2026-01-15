const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'crash',
    description: 'Bet on when to cash out before the multiplier crashes!',
    async execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const bet = parseInt(args[0]);

        if (!bet || bet <= 0 || isNaN(bet)) {
            return message.reply(`Please specify a valid bet amount! Example: \`${config.prefix}crash 100\``);
        }

        const user = db.getUser(message.author.id, message.guild.id);

        if (!user || user.balance < bet) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // Apply lucky charm bonus
        const hasLuckyCharm = db.hasItem(message.author.id, message.guild.id, 'lucky_charm');

        // Generate crash point (1.0 to 10.0x with weighted probability)
        const rand = Math.random();
        let crashPoint;
        
        if (rand < 0.4) crashPoint = 1.0 + Math.random() * 0.5;
        else if (rand < 0.7) crashPoint = 1.5 + Math.random() * 1.0;
        else if (rand < 0.85) crashPoint = 2.5 + Math.random() * 2.0;
        else if (rand < 0.95) crashPoint = 4.5 + Math.random() * 2.5;
        else crashPoint = 7.0 + Math.random() * 3.0;

        if (hasLuckyCharm) crashPoint *= 1.1;
        crashPoint = Math.min(crashPoint, 10.0);

        // Remove bet from user
        db.removeCoins(message.author.id, message.guild.id, bet);

        // Start multiplier at 1.00x
        let currentMultiplier = 1.00;
        let gameActive = true;

        const embed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('🚀 CRASH GAME')
            .setDescription(`**Current Multiplier: ${currentMultiplier.toFixed(2)}x**\n\nBet: ${bet} ${config.currency.symbol}\nCash out before it crashes!`)
            .setFooter({ text: 'Click Cash Out to claim your winnings!' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('crash_cashout')
                    .setLabel('💰 Cash Out')
                    .setStyle(ButtonStyle.Success)
            );

        const gameMsg = await message.reply({ embeds: [embed], components: [row] });

        // Update multiplier every 800ms
        const interval = setInterval(() => {
            if (!gameActive) {
                clearInterval(interval);
                return;
            }

            currentMultiplier += 0.10 + Math.random() * 0.15;

            if (currentMultiplier >= crashPoint) {
                // CRASH!
                gameActive = false;
                clearInterval(interval);

                const crashEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('💥 CRASH!')
                    .setDescription(`The game crashed at **${crashPoint.toFixed(2)}x**!\n\nYou lost **${bet}** ${config.currency.symbol}`)
                    .setFooter({ text: 'Better luck next time! • created by VadikGoel (aka VYPER GAMER)' })
                    .setTimestamp();

                gameMsg.edit({ embeds: [crashEmbed], components: [] });
                return;
            }

            // Update embed
            const updateEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('🚀 CRASH GAME')
                .setDescription(`**Current Multiplier: ${currentMultiplier.toFixed(2)}x**\n\nBet: ${bet} ${config.currency.symbol}\nPotential Winnings: **${Math.floor(bet * currentMultiplier)}** ${config.currency.symbol}`)
                .setFooter({ text: 'Click Cash Out to claim your winnings! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            gameMsg.edit({ embeds: [updateEmbed], components: [row] }).catch(() => {});
        }, 800);

        // Handle cash out button
        const collector = gameMsg.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: '❌ This is not your game!', ephemeral: true });
            }

            if (i.customId === 'crash_cashout' && gameActive) {
                gameActive = false;
                clearInterval(interval);

                const winnings = Math.floor(bet * currentMultiplier);
                db.addCoins(message.author.id, message.guild.id, winnings);

                let description = `You cashed out at **${currentMultiplier.toFixed(2)}x**!\nThe game would have crashed at **${crashPoint.toFixed(2)}x**`;
                if (hasLuckyCharm) description += '\n🍀 **Lucky Charm helped!**';

                const winEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('💰 CASHED OUT!')
                    .setDescription(description)
                    .addFields(
                        { name: '🎯 Multiplier', value: `${currentMultiplier.toFixed(2)}x`, inline: true },
                        { name: '💰 Won', value: `${winnings} ${config.currency.symbol}`, inline: true },
                        { name: '💸 Profit', value: `+${winnings - bet} ${config.currency.symbol}`, inline: true }
                    )
                    .setFooter({ text: 'Nice timing! • created by VadikGoel (aka VYPER GAMER)' })
                    .setTimestamp();

                await i.update({ embeds: [winEmbed], components: [] });
            }
        });

        collector.on('end', () => {
            if (gameActive) {
                gameActive = false;
                clearInterval(interval);
            }
        });
    }
};
