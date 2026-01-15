const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'buy-stock',
    description: 'Buy shares of a stock',
    aliases: ['buystock', 'buystocks'],
    execute(message, args, db, config) {
        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Invalid Syntax')
                .setDescription('Usage: `/buy-stock SYMBOL QUANTITY`\n\nExample: `/buy-stock TECH 5`')
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const symbol = args[0].toUpperCase();
        const quantity = parseInt(args[1]);

        if (isNaN(quantity) || quantity <= 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Invalid Quantity')
                .setDescription('Quantity must be a positive number.')
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const stock = db.getStock(symbol);
        if (!stock) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Stock Not Found')
                .setDescription(`Stock symbol \`${symbol}\` does not exist.\nUse `/stocks` to see available stocks.`)
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const result = db.buyStock(message.author.id, message.guild.id, symbol, quantity, stock.currentPrice);

        if (!result.success) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Purchase Failed')
                .setDescription(result.error)
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const user = db.getUser(message.author.id, message.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Stock Purchase Successful!')
            .setDescription(`You bought ${quantity} share(s) of ${symbol}`)
            .setThumbnail('https://media.discordapp.net/attachments/1459907365750182095/1460091501387452714/wmremove-transformed_6.jpeg')
            .addFields(
                { name: 'Symbol', value: `\`${symbol}\``, inline: true },
                { name: 'Quantity', value: `\`${quantity}\``, inline: true },
                { name: 'Price per Share', value: `\`$${stock.currentPrice.toFixed(2)}\``, inline: true },
                { name: 'Total Cost', value: `\`${result.totalCost}\`\` ${config.currency.symbol}`, inline: true },
                { name: 'Balance Remaining', value: `\`${user.balance}\`\` ${config.currency.symbol}`, inline: true },
                { name: '\u200b', value: '━━━━━━━━━━━━━━━━━━━━━━', inline: false }
            )
            .setFooter({ text: 'Use /portfolio to view holdings • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
