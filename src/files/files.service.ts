import { Injectable } from '@nestjs/common';
import { Buffer } from 'buffer';

@Injectable()
export class FilesService {
  parseMetadata(metadata: string): Record<string, string | number> {
    let metadataObj = {};
    const data = metadata.split(',');
    console.log(data)
    for (const kv of data) {
      if (kv == '') {
        continue;
      }

      try {
        console.log('kv', kv);
        let [key, value] = kv.split(' ');
        console.log('value', value)

        // Create a buffer from the string
        let bufferObj = Buffer.from(value, "base64");

        // Encode the Buffer as a utf8 string
        let decodedString = bufferObj.toString("utf8");
        metadataObj[key] = decodedString;
      } catch (e) {
        throw new Error('Invalid metadata')
      }
    }

    return metadataObj;
  }
}
