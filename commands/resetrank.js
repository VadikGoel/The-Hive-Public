const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'resetrank',
    description: 'Reset rank/XP for a user or all users (Admin only)',
    aliases: ['resetlevel', 'resetxp'],
    async execute(message, args, db, config) {
        // Check permissions
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need **Administrator** permissions to use this command!');
        }

        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        const target = args[0]?.toLowerCase();

        if (!target || !['all', 'everyone'].includes(target) && !message.mentions.users.first()) {
            return message.reply(`Usage: \`${prefix}resetrank <@user>\` or \`${prefix}resetrank all\``);
        }

        // Reset for specific user
        if (message.mentions.users.first()) {
            const user = message.mentions.users.first();
            
            const confirmEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('⚠️ Confirm Rank Reset')
                .setDescription(`Are you sure you want to reset **${user.username}**'s rank?\n\n**This will:**\n• Reset level to 1\n• Reset XP to 0\n• Keep message count\n• Keep balance/bank`)
                .setFooter({ text: 'Reply with "confirm" within 30 seconds to proceed • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

            const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === 'confirm';
            const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

            collector.on('collect', async () => {
                // Reset the user's rank
                const stmt = db.prepare(`
                    UPDATE users 
                    SET level = 1, xp = 0 
                    WHERE userId = ? AND guildId = ?
                `);
                stmt.run(user.id, message.guild.id);

                const successEmbed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('✅ Rank Reset Complete')
                    .setDescription(`Successfully reset **${user.username}**'s rank!`)
                    .addFields(
                        { name: '👤 User', value: `${user}`, inline: true },
                        { name: '⭐ New Level', value: '1', inline: true },
                        { name: '📊 New XP', value: '0', inline: true }
                    )
                    .setTimestamp();

                message.reply({ embeds: [successEmbed] });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#95A5A6')
                        .setTitle('❌ Rank Reset Cancelled')
                        .setDescription('Operation timed out or was cancelled.')
                        .setTimestamp();

                    message.reply({ embeds: [cancelEmbed] });
                }
            });
        }

        // Reset for all users
        if (['all', 'everyone'].includes(target)) {
            const confirmEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚨 DANGER: Confirm Mass Rank Reset')
                .setDescription(`Are you sure you want to reset **EVERYONE'S** rank in this server?\n\n**This will:**\n• Reset ALL users to level 1\n• Reset ALL XP to 0\n• Keep message counts\n• Keep balances/banks\n\n**This action affects ${message.guild.memberCount} members!**`)
                .setFooter({ text: 'Reply with "CONFIRM RESET ALL" within 30 seconds to proceed • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

            const filter = m => m.author.id === message.author.id && m.content === 'CONFIRM RESET ALL';
            const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

            collector.on('collect', async () => {
                // Reset all users' ranks
                const stmt = db.prepare(`
                    UPDATE users 
                    SET level = 1, xp = 0 
                    WHERE guildId = ?
                `);
                stmt.run(message.guild.id);

                const successEmbed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('✅ Mass Rank Reset Complete')
                    .setDescription(`Successfully reset all user ranks in **${message.guild.name}**!`)
                    .addFields(
                        { name: '👥 Server', value: message.guild.name, inline: true },
                        { name: '🔄 Reset', value: 'All users → Level 1', inline: true }
                    )
                    .setTimestamp();

                message.reply({ embeds: [successEmbed] });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#95A5A6')
                        .setTitle('❌ Mass Rank Reset Cancelled')
                        .setDescription('Operation timed out or was cancelled.')
                        .setTimestamp();

                    message.reply({ embeds: [cancelEmbed] });
                }
            });
        }
    }
};
