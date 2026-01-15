const { EmbedBuilder } = require('discord.js');
const shop = require('./shop.js');
const shopItems = shop.shopItems;

module.exports = {
    name: 'inventory',
    aliases: ['inv', 'items', 'bag'],
    description: 'View your inventory',
    execute(message, args, db, config) {
        const inventory = db.getInventory(message.author.id, message.guild.id);

        if (!inventory || inventory.length === 0) {
            return message.reply('Your inventory is empty! Check out the shop to buy items.');
        }

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle(`🎒 ${message.author.username}'s Inventory`)
            .setDescription(`Use \`${config.prefix}use <item_id>\` to use items\n\u200b`)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        let itemText = '';
        inventory.forEach(inv => {
            const item = shopItems.find(i => i.id === inv.itemId);
            if (item) {
                itemText += `**${item.name}** x${inv.quantity}\n`;
                itemText += `${item.description}\n`;
                itemText += `ID: \`${inv.itemId}\`\n\n`;
            }
        });

        embed.addFields({ name: '📦 Your Items', value: itemText || 'No items', inline: false });

        // Show active effects
        const effects = db.getActiveEffects(message.author.id, message.guild.id);
        if (effects && effects.length > 0) {
            let effectText = '';
            effects.forEach(effect => {
                const expiresAt = new Date(effect.expiresAt);
                const timeLeft = Math.ceil((expiresAt - Date.now()) / 60000); // minutes
                effectText += `**${effect.effectType.toUpperCase()}** - ${effect.multiplier}x (${timeLeft}min left)\n`;
            });
            embed.addFields({ name: '✨ Active Effects', value: effectText, inline: false });
        }

        if (config.images?.inventoryBannerUrl) {
            embed.setImage(config.images.inventoryBannerUrl);
        }

        message.reply({ embeds: [embed] });
    }
};
