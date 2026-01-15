const { EmbedBuilder } = require('discord.js');

const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'];

module.exports = {
    name: 'emojify',
    description: 'Convert text to emoji letters',
    aliases: ['emoji', 'emojitext'],
    execute(message, args, db, config) {
        const text = args.join(' ');
        
        if (!text) {
            const guildSettings = db.getGuildSettings(message.guild.id);
            const prefix = guildSettings.prefix || config.prefix;
            return message.reply(`Please provide text to emojify! Example: \`${prefix}emojify hello\``);
        }

        if (text.length > 50) {
            return message.reply('Text must be 50 characters or less!');
        }

        const emojified = text.toLowerCase().split('').map(char => {
            if (char >= 'a' && char <= 'z') {
                return `:regional_indicator_${char}:`;
            } else if (char >= '0' && char <= '9') {
                const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
                return `:${numbers[parseInt(char)]}:`;
            } else if (char === ' ') {
                return '   ';
            } else {
                return char;
            }
        }).join('');

        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('✨ Emojified Text')
            .setDescription(emojified)
            .setFooter({ text: `Requested by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
