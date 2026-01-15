const { EmbedBuilder } = require('discord.js');

const responses = [
    '🟢 Yes, definitely!',
    '🟢 It is certain!',
    '🟢 Without a doubt!',
    '🟢 Most likely!',
    '🟢 Outlook good!',
    '🟢 Yes!',
    '🟡 Reply hazy, try again',
    '🟡 Ask again later',
    '🟡 Better not tell you now',
    '🟡 Cannot predict now',
    '🟡 Concentrate and ask again',
    '🔴 Don\'t count on it',
    '🔴 My reply is no',
    '🔴 Outlook not so good',
    '🔴 Very doubtful',
    '🔴 No way!',
    '🟣 Maybe...',
    '🟣 I have my doubts'
];

module.exports = {
    name: '8ball',
    description: 'Ask the magic 8ball a question',
    aliases: ['eightball'],
    execute(message, args, db, config) {
        const question = args.join(' ');
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        if (!question) {
            return message.reply(`Please ask a question! Example: \`${prefix}8ball Will I win?\``);
        }

        const answer = responses[Math.floor(Math.random() * responses.length)];
        
        const color = answer.startsWith('🟢') ? '#00ff00' 
                    : answer.startsWith('🔴') ? '#ff0000'
                    : answer.startsWith('🟡') ? '#ffff00'
                    : '#9b59b6';

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🔮 Magic 8-Ball')
            .addFields(
                { name: '❓ Question', value: question, inline: false },
                { name: '💭 Answer', value: `# ${answer}`, inline: false }
            )
            .setThumbnail('https://i.imgur.com/oKXs5qh.png')
            .setFooter({ text: `Asked by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
