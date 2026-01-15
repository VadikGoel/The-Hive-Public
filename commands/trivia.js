const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'trivia',
    description: 'Answer trivia questions to earn coins!',
    execute(message, args, db, config) {
        const bet = parseInt(args[0]);

        if (!bet || bet <= 0 || isNaN(bet)) {
            return message.reply(`Bet coins on trivia! Example: \`${config.prefix}trivia 100\``);
        }

        const user = db.getUser(message.author.id, message.guild.id);

        if (!user || user.balance < bet) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        // Trivia questions with 3 options
        const questions = [
            {
                q: 'What is the capital of France?',
                options: ['Paris', 'Lyon', 'Nice'],
                answer: 0
            },
            {
                q: 'Which planet is closest to the sun?',
                options: ['Venus', 'Mercury', 'Mars'],
                answer: 1
            },
            {
                q: 'What is 2 + 2 × 2?',
                options: ['6', '8', '4'],
                answer: 2
            },
            {
                q: 'Which ocean is the largest?',
                options: ['Atlantic', 'Indian', 'Pacific'],
                answer: 2
            },
            {
                q: 'What year did the Titanic sink?',
                options: ['1912', '1905', '1920'],
                answer: 0
            },
            {
                q: 'Who painted the Mona Lisa?',
                options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael'],
                answer: 1
            },
            {
                q: 'How many continents are there?',
                options: ['5', '6', '7'],
                answer: 2
            },
            {
                q: 'Which gas do plants absorb?',
                options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide'],
                answer: 2
            }
        ];

        const trivia = questions[Math.floor(Math.random() * questions.length)];
        
        // Create options string
        let optionsText = '';
        trivia.options.forEach((opt, idx) => {
            optionsText += `**${idx + 1}**. ${opt}\n`;
        });

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🧠 TRIVIA CHALLENGE')
            .setDescription(`${trivia.q}\n\n${optionsText}`)
            .addFields(
                { name: '💰 Reward', value: `${Math.floor(bet * 2)} ${config.currency.symbol} if correct!`, inline: true },
                { name: '⏱️ Time', value: '15 seconds to answer', inline: true }
            )
            .setFooter({ text: 'Reply with 1, 2, or 3 to answer! • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] }).then(() => {
            const filter = m => m.author.id === message.author.id && ['1', '2', '3'].includes(m.content);
            const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

            collector.on('collect', m => {
                const userAnswer = parseInt(m.content) - 1;
                const correct = userAnswer === trivia.answer;

                db.removeCoins(message.author.id, message.guild.id, bet);

                // Get guild settings for casino channel
                const guildSettings = db.getGuildSettings(message.guild.id);
                const sendToChannel = (embed) => {
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
                };

                if (correct) {
                    const reward = Math.floor(bet * 2);
                    db.addCoins(message.author.id, message.guild.id, reward);

                    const winEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✅ CORRECT!')
                        .setDescription(`The answer was **${trivia.options[trivia.answer]}**`)
                        .addFields(
                            { name: '💰 You won', value: `${reward} ${config.currency.symbol}`, inline: true }
                        )
                        .setTimestamp();

                    if (config.images?.casinoWinBannerUrl) {
                        winEmbed.setImage(config.images.casinoWinBannerUrl);
                    }

                    sendToChannel(winEmbed);
                } else {
                    const loseEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ WRONG!')
                        .setDescription(`The correct answer was **${trivia.options[trivia.answer]}**`)
                        .addFields(
                            { name: '💸 You lost', value: `${bet} ${config.currency.symbol}`, inline: true }
                        )
                        .setTimestamp();

                    if (config.images?.casinoLossBannerUrl) {
                        loseEmbed.setImage(config.images.casinoLossBannerUrl);
                    }

                    sendToChannel(loseEmbed);
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    // Get guild settings for casino channel
                    const guildSettings = db.getGuildSettings(message.guild.id);
                    const timeoutMsg = `⏰ Time's up! The answer was **${trivia.options[trivia.answer]}**\n💸 You lost ${bet} ${config.currency.symbol}`;
                    
                    if (guildSettings.casinoChannelId) {
                        const casinoChannel = message.guild.channels.cache.get(guildSettings.casinoChannelId);
                        if (casinoChannel) {
                            casinoChannel.send(timeoutMsg);
                        } else {
                            message.reply(timeoutMsg);
                        }
                    } else {
                        message.reply(timeoutMsg);
                    }
                    db.removeCoins(message.author.id, message.guild.id, bet);
                }
            });
        });
    }
};
