import remark from 'remark';
import {compiler} from './libs/compiler';

export default (input: string | Buffer): Promise<string> => {
  let mdText = input;
  if (typeof input === 'object') {
    if (input instanceof Buffer) {
      mdText = input.toString();
    } else if (typeof input !== 'string') {
      throw new Error('It allows string or buffer');
    }
  }
  return new Promise<string>((resolve, ng) => {
    // @ts-nocheck
    remark().use(compiler).process(mdText, (err, file) => {
      if (err) return ng(err);
      const result = (file + '') as string;
      return resolve(result);
    });
  });
};
