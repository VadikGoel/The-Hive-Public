const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'giveaway',
    description: 'Start a beautiful giveaway',
    aliases: ['gw'],
    async execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        // Check permissions (admin only)
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need **Administrator** permissions to start a giveaway!');
        }

        const prize = args[0];
        const duration = parseInt(args[1]);
        const winners = parseInt(args[2]) || 1;

        if (!prize) {
            return message.reply(`Usage: \`${prefix}giveaway <prize> <duration_seconds> [winners]\`\nExample: \`${prefix}giveaway "Discord Nitro" 60 3\``);
        }

        if (!duration || duration < 10) {
            return message.reply('⏱️ Duration must be at least 10 seconds!');
        }

        if (winners < 1 || winners > 10) {
            return message.reply('🏆 Winners must be between 1 and 10!');
        }

        const endTime = Date.now() + (duration * 1000);
        const participants = new Set();

        // Create beautiful giveaway embed
        const giveawayEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎉 GIVEAWAY 🎉')
            .setDescription(`**Prize:** ${prize}`)
            .addFields(
                { name: '🏆 Winners', value: `${winners}`, inline: true },
                { name: '⏱️ Duration', value: `${duration}s`, inline: true },
                { name: '👤 Host', value: `${message.author}`, inline: true },
                { name: '\u200b', value: '\u200b', inline: false },
                { name: '📊 Participants', value: '0', inline: true },
                { name: '⏳ Status', value: 'Active', inline: true },
                { name: '\u200b', value: '\u200b', inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setImage('https://media.discordapp.net/attachments/1309879612108701706/1309879612108701706/giveaway-banner.png')
            .setFooter({ text: `React to participate! | Ends at: • created by VadikGoel (aka VYPER GAMER)` })
            .setTimestamp(endTime);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_join')
                    .setLabel('🎁 Enter Giveaway')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('giveaway_leave')
                    .setLabel('❌ Leave')
                    .setStyle(ButtonStyle.Danger)
            );

        const giveawayMsg = await message.reply({ embeds: [giveawayEmbed], components: [row] });

        const collector = giveawayMsg.createMessageComponentCollector({ time: duration * 1000 });

        collector.on('collect', async i => {
            if (i.customId === 'giveaway_join') {
                if (participants.has(i.user.id)) {
                    return i.reply({ content: '✅ You\'re already entered!', ephemeral: true });
                }
                participants.add(i.user.id);
                await i.reply({ content: `✅ **${i.user.username}** entered the giveaway!`, ephemeral: true });

                // Update participant count
                const updatedEmbed = new EmbedBuilder(giveawayEmbed.data)
                    .spliceFields(4, 1, { name: '📊 Participants', value: `${participants.size}`, inline: true });

                await giveawayMsg.edit({ embeds: [updatedEmbed], components: [row] }).catch(() => {});
            }

            if (i.customId === 'giveaway_leave') {
                if (!participants.has(i.user.id)) {
                    return i.reply({ content: '❌ You haven\'t entered the giveaway!', ephemeral: true });
                }
                participants.delete(i.user.id);
                await i.reply({ content: `❌ **${i.user.username}** left the giveaway!`, ephemeral: true });

                // Update participant count
                const updatedEmbed = new EmbedBuilder(giveawayEmbed.data)
                    .spliceFields(4, 1, { name: '📊 Participants', value: `${participants.size}`, inline: true });

                await giveawayMsg.edit({ embeds: [updatedEmbed], components: [row] }).catch(() => {});
            }
        });

        collector.on('end', async () => {
            const participantArray = Array.from(participants);

            if (participantArray.length === 0) {
                const endEmbed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setTitle('🎉 GIVEAWAY ENDED 🎉')
                    .setDescription(`**Prize:** ${prize}`)
                    .addFields(
                        { name: '📊 Result', value: 'No participants! Giveaway cancelled.', inline: false }
                    )
                    .setFooter({ text: 'Better luck next time! • created by VadikGoel (aka VYPER GAMER)' })
                    .setTimestamp();

                return giveawayMsg.edit({ embeds: [endEmbed], components: [] }).catch(() => {});
            }

            // Select random winners
            const selectedWinners = [];
            const winnersCount = Math.min(winners, participantArray.length);

            for (let i = 0; i < winnersCount; i++) {
                const randomIndex = Math.floor(Math.random() * participantArray.length);
                const winner = participantArray.splice(randomIndex, 1)[0];
                selectedWinners.push(winner);
            }

            const winnerMentions = selectedWinners.map(id => `<@${id}>`).join(', ');
            const winnerList = selectedWinners.map((id, idx) => `**${idx + 1}.** <@${id}>`).join('\n');

            const endEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🎉 GIVEAWAY ENDED 🎉')
                .setDescription(`**Prize:** ${prize}`)
                .addFields(
                    { name: '🏆 Winners', value: winnerList, inline: true },
                    { name: '👥 Participants', value: `${participantArray.length + selectedWinners.length}`, inline: true },
                    { name: '\u200b', value: '\u200b', inline: false },
                    { name: '🎊 Congratulations!', value: `Congratulations ${winnerMentions}! You won **${prize}**!\n\nYou'll be contacted by the host for claiming your prize.`, inline: false }
                )
                .setThumbnail('https://media.discordapp.net/attachments/1309879612108701706/1309879612108701706/celebration.png')
                .setFooter({ text: `Thanks for participating! • created by VadikGoel (aka VYPER GAMER)` })
                .setTimestamp();

            await giveawayMsg.edit({ embeds: [endEmbed], components: [] }).catch(() => {});

            // Send winner announcement to channel
            const announcementEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 GIVEAWAY WINNERS ANNOUNCED 🏆')
                .setDescription(`**Prize:** ${prize}\n\n${winnerMentions}`)
                .addFields(
                    { name: '🎁 Prize Details', value: prize, inline: false },
                    { name: '📌 Message Link', value: `[Jump to Giveaway](${giveawayMsg.url})`, inline: false }
                )
                .setFooter({ text: 'Congratulations to all winners! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            message.channel.send({ embeds: [announcementEmbed] });
        });

        // Send confirmation
        const confirmEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('✅ Giveaway Started!')
            .setDescription(`Giveaway for **${prize}** has been posted!`)
            .addFields(
                { name: '🏆 Prize', value: prize, inline: true },
                { name: '⏱️ Duration', value: `${duration}s`, inline: true },
                { name: '🏅 Winners', value: `${winners}`, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [confirmEmbed] });
    }
};
