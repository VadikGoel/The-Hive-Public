const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcomeimage',
    description: 'Set the server welcome image (any member can change)',
    aliases: ['setwelcomeimage','welcomebanner','setwelcomebanner'],
    async execute(message, args, db, config) {
        if (config.features && config.features.allowPublicWelcomeImageEdit === false) {
            return message.reply('Changing the welcome image is currently disabled by the server.');
        }
        // Accept first image attachment or URL in args[0]
        let imageUrl = null;
        const att = message.attachments?.first();
        if (att && att.contentType && att.contentType.startsWith('image/')) {
            imageUrl = att.url;
        } else if (args[0] && /^https?:\/\//i.test(args[0])) {
            imageUrl = args[0];
        }

        if (!imageUrl) {
            return message.reply('Attach an image or provide an image URL. Example: `,welcomeimage https://.../banner.png`');
        }

        // Basic validation: only allow common image extensions
        const ok = imageUrl.match(/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i);
        if (!ok) {
            return message.reply('Please provide a valid image URL ending in .png, .jpg, .jpeg, .gif, or .webp');
        }

        try {
            db.setWelcomeCustomization(message.guild.id, 'imageUrl', imageUrl);
            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('Welcome Image Updated')
                .setDescription('The server welcome image has been updated. New members will see this banner.')
                .setImage(imageUrl)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('Failed to Update Welcome Image')
                .setDescription(String(err?.message || err))
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }
    }
};
