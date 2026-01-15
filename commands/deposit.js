const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'deposit',
    description: 'Deposit coins into your bank',
    aliases: ['dep'],
    execute(message, args, db, config) {
        const user = db.createUser(message.author.id, message.guild.id);
        let amount;

        if (args[0]?.toLowerCase() === 'all') {
            amount = user.balance;
        } else {
            amount = parseInt(args[0]);
        }

        if (!amount || amount <= 0 || isNaN(amount)) {
            return message.reply('Please specify a valid amount! Use `all` to deposit everything.');
        }

        if (user.balance < amount) {
            return message.reply(`You don't have enough ${config.currency.name} in your wallet!`);
        }

        db.removeCoins(message.author.id, message.guild.id, amount);
        
        const stmt = db.prepare(`
            UPDATE users SET bank = bank + ? WHERE userId = ? AND guildId = ?
        `);
        stmt.run(amount, message.author.id, message.guild.id);

        const updatedUser = db.getUser(message.author.id, message.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏦 Deposit Successful!')
            .setDescription(`You deposited **${amount}** ${config.currency.symbol} into your bank!`)
            .addFields(
                { name: '💵 Wallet', value: `${updatedUser.balance} ${config.currency.symbol}`, inline: true },
                { name: '🏦 Bank', value: `${updatedUser.bank} ${config.currency.symbol}`, inline: true },
                { name: '💰 Total', value: `${updatedUser.balance + updatedUser.bank} ${config.currency.symbol}`, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Your money is safe in the bank! • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        if (config.images?.bankBannerUrl) {
            embed.setImage(config.images.bankBannerUrl);
        }

        message.reply({ embeds: [embed] });
    }
};
