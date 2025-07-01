import React, { useState, useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import './App.css'

function App() {
  const [currentSection, setCurrentSection] = useState('home')
  const [imageSrc, setImageSrc] = useState(null)
  const [result, setResult] = useState(null)
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modelLoading, setModelLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const imageRef = useRef()
  const fileInputRef = useRef()

  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true)
        const loadedModel = await tf.loadLayersModel('/model/model.json')
        setModel(loadedModel)
      } catch (error) {
        console.error('Error loading model:', error)
      } finally {
        setModelLoading(false)
      }
    }
    loadModel()
  }, [])

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImageSrc(url)
      setResult(null)
      setShowModal(true)
    }
  }

  const handleDetect = async () => {
    if (!imageSrc || !model || !imageRef.current) return
    
    try {
      setLoading(true)
      const tensor = tf.browser
        .fromPixels(imageRef.current)
        .resizeNearestNeighbor([256, 256]) 
        .toFloat()
        .div(255.0) 
        .expandDims()

      const prediction = model.predict(tensor)
      const predictionData = await prediction.data()
      const predictedIndex = predictionData.indexOf(Math.max(...predictionData))
      
      // Informasi penyakit berdasarkan referensi
      const diseaseInfos = [
        {
          label: 'Layu Bakteri',
          cause: 'Disebabkan oleh bakteri Ralstonia solanacearum yang menyerang jaringan pembuluh tanaman.',
          solution: 'Gunakan bibit sehat, rotasi tanaman, dan buang tanaman yang terinfeksi.',
        },
        {
          label: 'Hawar Kering',
          cause: 'Disebabkan oleh jamur Alternaria solani yang menyerang daun dan batang.',
          solution: 'Gunakan fungisida, buang daun terinfeksi, dan lakukan rotasi tanaman.',
        },
        {
          label: 'Hawar Daun',
          cause: 'Disebabkan oleh jamur Phytophthora infestans yang menyerang daun, batang, dan umbi.',
          solution: 'Gunakan fungisida sistemik, tanam varietas tahan, dan hindari kelembapan berlebih.',
        },
        {
          label: 'Nematoda',
          cause: 'Disebabkan oleh nematoda Globodera spp. yang menyerang akar kentang.',
          solution: 'Gunakan varietas tahan, lakukan rotasi tanaman, dan solarisasi tanah.',
        },
        {
          label: 'Virus PVY',
          cause: 'Disebabkan oleh Potato virus Y yang ditularkan oleh kutu daun.',
          solution: 'Gunakan bibit bebas virus, kendalikan kutu daun, dan cabut tanaman terinfeksi.',
        },
      ]

      const info = diseaseInfos[predictedIndex]
      setResult({
        label: info.label,
        cause: info.cause,
        solution: info.solution,
        confidence: predictionData[predictedIndex],
      })
      setShowModal(false)
      setShowResultModal(true)
    } catch (error) {
      console.error('Error during detection:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToSection = (sectionId) => {
    setCurrentSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">YuFarm</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {['home', 'about', 'deteksi', 'download'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      currentSection === item
                        ? 'text-green-600'
                        : 'text-gray-600 hover:text-green-600'
                    }`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-green-600 p-2 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="pt-24 pb-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Deteksi Penyakit
              <br />
              <span className="text-green-600">Tanaman Kentang</span>
              <br />
              dengan Mudah
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Teknologi kecerdasan buatan untuk deteksi penyakit tanaman kentang 
              secara cepat dan akurat dari foto daun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollToSection('deteksi')}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
              >
                Mulai Deteksi
              </button>
              <button
                onClick={() => scrollToSection('download')}
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Download App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Mengapa YuFarm?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solusi mudah untuk deteksi penyakit tanaman kentang menggunakan teknologi Deep Learning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Deteksi Cepat</h3>
              <p className="text-gray-600 leading-relaxed">
                Identifikasi penyakit tanaman kentang hanya dalam beberapa detik 
                menggunakan foto daun yang diambil dengan smartphone.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mudah Digunakan</h3>
              <p className="text-gray-600 leading-relaxed">
                Interface yang sederhana dan intuitif memungkinkan siapa saja 
                dapat menggunakan aplikasi dengan mudah.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rekomendasi Treatment</h3>
              <p className="text-gray-600 leading-relaxed">
                Dapatkan saran penanganan yang tepat untuk setiap jenis penyakit 
                yang terdeteksi pada tanaman kentang Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deteksi Section */}
      <section id="deteksi" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Deteksi Penyakit
            </h2>
            <p className="text-xl text-gray-600">
              Upload foto daun kentang
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            {modelLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Memuat model Deep Learning...</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center hover:border-green-400 transition-colors cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Foto Daun
                </h3>
                <p className="text-gray-600 mb-6">
                  Pilih atau drag & drop foto dari perangkat Anda
                </p>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Pilih File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
            )}
            
            <div className="mt-8 grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                <h4 className="font-semibold text-gray-900 mb-1">Hawar Daun</h4>
                <p className="text-sm text-gray-600">Penyakit busuk daun</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                <h4 className="font-semibold text-gray-900 mb-1">Hawar Kering</h4>
                <p className="text-sm text-gray-600">Bercak kering pada daun</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <h4 className="font-semibold text-gray-900 mb-1">Nematoda</h4>
                <p className="text-sm text-gray-600">Infeksi cacing nematoda</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-1">Pvy</h4>
                <p className="text-sm text-gray-600">Virus pada tanaman</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-1">Layu Bakteri</h4>
                <p className="text-sm text-gray-600">Infeksi bakteri</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Download Aplikasi
            </h2>
            <p className="text-xl text-gray-600">
              Dapatkan YuFarm untuk Android
            </p>
          </div>
          
          <div className="bg-green-600 rounded-xl p-8 text-white mb-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-2">YuFarm Mobile</h3>
                <p className="text-green-100 mb-6 text-lg">
                  Deteksi penyakit tanaman kentang langsung dari smartphone Anda
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="bg-green-500 px-3 py-1 rounded">Android 7.0+</span>
                  <span className="bg-green-500 px-3 py-1 rounded">90 MB</span>
                  <span className="bg-green-500 px-3 py-1 rounded">v1.0.0</span>
                </div>
              </div>
              <div>
                <button className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                  Download APK
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Deteksi Real-time</h4>
              <p className="text-gray-600">
                Gunakan kamera untuk deteksi langsung di lapangan
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Panduan Penanganan</h4>
              <p className="text-gray-600">
                Dapatkan rekomendasi treatment untuk setiap penyakit
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Mode Offline</h4>
              <p className="text-gray-600">
                Bekerja tanpa koneksi internet
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-3xl font-bold text-white">YuFarm</span>
            </div>
            <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
              Membantu petani Indonesia dengan teknologi Deep Learning untuk pertanian yang lebih produktif
            </p>
            <div className="flex justify-center space-x-8 mb-8 text-sm">
              <button className="text-gray-400 hover:text-white transition-colors">
                Tentang
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Kontak
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Terms
              </button>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">
                © 2025 YuFarm. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Upload & Preview */}
      {showModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Preview Gambar</h3>
                <button
                  onClick={() => { setShowModal(false); setImageSrc(null); }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {imageSrc && (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden">
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  
                  <button
                    onClick={handleDetect}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition duration-300 ${
                      loading 
                        ? 'bg-green-400' 
                        : 'bg-green-600 hover:bg-green-700'
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
                      <span>Deteksi Penyakit</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Hasil Deteksi */}
      {showResultModal && result && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-800">Hasil Deteksi</h3>
                <button
                  onClick={() => { setShowResultModal(false); setResult(null); setImageSrc(null); }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-green-800">Penyakit Terdeteksi</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{result.label}</p>
                  {/* <p className="text-sm text-gray-600 mt-1">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p> */}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Penyebab:</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{result.cause}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Solusi Penanganan:</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{result.solution}</p>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => { setShowResultModal(false); setResult(null); setImageSrc(null); }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => { setShowResultModal(false); setResult(null); setImageSrc(null); fileInputRef.current?.click(); }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Deteksi Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App