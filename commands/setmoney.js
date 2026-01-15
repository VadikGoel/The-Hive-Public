const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setmoney',
    description: 'Set/give money to a user (Admin only)',
    aliases: ['givemoney', 'addmoney'],
    execute(message, args, db, config) {
        // Admin-only check
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need **Administrator** permissions to use this command!');
        }

        const target = message.mentions.users.first();
        const amount = parseInt(args[1], 10);

        if (!target) {
            return message.reply(`Usage: \`${message.prefix || config.prefix}setmoney <@user> <amount>\``);
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply(`Please specify a valid amount! Usage: \`${message.prefix || config.prefix}setmoney <@user> <amount>\``);
        }

        // Get current balance
        let user = db.getUser(target.id, message.guild.id);
        if (!user) {
            // Create user if doesn't exist
            db.addUser(target.id, message.guild.id);
            user = db.getUser(target.id, message.guild.id);
        }

        const oldBalance = user.balance || 0;

        // Set the money
        db.removeCoins(target.id, message.guild.id, oldBalance);
        db.addCoins(target.id, message.guild.id, amount);
        db.save();

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 Money Updated')
            .setDescription(`Gave money to ${target}`)
            .addFields(
                { name: 'User', value: target.username, inline: true },
                { name: 'Old Balance', value: `${oldBalance.toLocaleString()} ${config.currency.symbol}`, inline: true },
                { name: 'New Balance', value: `${amount.toLocaleString()} ${config.currency.symbol}`, inline: true },
                { name: 'Change', value: `+${(amount - oldBalance).toLocaleString()} ${config.currency.symbol}`, inline: true }
            )
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Admin: ${message.author.username} • created by VadikGoel (aka VYPER GAMER)` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
