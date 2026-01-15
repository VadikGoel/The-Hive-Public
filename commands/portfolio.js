const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'portfolio',
    description: 'View your stock portfolio',
    aliases: ['myportfolio', 'stocks-portfolio'],
    execute(message, args, db, config) {
        const target = message.mentions.users.first() || message.author;
        const portfolio = db.getPortfolio(target.id, message.guild.id);

        if (!portfolio || portfolio.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('📈 Empty Portfolio')
                .setDescription(`${target === message.author ? 'You don\'t have' : `${target.username} doesn't have`} any stocks yet!`)
                .setFooter({ text: 'Use /buy-stock to start investing • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setAuthor({ name: `${target.username}'s Stock Portfolio`, iconURL: target.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .setFooter({ text: 'Use /stocks to check current prices • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        let totalValue = 0;
        let totalCost = 0;
        let description = '';

        for (const holding of portfolio) {
            const stock = db.getStock(holding.stockSymbol);
            if (!stock) continue;

            const currentValue = stock.currentPrice * holding.quantity;
            const initialCost = holding.boughtPrice * holding.quantity;
            const profit = currentValue - initialCost;
            const profitPercent = (profit / initialCost * 100).toFixed(2);
            const profitIcon = profit >= 0 ? '📈' : '📉';

            totalValue += currentValue;
            totalCost += initialCost;

            description += `**${holding.stockSymbol}** | Qty: \`${holding.quantity}\`\n`;
            description += `  Bought: \`$${holding.boughtPrice.toFixed(2)}\` | Current: \`$${stock.currentPrice.toFixed(2)}\`\n`;
            description += `  Value: \`${currentValue.toFixed(0)}\`\` ${config.currency.symbol} | ${profitIcon} \`${profit >= 0 ? '+' : ''}${profit.toFixed(0)}\`\` (${profitPercent}%)\n\n`;
        }

        embed.setDescription(description);

        const totalProfit = totalValue - totalCost;
        const totalProfitPercent = (totalProfit / totalCost * 100).toFixed(2);
        const totalProfitIcon = totalProfit >= 0 ? '📈' : '📉';

        embed.addFields(
            { name: 'Total Holdings', value: `\`${portfolio.length}\` stocks`, inline: true },
            { name: 'Total Cost', value: `\`${totalCost.toFixed(0)}\`\` ${config.currency.symbol}`, inline: true },
            { name: 'Current Value', value: `\`${totalValue.toFixed(0)}\`\` ${config.currency.symbol}`, inline: true },
            { name: 'Total P/L', value: `${totalProfitIcon} \`${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(0)}\`\` ${config.currency.symbol}`, inline: true },
            { name: 'Return %', value: `\`${totalProfitPercent}%\``, inline: true }
        );

        message.reply({ embeds: [embed] });
    }
};
