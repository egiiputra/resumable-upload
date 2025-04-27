import { useState } from 'react'
import { Upload } from 'lucide-react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setProgress(0)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    
    setUploading(true)
    console.log(selectedFile)
    // Simulate upload progress
    let currentProgress = 0
    let start = 0
    const interval = setInterval(() => {
      currentProgress += 5
      console.log(selectedFile.slice(start * selectedFile.size / 100, (start+5) * selectedFile.size / 100))
      setProgress(currentProgress)
      
      if (currentProgress >= 100) {
        clearInterval(interval)
        setUploading(false)
      }
    }, 200)
  }

  return (
    <div className='flex w-screen h-screen justify-center content-center'>
      <div className="sm:w-full lg:w-5/10 mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">File Upload</h2>
        
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
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`px-4 py-2 rounded-md transition-colors ${
                !selectedFile || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload'}
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
      </div>
    </div>
  )
  {/*return (
    <>
      <div className='flex w-screen h-screen justify-center content-center'>
        <div className='border border-black w-2/5 bg-white max-h-7/10'>
          <h1 class="text-3xl font-bold text-black">
            Your file name
          </h1>
        </div>
      </div>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
  
}

export default App
