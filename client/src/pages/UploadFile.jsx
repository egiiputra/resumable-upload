import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import '../App.css'
import { calculateMD5 } from '../util.js'
import { useNavigate } from 'react-router-dom'

const host_url = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`

export default function UploadFile() {
  const [uuid, setUuid] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadURL, setUploadURL] = useState('')

  // const url = 'http://localhost:3000/v1/files/jfkldjsljfld'

  const navigate = useNavigate()

  useEffect(() => {
    // Only add the event listener if there's an active upload
    if (uploading) {
      const handleBeforeUnload = (e) => {
        const confirmationMessage = "You have an upload in progress. Are you sure you want to leave?";
        e.preventDefault();
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [uploading]);

  const handleRedirect = async () => {
    console.log(uuid)
    if (uuid.trim()) {
      return navigate(`/files/${uuid}`)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      await setSelectedFile(file)
      setProgress(0)
    }
  }

  const initiateUpload = async () => {
    const encFilename = window.btoa(selectedFile.name)
    const encType = window.btoa(selectedFile.type)

    const checkSum = await calculateMD5(selectedFile)
    const encChecksum = window.btoa(checkSum)

    const metadata = `filename ${encFilename},content-type ${encType},checksum ${encChecksum}`

    // Initiate upload
    const response = await fetch(
      `${host_url}/v1/files`, {
        method: 'POST',
        headers: {
          'Upload-Metadata': metadata,
          'Upload-Length': selectedFile.size
        }
      }
    )

    if (response.status != 201) {
    }
    
    setUploadURL(response.headers.get('Location'))

    handleUpload(0, response.headers.get('Location'))
  }

  const resumeUpload = async () => {
    const response = await fetch(
      `${host_url}${uploadURL}`, {
        method: "HEAD",
      }
    );

    if (response.headers.get('Is-Completed')) {
      return
    }
    handleUpload(
      parseInt(response.headers.get('Upload-Offset'), 10),
      uploadURL
    )
  }

  const handleUpload = async (startBuf, uploadUrl) => {
    if (!selectedFile) return
    
    // setUploading(true)
    let isCompleted = false

    // Upload chunk
    const chunkSize = 1*1024*1024

    let currentProgress = Math.round(startBuf/selectedFile.size)
    while (!isCompleted) {
      let end = startBuf + chunkSize
      const chunk = selectedFile.slice(startBuf, end)


      try {
        const response = await fetch(
          `${host_url}${uploadUrl}`, {
            method: "PATCH",
            headers: {
              "Content-Length": chunk.length,
              "Content-Type": "application/offset+octet-stream"
            },
            body: chunk,
          }
        );
        startBuf = parseInt(response.headers.get('upload-offset'))
        currentProgress = Math.round((startBuf / selectedFile.size) * 100)
        setProgress(currentProgress)
        if (startBuf == selectedFile.size) {
          break
        }
      } catch (error) {
        if (!navigator.online) {
          setUploading(false)
          break
        }
      }
    }
  }

  return (
    <div className='flex w-screen h-screen justify-center content-center'>
      <div className="sm:w-full lg:w-5/10 mx-auto p-6 bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Get uploaded file</h2>
        <input 
          className="w-full px-4 py-2 mb-2 rounded-md border border-black text-black" 
          type="text" 
          placeholder="Insert file UUID"
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
        />
        <button
          onClick={handleRedirect}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Get file
        </button>

        <hr className="my-4 border border-gray-600"/>
        {/* <h4 className="text-xl font-bold my-4 text-gray-800"> - OR - </h4> */}
        
        <h2 className="text-xl font-bold mb-4 text-gray-800">Upload File</h2>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Choose a file
          </label>
          
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Upload size={16} className="mr-2" />
              <span>Browse</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            
            <button
              onClick={uploadURL == '' ? initiateUpload:resumeUpload}
              disabled={!selectedFile}
              className={`px-4 py-2 rounded-md transition-colors ${
                !selectedFile || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {uploading ? 'Uploading...' : (progress==0 ? 'Upload': 'Resume')}
            </button>
          </div>
        </div>
        
        {selectedFile && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">
              Selected file: <span className="font-medium">{selectedFile.name}</span>
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
          </div>
        )}

        {(!uploading && progress==100) && (
          <p className="text-sm text-gray-600 mb-1">
            Your file can be accessed at&nbsp;
            <a href={uploadURL.split('/').slice(-2).join('/')} className='text-blue-600 underline'>
              {uploadURL.split('/').slice(-2).join('/')}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
