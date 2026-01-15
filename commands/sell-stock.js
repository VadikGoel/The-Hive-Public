const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sell-stock',
    description: 'Sell shares of a stock',
    aliases: ['sellstock', 'sellstocks'],
    execute(message, args, db, config) {
        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Invalid Syntax')
                .setDescription('Usage: `/sell-stock SYMBOL QUANTITY`\n\nExample: `/sell-stock TECH 5`')
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
                .setDescription(`Stock symbol \`${symbol}\` does not exist.`)
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const result = db.sellStock(message.author.id, message.guild.id, symbol, quantity, stock.currentPrice);

        if (!result.success) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Sale Failed')
                .setDescription(result.error)
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const user = db.getUser(message.author.id, message.guild.id);
        const profitColor = result.profit >= 0 ? '#00ff00' : '#ff0000';
        const profitIcon = result.profit >= 0 ? '📈 +' : '📉 ';

        const embed = new EmbedBuilder()
            .setColor(profitColor)
            .setTitle('✅ Stock Sale Successful!')
            .setDescription(`You sold ${quantity} share(s) of ${symbol}`)
            .setThumbnail('https://media.discordapp.net/attachments/1459907365750182095/1460091501387452714/wmremove-transformed_6.jpeg')
            .addFields(
                { name: 'Symbol', value: `\`${symbol}\``, inline: true },
                { name: 'Quantity Sold', value: `\`${quantity}\``, inline: true },
                { name: 'Sale Price per Share', value: `\`$${stock.currentPrice.toFixed(2)}\``, inline: true },
                { name: 'Total Return', value: `\`${result.totalReturn}\`\` ${config.currency.symbol}`, inline: true },
                { name: 'Profit/Loss', value: `\`${profitIcon}${Math.abs(result.profit).toFixed(0)}\`\` ${config.currency.symbol}`, inline: true },
                { name: 'Balance', value: `\`${user.balance}\`\` ${config.currency.symbol}`, inline: true },
                { name: '\u200b', value: '━━━━━━━━━━━━━━━━━━━━━━', inline: false }
            )
            .setFooter({ text: 'Use /portfolio to view holdings • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
