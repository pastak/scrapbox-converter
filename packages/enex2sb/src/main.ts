import {parse, toScrapbox, guessTitle} from 'html2sb-compiler';

export default async (uploadImage, input, options) => {
  let xmlString = input;
  if (typeof input === 'object') {
    if (input instanceof Buffer) {
      xmlString = input.toString();
    } else if (typeof input !== 'string') {
      throw new Error('It allows string or buffer');
    }
  }

  const allNotes = parse(xmlString, {evernote: true});
  return await Promise.all(allNotes.map(async (noteTokens) => {
    if (noteTokens.resources) {
      await Promise.all(Object.keys(noteTokens.resources).map(async (resourceKey) => {
        const resource = noteTokens.resources[resourceKey];
        const mimeType = resource.mime;
        if (/^image\/.*/.test(mimeType)) {
          const file = new Buffer(resource.data, 'base64');
          const res = await uploadImage(file, options);
          noteTokens.resources[resourceKey] = {
            type: 'img',
            href: resource.href,
            src: res.data.permalink_url
          };
        }
      }).filter(Boolean));
    }
    const sb = toScrapbox(noteTokens);
    sb.title = guessTitle(noteTokens, sb, function (_pageTokens, foundTitle, template) {
      const named = 'Untitled';
      return foundTitle || template(named) || named;
    });
    return sb;
  }));
};
