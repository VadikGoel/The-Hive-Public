const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'withdraw',
    description: 'Withdraw coins from your bank',
    aliases: ['with'],
    execute(message, args, db, config) {
        const user = db.createUser(message.author.id, message.guild.id);
        let amount;

        if (args[0]?.toLowerCase() === 'all') {
            amount = user.bank;
        } else {
            amount = parseInt(args[0]);
        }

        if (!amount || amount <= 0 || isNaN(amount)) {
            return message.reply('Please specify a valid amount! Use `all` to withdraw everything.');
        }

        if (user.bank < amount) {
            return message.reply(`You don't have enough ${config.currency.name} in your bank!`);
        }

        const stmt = db.prepare(`
            UPDATE users SET bank = bank - ? WHERE userId = ? AND guildId = ?
        `);
        stmt.run(amount, message.author.id, message.guild.id);
        
        db.addCoins(message.author.id, message.guild.id, amount);

        const updatedUser = db.getUser(message.author.id, message.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏦 Withdrawal Successful!')
            .setDescription(`You withdrew **${amount}** ${config.currency.symbol} from your bank!`)
            .addFields(
                { name: '💵 Wallet', value: `${updatedUser.balance} ${config.currency.symbol}`, inline: true },
                { name: '🏦 Bank', value: `${updatedUser.bank} ${config.currency.symbol}`, inline: true },
                { name: '💰 Total', value: `${updatedUser.balance + updatedUser.bank} ${config.currency.symbol}`, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Enjoy your money! • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        if (config.images?.bankBannerUrl) {
            embed.setImage(config.images.bankBannerUrl);
        }

        message.reply({ embeds: [embed] });
    }
};
