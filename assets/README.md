# Assets

Place your banner images under `assets/banners/`.

- Configure usage in `config.json` under the `assets` section.
- The bot will prefer local banners when `useLocalBanners` is true.
- `defaultBannerFile` should match a file in `assets/banners/`.
- If the file is missing, the bot falls back to a remote default banner URL.

Example:
- assets/banners/bee_welcome.jpg
- assets/banners/minimal_welcome.png
