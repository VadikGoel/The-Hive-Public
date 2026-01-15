const { EmbedBuilder } = require('discord.js');

const activeBets = new Map();

module.exports = {
    name: 'coinflippvp',
    aliases: ['cfpvp', 'duel'],
    description: 'Challenge another user to a coinflip duel!',
    execute(message, args, db, config) {
        const target = message.mentions.users.first();
        const bet = parseInt(args[1]);

        if (!target) {
            return message.reply(`Challenge someone to a coinflip! Example: \`${config.prefix}cfpvp @user 500\``);
        }

        if (target.id === message.author.id) {
            return message.reply('You cannot duel yourself!');
        }

        if (target.bot) {
            return message.reply('You cannot duel bots!');
        }

        if (!bet || bet <= 0 || isNaN(bet)) {
            return message.reply('Please specify a valid bet amount!');
        }

        if (bet < 100) {
            return message.reply('Minimum bet is 100 coins!');
        }

        const challenger = db.getUser(message.author.id, message.guild.id);
        const opponent = db.getUser(target.id, message.guild.id);

        if (!challenger || challenger.balance < bet) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        if (!opponent || opponent.balance < bet) {
            return message.reply(`${target.username} doesn't have enough ${config.currency.name}!`);
        }

        const betKey = `${message.guild.id}-${message.author.id}`;
        if (activeBets.has(betKey)) {
            return message.reply('You already have an active duel! Please wait for it to be accepted or expire.');
        }

        // Create bet
        activeBets.set(betKey, {
            challenger: message.author.id,
            opponent: target.id,
            bet: bet,
            guildId: message.guild.id
        });

        const embed = new EmbedBuilder()
            .setColor('#f39c12')
            .setTitle('⚔️ Coinflip Duel Challenge!')
            .setDescription(`${message.author} has challenged ${target} to a **coinflip duel**!`)
            .addFields(
                { name: '💰 Bet Amount', value: `${bet} ${config.currency.symbol}`, inline: true },
                { name: '🎯 Winner Takes', value: `${bet * 2} ${config.currency.symbol}`, inline: true }
            )
            .setFooter({ text: `${target.username}, type "${config.prefix}accept" to accept the duel! • created by VadikGoel (aka VYPER GAMER)` })
            .setTimestamp();

        message.reply({ embeds: [embed] });

        // Auto-expire after 60 seconds
        setTimeout(() => {
            if (activeBets.has(betKey)) {
                activeBets.delete(betKey);
                message.reply(`The coinflip duel between ${message.author} and ${target} has expired.`);
            }
        }, 60000);
    }
};

// Accept command should be added separately
module.exports.activeBets = activeBets;
