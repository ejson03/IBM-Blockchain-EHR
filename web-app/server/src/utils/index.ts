import * as path from "path";
import * as fs from "fs";
import { IKeyValueAttribute } from "fabric-ca-client";

export function processFileFromDir(_path: string) {
  const __path = path.join(process.cwd(), _path);
  const _config = fs.readFileSync(__path, "utf8");
  return JSON.parse(_config);
}

export function generateKVAttributes(data: any) {
  const KVPairs: IKeyValueAttribute[] = [];
  Object.keys(data).forEach((key) => {
    let kv: IKeyValueAttribute = {
      ecert: true,
      name: key,
      value: data[key],
    };
    KVPairs.push(kv);
  });
  return KVPairs;
}
