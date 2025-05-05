import { useState, useEffect } from 'react'
// import { Upload } from 'lucide-react'
// import '../App.css'
// import { calculateMD5 } from '../util.js'
// import { redirect } from 'react-router-dom'
import { Routes, Route, useParams } from 'react-router-dom';

const host_url = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`

export default function DetailFile() {
  let { uuid } = useParams();

  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`${host_url}/v1/files/${uuid}`);

      if (res.status === 404) {
        alert('Notfound')
        setMetadata({});
        // return;
      } else {
        // console.log(res.json)

        // console.log(await res.json())
        setMetadata(await res.json())
      }
    }
    fetchData()
    console.log(metadata)

    return () => {}

      // .then((res) => {
      //   if (res.status !== 404) {
      //     return res.json()
      //   }
      //   return {}
      // )
      // .then((result) => {
      //   setData(result)
      // })
      // .catch((err) => {
      //   console.error('Fetch error:', err)
      // })
  }, []) // empty dependency → run once on mount

  useEffect(() => {
    console.log(metadata)
    console.log(Object.keys(metadata).length)
  }, [metadata])

  return (
    <div className='flex w-screen h-screen justify-center content-center'>
      <div className="sm:w-full lg:w-5/10 mx-auto p-6 bg-white rounded-lg">
        {/* {Object.keys(metadata).length} */}
        {(Object.keys(metadata).length == 0) ? (
          <div className="w-full h-full flex flex-col justify-center content-center">
            <h2 className="text-3xl font-bold text-red-800 text-center">404</h2>
            <h2 className="text-xl font-bold text-gray-800 text-center">File not found!</h2>
          </div>
        ):(
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800">File Metadata</h2>
            <table className="w-full table-auto">
              <tbody>
              {Object.entries(metadata).map(([key, value]) => (
                <tr key={key}>
                  <td className="text-xl font-bold text-gray-800 border-y-1 border-gray-400 py-4">{key}</td>
                  <td className="text-xl font-regular text-gray-600 border-y-1 border-gray-400 py-4">{value}</td>
                </tr>
              ))}
              </tbody>
            </table>
            <a 
              className="px-4 py-2 rounded-md bg-black text-white color-white"
              href={`${host_url}/v1/files/${uuid}/download`}
            >
              DownloadFile
            </a>
            <button onClick={() => fetch(`${host_url}/v1/files/${uuid}/download`)}>
              Download File
            </button>
          </>
        )}
      </div>
    </div>
  )
}
