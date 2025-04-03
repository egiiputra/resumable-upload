const args = require('args')
const fs = require('fs')

args
  .option('id', 'The id of file that you want to upload')
  .option('offset', 'The offset bytes of file that you want to upload', 0)
  .option('length', 'The length bytes of file that you want to upload', 1024 * 1024)

const flags = args.parse(process.argv)
console.log(flags)

fs.open(filepath, 'ax', (err, fd) => {
  if (err) {
    res.status(500).json({
      message: 'Creating file metadata failed',
    });
    return;
  }

  fs.write(fd, JSON.stringify(fileMetadata), (err) => {
    if (err) {
      res.status(500).json({
        message: 'Error writing to file',
      });
      return;
    }

    fs.close(fd, (err) => {
      if (err) {
        res.status(500).json({
          message: 'Error closing file',
        });
        return;
      }
      console.log(fileMetadata)
      res.status(201).set({
        'Location': `/v1/files/${filename}`
      }).send()
    });
  });
});

const chunk = file.slice(start, end);

const response = await fetch(`http://localhost:3000/v1/files/${flags.id}`, {
    method: "PATCH",
    headers: {
        "Content-Length": chunk.size,
        "Content-Type": "application/octet-stream"
    },
    body: chunk
});

const result = await response.json();
return result.uploaded; // Next byte position to send
}

async function uploadFile(file, fileID, chunkSize = 1024 * 1024) {
    let start = 0;
    while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        start = await uploadChunk(file, fileID, start, end);
    }
    console.log("Upload complete!");
}
