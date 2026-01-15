const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: 'welcome',
    description: 'Customize welcome messages for your server (Admin only)',
    execute(message, args, db, config) {
        // Check if user has admin permissions
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission to use this command!');
        }

        // Handle slash command options
        const slashAction = message.slashOptions?.action;
        const subcommand = slashAction || args[0]?.toLowerCase();
        const guildSettings = db.getGuildSettings(message.guild.id);

        if (!subcommand || subcommand === 'settings') {
            // Show current settings
            const welcomeSettings = db.getWelcomeCustomization(message.guild.id);
            
            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('🎨 Welcome Message Customization')
                .setDescription(`Current settings for **${message.guild.name}**`)
                .addFields(
                    { name: '📍 Channel', value: guildSettings.welcomeChannelId ? `<#${guildSettings.welcomeChannelId}>` : 'Not set', inline: true },
                    { name: '✅ Status', value: guildSettings.welcomeEnabled ? 'Enabled' : 'Disabled', inline: true },
                    { name: '🎨 Color', value: welcomeSettings.color || '#FF1493', inline: true },
                    { name: '📝 Title', value: welcomeSettings.title || 'Default', inline: false },
                    { name: '💬 Description', value: welcomeSettings.description ? (welcomeSettings.description.substring(0, 100) + '...') : 'Default', inline: false },
                    { name: '🖼️ Image URL', value: welcomeSettings.imageUrl || 'Default', inline: false },
                    { name: '👣 Footer', value: welcomeSettings.footer || 'Default', inline: false }
                )
                .addFields({
                    name: '⚙️ Customization Commands',
                    value: `\`${config.prefix}welcome title <text>\` - Set custom title\n\`${config.prefix}welcome description <text>\` - Set description\n\`${config.prefix}welcome color <hex>\` - Set embed color\n\`${config.prefix}welcome image <url>\` - Set image URL\n\`${config.prefix}welcome footer <text>\` - Set footer text\n\`${config.prefix}welcome reset\` - Reset to defaults\n\`${config.prefix}welcome preview\` - Preview current design`,
                    inline: false
                })
                .setFooter({ text: 'Use placeholders: {user}, {server}, {count} • Today at 08:32 AM • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        switch (subcommand) {
            case 'enable':
                db.setWelcomeEnabled(message.guild.id, true);
                return message.reply('✅ Welcome messages have been **enabled**!');

            case 'disable':
                db.setWelcomeEnabled(message.guild.id, false);
                return message.reply('✅ Welcome messages have been **disabled**!');

            case 'setchannel':
                const channelOption = message.mentions.channels.first() || message.channel;
                db.setWelcomeChannel(message.guild.id, channelOption.id);
                return message.reply(`✅ Welcome channel set to ${channelOption}!`);

            case 'setmessage':
                return message.reply('Use the individual commands to customize:\n`welcome title <text>`\n`welcome description <text>`\n`welcome footer <text>`');

            case 'test':
                // Send a test welcome message in the current channel
                const testEmbed = new EmbedBuilder()
                    .setColor('#FF69B4')
                    .setTitle('🎉 Test Welcome Message')
                    .setDescription(`This is how your welcome message will look!`)
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: message.guild.name + ' • created by VadikGoel (aka VYPER GAMER)', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                return message.reply({ embeds: [testEmbed] });

            case 'title':
                const title = args.slice(1).join(' ');
                if (!title || title.length > 256) {
                    return message.reply('Please provide a title (max 256 characters)!\nExample: `welcome title ✨ Welcome to {server}! ✨`\n\nPlaceholders: {user}, {server}, {count}');
                }

                db.setWelcomeCustomization(message.guild.id, 'title', title);
                
                const titleEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Title Updated!')
                    .setDescription(`New title:\n> ${title}`)
                    .setFooter({ text: 'Use {user}, {server}, {count} as placeholders • created by VadikGoel (aka VYPER GAMER)' });
                
                message.reply({ embeds: [titleEmbed] });
                break;

            case 'description':
                const desc = args.slice(1).join(' ');
                if (!desc || desc.length > 2000) {
                    return message.reply('Please provide a description (max 2000 characters)!\nExample: `welcome description Welcome {user}! You are member #{count}!`\n\nPlaceholders: {user}, {server}, {count}');
                }

                db.setWelcomeCustomization(message.guild.id, 'description', desc);
                
                const descEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Description Updated!')
                    .setDescription(`New description:\n> ${desc}`)
                    .setFooter({ text: 'Use {user}, {server}, {count} as placeholders • created by VadikGoel (aka VYPER GAMER)' });
                
                message.reply({ embeds: [descEmbed] });
                break;

            case 'color':
                let color = args[1];
                if (!color) {
                    return message.reply('Please provide a hex color!\nExample: `welcome color #FF69B4`\n\nPopular colors:\n`#FF1493` - Pink\n`#9B59B6` - Purple\n`#3498DB` - Blue\n`#2ECC71` - Green\n`#F39C12` - Orange\n`#E74C3C` - Red');
                }

                if (!color.startsWith('#')) color = '#' + color;
                if (!/^#[0-9A-F]{6}$/i.test(color)) {
                    return message.reply('Invalid hex color! Use format: `#FF69B4`');
                }

                db.setWelcomeCustomization(message.guild.id, 'color', color);
                
                const colorEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle('✅ Color Updated!')
                    .setDescription(`New color: ${color}`)
                    .setFooter({ text: 'This is how your welcome message will look! • created by VadikGoel (aka VYPER GAMER)' });
                
                message.reply({ embeds: [colorEmbed] });
                break;

            case 'image':
                const imageUrl = args[1];
                if (!imageUrl) {
                    return message.reply('Please provide an image URL!\nExample: `welcome image https://i.imgur.com/example.png`\n\nOr use `welcome image none` to remove image');
                }

                if (imageUrl.toLowerCase() === 'none') {
                    db.setWelcomeCustomization(message.guild.id, 'imageUrl', null);
                    return message.reply('✅ Image removed from welcome message!');
                }

                if (!imageUrl.startsWith('http')) {
                    return message.reply('Please provide a valid URL starting with http:// or https://');
                }

                db.setWelcomeCustomization(message.guild.id, 'imageUrl', imageUrl);
                
                const imgEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Image Updated!')
                    .setDescription(`New image URL set!`)
                    .setImage(imageUrl);
                
                message.reply({ embeds: [imgEmbed] });
                break;

            case 'footer':
                const footer = args.slice(1).join(' ');
                if (!footer || footer.length > 2048) {
                    return message.reply('Please provide footer text (max 2048 characters)!\nExample: `welcome footer Welcome to {server}!`\n\nPlaceholders: {user}, {server}, {count}');
                }

                db.setWelcomeCustomization(message.guild.id, 'footer', footer);
                
                const footerEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Footer Updated!')
                    .setDescription(`New footer:\n> ${footer}`)
                    .setFooter({ text: 'Use {user}, {server}, {count} as placeholders • created by VadikGoel (aka VYPER GAMER)' });
                
                message.reply({ embeds: [footerEmbed] });
                break;

            case 'preview':
                const previewSettings = db.getWelcomeCustomization(message.guild.id);
                const preview = createPreviewEmbed(message.member, message.guild, previewSettings);
                
                message.reply({ 
                    content: '**Preview of your welcome message:**',
                    embeds: [preview] 
                });
                break;

            case 'reset':
                db.resetWelcomeCustomization(message.guild.id);
                message.reply('✅ Welcome message customization has been reset to defaults!');
                break;

            default:
                message.reply(`Unknown subcommand! Use \`${config.prefix}welcome settings\` to see all options.`);
        }
    }
};

