const { EmbedBuilder } = require('discord.js');
const { shopItems } = require('./shop.js');

const TAX_RATE = 0.15; // 15% tax

module.exports = {
    name: 'buy',
    description: 'Buy an item from the shop',
    execute(message, args, db, config) {
        const itemId = args[0]?.toLowerCase();

        if (!itemId) {
            return message.reply(`Please specify an item to buy! Use \`${config.prefix}shop\` to see available items.`);
        }

        const item = shopItems.find(i => i.id === itemId);

        if (!item) {
            return message.reply('Item not found! Check the shop for available items.');
        }

        const user = db.getUser(message.author.id, message.guild.id);
        const tax = Math.floor(item.price * TAX_RATE);
        const totalPrice = item.price + tax;

        if (!user || user.balance < totalPrice) {
            return message.reply(`You don't have enough ${config.currency.name}! You need ${totalPrice} ${config.currency.symbol} (${item.price} + ${tax} tax).`);
        }

        const success = db.removeCoins(message.author.id, message.guild.id, totalPrice);

        if (!success) {
            return message.reply('Purchase failed!');
        }

        // Add item to inventory
        if (item.type === 'booster' || item.type === 'protection' || item.type === 'item' || item.type === 'cosmetic' || item.type === 'consumable') {
            db.addItem(message.author.id, message.guild.id, itemId, 1);
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Purchase Successful!')
            .setDescription(`You bought **${item.name}**!`)
            .addFields(
                { name: 'Item', value: item.name, inline: true },
                { name: 'Base Price', value: `${item.price} ${config.currency.symbol}`, inline: true },
                { name: 'Tax (15%)', value: `${tax} ${config.currency.symbol}`, inline: true },
                { name: 'Total Paid', value: `${totalPrice} ${config.currency.symbol}`, inline: true },
                { name: 'New Balance', value: `${user.balance - totalPrice} ${config.currency.symbol}`, inline: true }
            )
            .setFooter({ text: `Use ${config.prefix}inventory to view your items! • created by VadikGoel (aka VYPER GAMER)` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
