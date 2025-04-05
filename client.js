(async () => {
  
  const args = require('args')
  const fs = require('fs')
  const crypto = require('crypto')
  const fileType = require('file-type')
  const path = require('path')

  args
    .option('path', 'The path of file that you want to upload')
    .option('length', 'The length bytes of file that you want to upload', 1024 * 1024)
    
  const flags = args.parse(process.argv)
  const filename = path.basename(flags.path)
    
  // Create upload with POST method (send metadata)
  const buffer = fs.readFileSync(flags.path)
  const { mime:type } = await fileType.fileTypeFromBuffer(buffer)
  
  
  const hash = crypto.createHash('md5')
  
  hash.update(buffer)
  
  const checksum = hash.copy().digest('hex')

  const encFilename = Buffer.from(filename).toString('base64')
  const encType = Buffer.from(type).toString('base64')
  const encChecksum = Buffer.from(checksum).toString('base64')

  const response = await fetch(`http://localhost:3000/v1/files`, {
    method: "POST",
    headers: {
      "Upload-Length": buffer.length,
      "Content-Length": 0,
      "Upload-Metadata": `filename ${encFilename},content-type ${encType},checksum ${encChecksum}`,
    },
  });
  console.log(response)
})()


// fs.open(flags.path, 'r', (err, fd) => {
//   if (err) {
//     console.log(err)
//   }

//   const res = fs.readSync(fd)
//   console.log('res', res)
  // fs.readFile('file.pdf', function(err, data) {
  //   var checksum = generateChecksum(data);
  //   console.log(checksum);
  // });
  
  // function generateChecksum(str, algorithm, encoding) {
  //     return crypto
  //         .createHash(algorithm || 'md5')
  //         .update(str, 'utf8')
  //         .digest(encoding || 'hex');
  // }
  

  // Get file id and send chunk of file iteratively

  // const buffer = Buffer.alloc(flags.length); // Allocate a 10-byte buffer

  // fs.read(fd, buffer, 0, flags.length, offset, (err, bytesRead, buffer) => {
  //   if (err) {
  //     console.error('Error reading file:', err);
  //     return;
  //   }

  //   console.log(`Bytes read: ${bytesRead}`);
  //   console.log(`Buffer content: ${buf.toString()}`);

  //   (async () => {
  //     const response = await fetch(`http://localhost:3000/v1/files/${flags.id}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Length": flags.length,
  //         "Content-Type": "application/offset+octet-stream"
  //       },
  //       body: buffer
  //     });
  //     console.log(response)
  //   })()

  //   fs.close(fd, (err) => {
  //       if (err) console.error('Error closing file:', err);
  //   });
  // });
// });
