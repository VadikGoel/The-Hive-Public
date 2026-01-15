const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'resetmoney',
    description: 'Reset balance/bank for a user or all users (Admin only)',
    aliases: ['resetbalance', 'resetcoins'],
    async execute(message, args, db, config) {
        // Check permissions
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need **Administrator** permissions to use this command!');
        }

        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        const target = args[0]?.toLowerCase();

        if (!target || !['all', 'everyone'].includes(target) && !message.mentions.users.first()) {
            return message.reply(`Usage: \`${prefix}resetmoney <@user>\` or \`${prefix}resetmoney all\``);
        }

        const startingBalance = config.currency?.startingBalance || 100;

        // Reset for specific user
        if (message.mentions.users.first()) {
            const user = message.mentions.users.first();
            const currentData = db.getUser(user.id, message.guild.id);
            
            const confirmEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('⚠️ Confirm Money Reset')
                .setDescription(`Are you sure you want to reset **${user.username}**'s money?\n\n**Current Balance:**\n💰 Wallet: ${currentData?.balance || 0}\n🏦 Bank: ${currentData?.bank || 0}\n\n**After Reset:**\n💰 Wallet: ${startingBalance}\n🏦 Bank: 0`)
                .setFooter({ text: 'Reply with "confirm" within 30 seconds to proceed • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

            const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === 'confirm';
            const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

            collector.on('collect', async () => {
                // Reset the user's money
                const stmt = db.prepare(`
                    UPDATE users 
                    SET balance = ?, bank = 0 
                    WHERE userId = ? AND guildId = ?
                `);
                stmt.run(startingBalance, user.id, message.guild.id);

                const successEmbed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('✅ Money Reset Complete')
                    .setDescription(`Successfully reset **${user.username}**'s balance!`)
                    .addFields(
                        { name: '👤 User', value: `${user}`, inline: true },
                        { name: '💰 New Wallet', value: `${startingBalance}`, inline: true },
                        { name: '🏦 New Bank', value: '0', inline: true }
                    )
                    .setTimestamp();

                message.reply({ embeds: [successEmbed] });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#95A5A6')
                        .setTitle('❌ Money Reset Cancelled')
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
                .setTitle('🚨 DANGER: Confirm Mass Money Reset')
                .setDescription(`Are you sure you want to reset **EVERYONE'S** money in this server?\n\n**This will:**\n• Reset ALL wallets to ${startingBalance}\n• Reset ALL banks to 0\n• Keep levels and XP\n• Keep message counts\n\n**This action affects ${message.guild.memberCount} members!**`)
                .setFooter({ text: 'Reply with "CONFIRM RESET ALL" within 30 seconds to proceed • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

            const filter = m => m.author.id === message.author.id && m.content === 'CONFIRM RESET ALL';
            const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

            collector.on('collect', async () => {
                // Reset all users' money
                const stmt = db.prepare(`
                    UPDATE users 
                    SET balance = ?, bank = 0 
                    WHERE guildId = ?
                `);
                stmt.run(startingBalance, message.guild.id);

                const successEmbed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('✅ Mass Money Reset Complete')
                    .setDescription(`Successfully reset all user balances in **${message.guild.name}**!`)
                    .addFields(
                        { name: '👥 Server', value: message.guild.name, inline: true },
                        { name: '🔄 Reset', value: `All users → ${startingBalance} coins`, inline: true }
                    )
                    .setTimestamp();

                message.reply({ embeds: [successEmbed] });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#95A5A6')
                        .setTitle('❌ Mass Money Reset Cancelled')
                        .setDescription('Operation timed out or was cancelled.')
                        .setTimestamp();

                    message.reply({ embeds: [cancelEmbed] });
                }
            });
        }
    }
};
