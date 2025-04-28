import SparkMD5 from 'spark-md5'

export function calculateMD5(file) {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    
    fileReader.onload = (e) => {
      spark.append(e.target.result); // Append the ArrayBuffer result
      const md5Hash = spark.end();
      resolve(md5Hash);
    };
    
    fileReader.onerror = (error) => {
      reject(error);
    };
    
    fileReader.readAsArrayBuffer(file); // Read file as ArrayBuffer
  });
}