function createPreviewEmbed(member, guild, settings) {
    const memberCount = guild.memberCount;
    
    // Apply placeholders
    let title = settings.title || '✨ ═══════════════════════ ✨';
    let description = settings.description || `### 🌟 Welcome to the Community! 🌟\n\n> {user}\n\n**Thank you for joining us!**\n*We're so excited to have you here!*\n\n━━━━━━━━━━━━━━━━━━━━━\n\n🎊 **You are member number {count}!** 🎊\n\n━━━━━━━━━━━━━━━━━━━━━\n\n*Enjoy your stay and have fun!* 💫`;
    let footer = settings.footer || `{server} • ${new Date().toLocaleDateString()}`;
    
    title = title.replace(/{user}/g, member.user.username)
                 .replace(/{server}/g, guild.name)
                 .replace(/{count}/g, memberCount);
    
    description = description.replace(/{user}/g, member.toString())
                             .replace(/{server}/g, guild.name)
                             .replace(/{count}/g, memberCount);
    
    footer = footer.replace(/{user}/g, member.user.username)
                   .replace(/{server}/g, guild.name)
                   .replace(/{count}/g, memberCount);

    const embed = new EmbedBuilder()
        .setColor(settings.color || '#FF1493')
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setFooter({ 
            text: footer + ' • created by VadikGoel (aka VYPER GAMER)',
            iconURL: guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

    if (settings.imageUrl) {
        embed.setImage(settings.imageUrl);
    } else {
        embed.setImage('https://i.imgur.com/wSTFkRM.png');
    }

    return embed;
}
