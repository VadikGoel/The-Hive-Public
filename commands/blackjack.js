const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Card suits and values
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
}

function getCardValue(card) {
    if (card.value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value);
}

function calculateHand(hand) {
    let total = 0;
    let aces = 0;
    
    for (let card of hand) {
        total += getCardValue(card);
        if (card.value === 'A') aces++;
    }
    
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    
    return total;
}

function formatCard(card) {
    const isRed = (card.suit === '♥' || card.suit === '♦');
    const suitSymbol = card.suit;
    const value = card.value.padEnd(2, ' ');
    
    // Create compact single-line card with box drawing
    return `┌───┐\n│${value}${suitSymbol}│\n└───┘`;
}

function formatHand(hand, hideFirst = false) {
    if (hideFirst) {
        const hiddenCard = '┌───┐\n│ ? │\n└───┘';
        const visibleCards = hand.slice(1).map(c => formatCard(c));
        
        // Join cards horizontally
        const lines = [hiddenCard.split('\n')];
        visibleCards.forEach(card => lines.push(card.split('\n')));
        
        return lines.map(cardLines => cardLines.join('  ')).map((line, i) => {
            return lines.map(card => card[i]).join('  ');
        }).join('\n');
    }
    
    const cards = hand.map(c => formatCard(c).split('\n'));
    return cards[0].map((_, i) => cards.map(card => card[i]).join('  ')).join('\n');
}

function getHandDescription(total, isBlackjack = false) {
    if (isBlackjack) return '🏆 **BLACKJACK!**';
    if (total === 21) return '🎯 **21!**';
    if (total > 21) return '💥 **BUST!**';
    if (total >= 17) return '🔥 Strong hand';
    return '📊 Keep playing';
}

