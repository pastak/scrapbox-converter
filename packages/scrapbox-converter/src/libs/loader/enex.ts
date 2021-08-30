import * as fs from "fs";
import enex2sb from "enex2sb";

export default async (path) => {
  try {
    return await enex2sb(fs.readFileSync(path));
  } catch (e) {
    if (!process.env.GYAZO_ACCESS_TOKEN) {
      throw new Error("You should set GYAZO_ACCESS_TOKEN");
    }
  }
};
