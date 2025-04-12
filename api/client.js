
(async () => {
  const args = require('args')
  const fs = require('fs')
  const crypto = require('crypto')
  const fileType = require('file-type')
  const path = require('path')

  args
    .option('path', 'The path of file that you want to upload')
    .option('length', 'The length bytes of file that you want to upload', 1024)
    
  const flags = args.parse(process.argv)
  const filename = path.basename(flags.path)
    
  // Create upload with POST method (send metadata)
  const buffer = fs.readFileSync(flags.path)
  console.log('file size ', buffer.length)
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
  // Stop if create upload failed
  if (response.status != 201) {
    throw Error('Create upload failed')
  }

  console.log(response.headers)
  const location = response.headers.get('location')
  console.log(location)

  let start_buf = 0
  // console.log()
  // 
  for (let i = 0; i < Math.ceil(buffer.length / flags.length); i++) {
    const chunk = buffer.subarray(start_buf, start_buf + flags.length)
    console.log(chunk)
    const response = await fetch(`http://localhost:3000${location}`, {
      method: "PATCH",
      headers: {
        "Content-Length": chunk.length,
        "Content-Type": "application/offset+octet-stream"
      },
      body: chunk
    });
    console.log(response)
    start_buf = parseInt(response.headers.get('upload-offset'))
  }
})()