module.exports = {
    name: 'blackjack',
    description: 'Play blackjack!',
    aliases: ['bj'],
    async execute(message, args, db, config) {
        const amount = parseInt(args[0]);
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        if (!amount || amount <= 0 || isNaN(amount)) {
            return message.reply(`Please specify a valid amount! Example: \`${prefix}blackjack 100\``);
        }

        const user = db.getUser(message.author.id, message.guild.id);

        if (!user || user.balance < amount) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // Remove bet
        db.removeCoins(message.author.id, message.guild.id, amount);

        // Create deck and deal cards
        const deck = createDeck();
        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];

        let playerTotal = calculateHand(playerHand);
        let dealerTotal = calculateHand(dealerHand);

        // Check for natural blackjack
        if (playerTotal === 21 && dealerTotal === 21) {
            // Push
            db.addCoins(message.author.id, message.guild.id, amount);
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🃏 Blackjack - Double Natural!')
                .setDescription('```css\n⚡ PUSH - Both got Blackjack!\n```')
                .addFields(
                    { 
                        name: '👤 Your Hand', 
                        value: `\`\`\`\n${formatHand(playerHand)}\n\`\`\`**Total: 21** ${getHandDescription(21, true)}`, 
                        inline: true 
                    },
                    { 
                        name: '🎰 Dealer Hand', 
                        value: `\`\`\`\n${formatHand(dealerHand)}\n\`\`\`**Total: 21** ${getHandDescription(21, true)}`, 
                        inline: true 
                    },
                    { 
                        name: '💰 Result', 
                        value: `\`\`\`diff\n+ Bet Returned: ${amount} ${config.currency.symbol}\n\`\`\``, 
                        inline: false 
                    }
                )
                .setFooter({ text: '🎲 Both hit Blackjack - Rare occurrence! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        if (playerTotal === 21) {
            // Player blackjack wins 1.5x
            const winnings = Math.floor(amount * 2.5);
            const profit = winnings - amount;
            db.addCoins(message.author.id, message.guild.id, winnings);
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 BLACKJACK! Natural Win!')
                .setDescription('```css\n✨ You got Blackjack! 2.5x Payout!\n```')
                .addFields(
                    { 
                        name: '👤 Your Hand', 
                        value: `\`\`\`\n${formatHand(playerHand)}\n\`\`\`**Total: 21** ${getHandDescription(21, true)}`, 
                        inline: true 
                    },
                    { 
                        name: '🎰 Dealer Hand', 
                        value: `\`\`\`\n${formatHand(dealerHand)}\n\`\`\`**Total: ${dealerTotal}**`, 
                        inline: true 
                    },
                    { 
                        name: '💵 Payout Breakdown', 
                        value: `\`\`\`diff\n+ Winnings: ${winnings} ${config.currency.symbol}\n+ Profit: +${profit} ${config.currency.symbol}\n\`\`\``, 
                        inline: false 
                    }
                )
                .setFooter({ text: '🎯 Perfect start! 2.5x multiplier on natural Blackjack • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        if (dealerTotal === 21) {
            // Dealer blackjack
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('😈 Dealer Blackjack!')
                .setDescription('```diff\n- Dealer hit Blackjack!\n```')
                .addFields(
                    { 
                        name: '👤 Your Hand', 
                        value: `\`\`\`\n${formatHand(playerHand)}\n\`\`\`**Total: ${playerTotal}**`, 
                        inline: true 
                    },
                    { 
                        name: '🎰 Dealer Hand', 
                        value: `\`\`\`\n${formatHand(dealerHand)}\n\`\`\`**Total: 21** ${getHandDescription(21, true)}`, 
                        inline: true 
                    },
                    { 
                        name: '💸 Loss', 
                        value: `\`\`\`diff\n- Lost: ${amount} ${config.currency.symbol}\n\`\`\``, 
                        inline: false 
                    }
                )
                .setFooter({ text: '🎲 Dealer natural - Better luck next time! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        // Game continues - show buttons
        const embed = new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle('🃏 Blackjack Table')
            .setDescription(`\`\`\`yml\n💰 Bet: ${amount} ${config.currency.symbol}\n🎯 Goal: Get 21 or beat the dealer!\n\`\`\``)
            .addFields(
                { 
                    name: '👤 Your Hand', 
                    value: `\`\`\`\n${formatHand(playerHand)}\n\`\`\`**Total: ${playerTotal}** ${getHandDescription(playerTotal)}`, 
                    inline: false 
                },
                { 
                    name: '🎰 Dealer Shows', 
                    value: `\`\`\`\n${formatHand(dealerHand, true)}\n\`\`\`**Visible: ${calculateHand([dealerHand[1]])}** 🔒`, 
                    inline: false 
                },
                { 
                    name: '📊 Game Info', 
                    value: `**Blackjack:** 2.5x payout\n**Win:** 2x payout\n**Push:** Bet returned`, 
                    inline: false 
                }
            )
            .setFooter({ text: '👊 Hit to draw • ✋ Stand to hold • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('bj_hit')
                    .setLabel('👊 Hit')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎴'),
                new ButtonBuilder()
                    .setCustomId('bj_stand')
                    .setLabel('✋ Stand')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🛑'),
                new ButtonBuilder()
                    .setCustomId('bj_info')
                    .setLabel('Rules')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('ℹ️')
            );

        const gameMsg = await message.reply({ embeds: [embed], components: [row] });

        const collector = gameMsg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: '❌ This is not your game!', ephemeral: true });
            }

            if (i.customId === 'bj_info') {
                const infoEmbed = new EmbedBuilder()
                    .setColor('#6495ED')
                    .setTitle('📖 Blackjack Rules')
                    .setDescription('```yaml\nGoal: Get closer to 21 than the dealer without going over\n```')
                    .addFields(
                        { name: '🎴 Card Values', value: '• **Ace:** 1 or 11\n• **Face (J,Q,K):** 10\n• **Number:** Face value', inline: true },
                        { name: '🎯 Payouts', value: '• **Blackjack:** 2.5x\n• **Win:** 2x\n• **Push:** Refund', inline: true },
                        { name: '🎲 Actions', value: '• **Hit:** Draw a card\n• **Stand:** End your turn\n• **Bust:** Go over 21 = Lose', inline: false }
                    )
                    .setFooter({ text: 'Dealer must hit until 17+ • created by VadikGoel (aka VYPER GAMER)' });
                return i.reply({ embeds: [infoEmbed], ephemeral: true });
            }

            if (i.customId === 'bj_hit') {
                playerHand.push(deck.pop());
                playerTotal = calculateHand(playerHand);

                if (playerTotal > 21) {
                    // Bust
                    collector.stop();
                    const bustEmbed = new EmbedBuilder()
                        .setColor('#DC143C')
                        .setTitle('💥 BUST! You Lose!')
                        .setDescription('```diff\n- You went over 21!\n```')
                        .addFields(
                            { 
                                name: '👤 Your Hand', 
                                value: `\`\`\`\n${formatHand(playerHand)}\n\`\`\`**Total: ${playerTotal}** ${getHandDescription(playerTotal)}`, 
                                inline: false 
                            },
                            { 
                                name: '🎰 Dealer Hand', 
                                value: `\`\`\`\n${formatHand(dealerHand)}\n\`\`\`**Total: ${dealerTotal}**`, 
                                inline: false 
                            },
                            { 
                                name: '💸 Loss', 
                                value: `\`\`\`diff\n- Lost: ${amount} ${config.currency.symbol}\n\`\`\``, 
                                inline: false 
                            }
                        )
                        .setFooter({ text: '💥 Too many points! Try being more conservative next time • created by VadikGoel (aka VYPER GAMER)' })
                        .setTimestamp();
                    return i.update({ embeds: [bustEmbed], components: [] });
                }

                const hitEmbed = new EmbedBuilder()
                    .setColor('#4169E1')
                    .setTitle('🃏 Blackjack Table')
                    .setDescription(`\`\`\`yml\n💰 Bet: ${amount} ${config.currency.symbol}\n🎯 ${playerTotal < 21 ? 'Hit or Stand?' : 'You have 21!'}\n\`\`\``)
                    .addFields(
                        { 
                            name: '👤 Your Hand', 
                            value: `\`\`\`\n${formatHand(playerHand)}\n\`\`\`**Total: ${playerTotal}** ${getHandDescription(playerTotal)}`, 
                            inline: false 
                        },
                        { 
                            name: '🎰 Dealer Shows', 
                            value: `\`\`\`\n${formatHand(dealerHand, true)}\n\`\`\`**Visible: ${calculateHand([dealerHand[1]])}** 🔒`, 
                            inline: false 
                        }
                    )
                    .setFooter({ text: (playerTotal === 21 ? '🎯 Perfect 21! Stand to win' : '👊 Hit again or ✋ Stand') + ' • created by VadikGoel (aka VYPER GAMER)' })
                    .setTimestamp();

                await i.update({ embeds: [hitEmbed], components: [row] });
            }

            if (i.customId === 'bj_stand') {
                collector.stop();

                // Dealer plays
                while (dealerTotal < 17) {
                    dealerHand.push(deck.pop());
                    dealerTotal = calculateHand(dealerHand);
                }

                let result, color, title, winnings = 0, profit = 0;

                if (dealerTotal > 21) {
                    title = '🎉 Dealer Bust! You Win!';
                    result = '```diff\n+ Dealer went over 21!\n```';
                    color = '#00C853';
                    winnings = amount * 2;
                    profit = amount;
                    db.addCoins(message.author.id, message.guild.id, winnings);
                } else if (playerTotal > dealerTotal) {
                    title = '🎉 Victory! You Win!';
                    result = '```diff\n+ Your hand beats the dealer!\n```';
                    color = '#00C853';
                    winnings = amount * 2;
                    profit = amount;
                    db.addCoins(message.author.id, message.guild.id, winnings);
                } else if (playerTotal < dealerTotal) {
                    title = '😢 Dealer Wins!';
                    result = '```diff\n- Dealer has the higher hand\n```';
                    color = '#DC143C';
                } else {
                    title = '🤝 Push! It\'s a Tie!';
                    result = '```css\n⚖️ Same total - Bet returned\n```';
                    color = '#FFA500';
                    db.addCoins(message.author.id, message.guild.id, amount);
                }

                const finalEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(title)
                    .setDescription(result)
                    .addFields(
                        { 
                            name: '👤 Your Hand', 
                            value: `\`\`\`\n${formatHand(playerHand)}\n\`\`\`**Total: ${playerTotal}** ${getHandDescription(playerTotal)}`, 
                            inline: false 
                        },
                        { 
                            name: '🎰 Dealer Hand', 
                            value: `\`\`\`\n${formatHand(dealerHand)}\n\`\`\`**Total: ${dealerTotal}** ${getHandDescription(dealerTotal)}`, 
                            inline: false 
                        },
                        { 
                            name: winnings > 0 ? '💵 Winnings' : (result.includes('PUSH') || result.includes('returned') ? '💰 Refund' : '💸 Loss'), 
                            value: winnings > 0 ? `\`\`\`diff\n+ Total: ${winnings} ${config.currency.symbol}\n+ Profit: +${profit} ${config.currency.symbol}\n\`\`\`` : (result.includes('PUSH') || result.includes('returned') ? `\`\`\`yaml\nReturned: ${amount} ${config.currency.symbol}\n\`\`\`` : `\`\`\`diff\n- Lost: ${amount} ${config.currency.symbol}\n\`\`\``), 
                            inline: false 
                        }
                    )
                    .setFooter({ text: (winnings > 0 ? '🎊 Congratulations!' : (result.includes('PUSH') ? '⚖️ Fair game!' : '🎲 Better luck next time!')) + ' • created by VadikGoel (aka VYPER GAMER)' })
                    .setTimestamp();
                
                // Add appropriate casino banner
                if (winnings > 0 && config.images?.casinoWinBannerUrl) {
                    finalEmbed.setImage(config.images.casinoWinBannerUrl);
                } else if (winnings < 0 && config.images?.casinoLossBannerUrl) {
                    finalEmbed.setImage(config.images.casinoLossBannerUrl);
                }

                await i.update({ embeds: [finalEmbed], components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                // Timeout - refund bet
                db.addCoins(message.author.id, message.guild.id, amount);
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#95A5A6')
                    .setTitle('⏱️ Game Timed Out')
                    .setDescription(`\`\`\`yaml\nBet refunded: ${amount} ${config.currency.symbol}\n\`\`\``)
                    .setFooter({ text: 'Game expired after 60 seconds • created by VadikGoel (aka VYPER GAMER)' });
                gameMsg.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
        });
    }
};
