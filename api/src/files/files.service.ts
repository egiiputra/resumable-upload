import { Injectable } from '@nestjs/common';
import { Buffer } from 'buffer';

import { FileMetadata } from './filemetadata.interface';

@Injectable()
export class FilesService {
  parseMetadata(metadata: string): FileMetadata {
    const metadataObj = {} as FileMetadata;
    const data = metadata.split(',');
    for (const kv of data) {
      if (kv == '') {
        continue;
      }

      try {
        const [key, value] = kv.split(' ');

        // Create a buffer from the string
        const bufferObj = Buffer.from(value, 'base64');

        // Encode the Buffer as a utf8 string
        const decodedString = bufferObj.toString('utf8');
        metadataObj[key] = decodedString;
      } catch (e) {
        throw new Error('Invalid metadata');
      }
    }

    return metadataObj;
  }
}
