const { EmbedBuilder } = require('discord.js');

const shopItems = [
    // Boosters & Multipliers
    { id: 'xp_booster', name: '🔥 XP Booster', price: 5000, description: '2x XP for 1 hour!', type: 'booster', duration: 3600000, effect: 'xp', multiplier: 2 },
    { id: 'coin_multi', name: '💰 Coin Multiplier', price: 8000, description: '1.5x coin earnings for 24 hours!', type: 'booster', duration: 86400000, effect: 'coins', multiplier: 1.5 },
    { id: 'lucky_charm', name: '🍀 Lucky Charm', price: 10000, description: 'Better odds in casino games (permanent)!', type: 'item' },
    
    // Profile Items
    { id: 'banner_gold', name: '🎨 Golden Banner', price: 15000, description: 'Show off with a golden profile banner!', type: 'cosmetic' },
    { id: 'banner_diamond', name: '💎 Diamond Banner', price: 25000, description: 'Shine with a diamond profile banner!', type: 'cosmetic' },
    { id: 'badge_vip', name: '⭐ VIP Badge', price: 20000, description: 'Display a VIP badge on your profile!', type: 'cosmetic' },
    { id: 'badge_legend', name: '👑 Legend Badge', price: 50000, description: 'Ultimate legend badge!', type: 'cosmetic' },
    
    // Utility Items
    { id: 'rob_shield', name: '🛡️ Rob Protection', price: 7500, description: 'Cannot be robbed for 24 hours!', type: 'protection', duration: 86400000 },
    { id: 'cooldown_pass', name: '⏰ Cooldown Pass', price: 3000, description: 'Skip daily cooldown once!', type: 'consumable' }
];

module.exports = {
    name: 'shop',
    description: 'View the server shop',
    execute(message, args, db, config) {
        const bannerUrl = config.images?.shopBannerUrl || null;
        
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('🏪 Premium Shop')
            .setDescription(`Use \`${config.prefix}buy <item_id>\` to purchase | 💡 **15% tax applied**\n\u200b`)
            .setFooter({ text: 'Prices shown exclude tax | Use /buy <item_id> to purchase • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        if (bannerUrl) embed.setImage(bannerUrl);

        // Group items by category
        const boosters = shopItems.filter(i => i.type === 'booster');
        const cosmetics = shopItems.filter(i => i.type === 'cosmetic');
        const utilities = shopItems.filter(i => i.type === 'item' || i.type === 'protection' || i.type === 'consumable');

        // Display items in 2 columns for better width usage
        if (boosters.length > 0) {
            const mid = Math.ceil(boosters.length / 2);
            const col1 = boosters.slice(0, mid);
            const col2 = boosters.slice(mid);
            
            let text1 = '';
            col1.forEach(item => {
                const taxPrice = Math.floor(item.price * 1.15);
                text1 += `**${item.name}**\n💰 ${item.price} *(${taxPrice} with tax)*\n📝 ${item.description}\n🆔 \`${item.id}\`\n\u200b\n`;
            });
            
            let text2 = '';
            col2.forEach(item => {
                const taxPrice = Math.floor(item.price * 1.15);
                text2 += `**${item.name}**\n💰 ${item.price} *(${taxPrice} with tax)*\n📝 ${item.description}\n🆔 \`${item.id}\`\n\u200b\n`;
            });
            
            embed.addFields({ name: '🚀 Boosters & Multipliers', value: text1 || '\u200b', inline: true });
            if (text2) embed.addFields({ name: '\u200b', value: text2, inline: true });
        }

        if (utilities.length > 0) {
            const mid = Math.ceil(utilities.length / 2);
            const col1 = utilities.slice(0, mid);
            const col2 = utilities.slice(mid);
            
            let text1 = '';
            col1.forEach(item => {
                const taxPrice = Math.floor(item.price * 1.15);
                text1 += `**${item.name}**\n💰 ${item.price} *(${taxPrice} with tax)*\n📝 ${item.description}\n🆔 \`${item.id}\`\n\u200b\n`;
            });
            
            let text2 = '';
            col2.forEach(item => {
                const taxPrice = Math.floor(item.price * 1.15);
                text2 += `**${item.name}**\n💰 ${item.price} *(${taxPrice} with tax)*\n📝 ${item.description}\n🆔 \`${item.id}\`\n\u200b\n`;
            });
            
            embed.addFields({ name: '🎯 Utility Items', value: text1 || '\u200b', inline: true });
            if (text2) embed.addFields({ name: '\u200b', value: text2, inline: true });
        }

        if (cosmetics.length > 0) {
            const mid = Math.ceil(cosmetics.length / 2);
            const col1 = cosmetics.slice(0, mid);
            const col2 = cosmetics.slice(mid);
            
            let text1 = '';
            col1.forEach(item => {
                const taxPrice = Math.floor(item.price * 1.15);
                text1 += `**${item.name}**\n💰 ${item.price} *(${taxPrice} with tax)*\n📝 ${item.description}\n🆔 \`${item.id}\`\n\u200b\n`;
            });
            
            let text2 = '';
            col2.forEach(item => {
                const taxPrice = Math.floor(item.price * 1.15);
                text2 += `**${item.name}**\n💰 ${item.price} *(${taxPrice} with tax)*\n📝 ${item.description}\n🆔 \`${item.id}\`\n\u200b\n`;
            });
            
            embed.addFields({ name: '✨ Profile Items', value: text1 || '\u200b', inline: true });
            if (text2) embed.addFields({ name: '\u200b', value: text2, inline: true });
        }

        message.reply({ embeds: [embed] });
    },
    shopItems // Export for buy command
};
