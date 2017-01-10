# scrapbox-converter

import scrapbox from markdown|html|enex files

## Support Format

- Markdown
- Enex
  - Evernote's XML Export Format
  - If you want to convert this format, you should set `GYAZO_ACCESS_TOKEN` to OAuth access token get from https://gyazo.com/oauth/applications .
    - It uses to upload embeded images to gyazo.com
- HTML (experimental)

## Usage

1. `% npm install -g scrapbox-converter`
2. `% scrapbox-converter ...YOUR_FILES_OR_DIRECTORYS_PATH > import.json`
3. Access `https://scrapbox.io/projects/YOUR_PROJECT/settings/page-data`
4. Select and upload `import.json` on Import Pages
5. Have fun on Scrapbox 🎉
