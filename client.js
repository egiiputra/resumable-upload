const args = require('args')
const fs = require('fs')

args
  .option('id', 'The id of file that you want to upload')
  .option('offset', 'The offset bytes of file that you want to upload', 0)
  .option('length', 'The length bytes of file that you want to upload', 1024 * 1024)

const flags = args.parse(process.argv)
console.log(flags)

fs.open(flags.id, 'ax', (err, fd) => {
  if (err) {
    console.log(err)
  }

  const buffer = Buffer.alloc(length); // Allocate a 10-byte buffer

  fs.read(fd, buffer, 0, flags.length, offset, (err, bytesRead, buffer) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    console.log(`Bytes read: ${bytesRead}`);
    console.log(`Buffer content: ${buf.toString()}`);

    (async () => {
      const response = await fetch(`http://localhost:3000/v1/files/${flags.id}`, {
        method: "PATCH",
        headers: {
          "Content-Length": chunk.size,
          "Content-Type": "application/offset+octet-stream"
        },
        body: chunk
      });
      console.log(response)

      fs.close(fd, (err) => {
          if (err) console.error('Error closing file:', err);
      });
    })()
  });
});
