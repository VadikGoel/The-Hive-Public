const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rps',
    description: 'Play Rock Paper Scissors!',
    aliases: ['rockpaperscissors'],
    execute(message, args, db, config) {
        const choices = ['rock', 'paper', 'scissors'];
        const userChoice = args[0]?.toLowerCase();

        if (!userChoice || !choices.includes(userChoice)) {
            return message.reply('Choose rock, paper, or scissors! Example: `!rps rock`');
        }

        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        
        const emojis = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };

        let result;
        let color;
        
        if (userChoice === botChoice) {
            result = 'It\'s a Tie! 🤝';
            color = '#ffff00';
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = 'You Win! 🎉';
            color = '#00ff00';
            db.addCoins(message.author.id, message.guild.id, 50);
        } else {
            result = 'You Lose! 😢';
            color = '#ff0000';
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🎮 Rock Paper Scissors!')
            .setDescription(`# ${result}`)
            .addFields(
                { name: `${message.author.username} chose:`, value: `# ${emojis[userChoice]} ${userChoice.toUpperCase()}`, inline: true },
                { name: 'Bot chose:', value: `# ${emojis[botChoice]} ${botChoice.toUpperCase()}`, inline: true }
            )
            .setFooter({ 
                text: (result.includes('Win') ? 'You earned 50 coins!' : 'Better luck next time!') + ' • created by VadikGoel (aka VYPER GAMER)',
                iconURL: message.author.displayAvatarURL() 
            })
            .setTimestamp();

        // Add appropriate casino banner
        if (result.includes('Win') && config.images?.casinoWinBannerUrl) {
            embed.setImage(config.images.casinoWinBannerUrl);
        } else if (result.includes('Lose') && config.images?.casinoLossBannerUrl) {
            embed.setImage(config.images.casinoLossBannerUrl);
        }

        // Send to casino channel if set
        if (guildSettings.casinoChannelId) {
            const casinoChannel = message.guild.channels.cache.get(guildSettings.casinoChannelId);
            if (casinoChannel) {
                casinoChannel.send({ embeds: [embed] });
            } else {
                message.reply({ embeds: [embed] });
            }
        } else {
            message.reply({ embeds: [embed] });
        }
    }
};
