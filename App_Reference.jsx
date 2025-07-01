import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [result, setResult] = useState(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const imageRef = useRef();

  
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        const loadedModel = await tf.loadLayersModel('/model/model.json');
        setModel(loadedModel);
        
      } catch (error) {
        console.error('Error loading model:', error);
      } finally {
        setModelLoading(false);
      }
    };
    loadModel();
  }, []);


  // Handler untuk input file (web fallback)
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setResult(null);
    }
  };

  // Handler untuk kamera (Capacitor)

  const handleCamera = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 90,
      });
      setImageSrc(photo.dataUrl);
      setResult(null);
    } catch (e) {
      console.error('Camera error:', e);
    }
  };

  // Handler untuk galeri (Capacitor)

  const handleGallery = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        quality: 90,
      });
      setImageSrc(photo.dataUrl);
      setResult(null);
    } catch (e) {
      console.error('Gallery error:', e);
    }
  };

  const handleDetect = async () => {
    if (!imageSrc || !model || !imageRef.current) return;
    
    try {
      setLoading(true);
      const tensor = tf.browser
        .fromPixels(imageRef.current)
        .resizeNearestNeighbor([256, 256]) 
        .toFloat()
        .div(255.0) 
        .expandDims(); 

      const prediction = model.predict(tensor);
      const predictionData = await prediction.data();
      const predictedIndex = predictionData.indexOf(Math.max(...predictionData));
      
      console.log('Prediction:', predictionData, 'Predicted Index:', predictedIndex);
      
      // Informasi penyakit, penyebab, dan solusi
      const diseaseInfos = [
        {
          label: 'Bacteria wilt (Layu Bakteri)',
          cause: 'Disebabkan oleh bakteri Ralstonia solanacearum yang menyerang jaringan pembuluh tanaman.',
          solution: 'Gunakan bibit sehat, rotasi tanaman, dan buang tanaman yang terinfeksi.',
        },
        {
          label: 'Early blight (Hawan kering)',
          cause: 'Disebabkan oleh jamur Alternaria solani yang menyerang daun dan batang.',
          solution: 'Gunakan fungisida, buang daun terinfeksi, dan lakukan rotasi tanaman.',
        },
        {
          label: 'Late Blight (Hawar daun)',
          cause: 'Disebabkan oleh jamur Phytophthora infestans yang menyerang daun, batang, dan umbi.',
          solution: 'Gunakan fungisida sistemik, tanam varietas tahan, dan hindari kelembapan berlebih.',
        },
        {
          label: 'Nematode (Nematode cyst kentang)',
          cause: 'Disebabkan oleh nematoda Globodera spp. yang menyerang akar kentang.',
          solution: 'Gunakan varietas tahan, lakukan rotasi tanaman, dan solarisasi tanah.',
        },
        {
          label: 'Virus PVY (Penyakit virus Y)',
          cause: 'Disebabkan oleh Potato virus Y yang ditularkan oleh kutu daun.',
          solution: 'Gunakan bibit bebas virus, kendalikan kutu daun, dan cabut tanaman terinfeksi.',
        },
      ];

      const info = diseaseInfos[predictedIndex];
      setResult({
        label: info.label,
        cause: info.cause,
        solution: info.solution,
        confidence: predictionData[predictedIndex],
      });
    } catch (error) {
      console.error('Error during detection:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex flex-col items-center">
      <div className="w-full max-w-md px-4 py-6 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">YuFarm</h1>
          <p className="text-sm text-gray-500">Deteksi Penyakit Kentang</p>
        </div>
        
        {/* Main Card */}
        <div className="bg-white w-full rounded-2xl shadow-lg overflow-hidden p-5 mb-4">
          
          {modelLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Memuat model...</p>
            </div>
          ) : (
            <>
              {/* Button to trigger file upload/camera/gallery */}
              {!imageSrc && (
                <div className="mb-5 flex flex-col gap-3">
                  <button
                    onClick={handleCamera}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-md transition duration-300 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    </svg>
                    <span>Ambil dari Kamera</span>
                  </button>
                  <button
                    onClick={handleGallery}
                    className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl shadow-md transition duration-300 border border-gray-200 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span>Pilih dari Galeri</span>
                  </button>
                  {/* Fallback input file untuk web */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    id="fileInputWeb"
                  />
                </div>
              )}

              {/* Hidden input for changing photo later */}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                capture="environment"
                id="fileInput"
              />

              {/* Preview and Actions */}
              {imageSrc && (
                <div className="mb-4">
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4">
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Preview"
                      className="w-full h-60 object-cover"
                    />
                    <div className="absolute top-0 right-0 p-2">
                      <button 
                        onClick={() => { setImageSrc(null); setResult(null); }} 
                        disabled={loading}
                        className="bg-white rounded-full p-2 shadow-lg opacity-90 hover:opacity-100 transition-opacity focus:outline-none border border-gray-200 active:scale-95 transform"
                        aria-label="Hapus foto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#ef4444" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleDetect}
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition duration-300 ${
                        loading 
                          ? 'bg-blue-400' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Mendeteksi...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                          <span>Deteksi Penyakit</span>
                        </>
                      )}
                    </button>
                    
                  </div>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="mt-2 rounded-xl overflow-hidden shadow-sm border border-green-200">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#22c55e" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-green-800">Hasil Deteksi</span>
                  </div>
                  <div className="bg-white p-4 flex flex-col gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Jenis Penyakit</div>
                      <div className="font-medium text-gray-800">{result.label}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Penyebab</div>
                      <div className="text-gray-700 text-sm leading-snug">{result.cause}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Solusi</div>
                      <div className="text-gray-700 text-sm leading-snug">{result.solution}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="w-full text-center mt-auto text-xs text-gray-500">
          © {new Date().getFullYear()} YuFarm | Deteksi Penyakit Kentang
        </div>
      </div>
    </div>
  );
}

export default App;
