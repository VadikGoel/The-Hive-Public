const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roll',
    description: 'Roll a custom sided dice',
    aliases: ['rolldice', 'customdice'],
    execute(message, args, db, config) {
        let sides = parseInt(args[0]) || 6;
        
        if (sides < 2) sides = 2;
        if (sides > 1000) sides = 1000;
        
        const result = Math.floor(Math.random() * sides) + 1;
        
        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🎲 Custom Dice Roll')
            .setDescription(`**You rolled a ${sides}-sided dice!**\n\n# 🎯 Result: ${result}`)
            .addFields(
                { name: '🎲 Dice Sides', value: `\`${sides}\``, inline: true },
                { name: '📊 Your Roll', value: `\`${result}\``, inline: true },
                { name: '📈 Percentage', value: `\`${((result/sides) * 100).toFixed(1)}%\``, inline: true }
            )
            .setFooter({ text: `${message.author.username}'s roll • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
