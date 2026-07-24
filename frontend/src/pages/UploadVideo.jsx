import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCloudUploadAlt, FaFileVideo, FaTimes, FaCheckCircle } from 'react-icons/fa'
import DashboardLayout from '../layouts/DashboardLayout'
import GlassCard from '../components/GlassCard'
import { fadeUp } from '../animations/variants'

const SUPPORTED_FORMATS = ['MP4', 'MOV', 'AVI', 'MKV']
const MAX_SIZE_MB = 200

export default function UploadVideo() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle | uploading | done
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFiles = useCallback((files) => {
    const selected = files[0]
    if (!selected) return

    const ext = selected.name.split('.').pop().toUpperCase()
    if (!SUPPORTED_FORMATS.includes(ext)) {
      setError(`Unsupported format .${ext}. Please use ${SUPPORTED_FORMATS.join(', ')}.`)
      return
    }
    if (selected.size / (1024 * 1024) > MAX_SIZE_MB) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }

    setError('')
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }, [])

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const startUpload = () => {
    // Milestone 1: simulated upload progress. Milestone 2 wires this to a
    // real POST /api/v1/videos multipart request against object storage.
    setStatus('uploading')
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setStatus('done')
          return 100
        }
        return p + Math.random() * 18
      })
    }, 300)
  }

  const reset = () => {
    setFile(null)
    setPreviewUrl(null)
    setProgress(0)
    setStatus('idle')
    setError('')
  }

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Upload Video</h1>
        <p className="text-slate-400 mb-8">
          Upload training or match footage for analysis. Actual AI processing ships
          in a later milestone — this screen wires up the full upload experience.
        </p>

        <GlassCard hover={false}>
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-colors py-20 flex flex-col items-center justify-center text-center px-6
              ${isDragging ? 'border-pulse-500 bg-pulse-500/5' : 'border-white/15 hover:border-white/30'}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <motion.div
                animate={{ y: isDragging ? -6 : 0 }}
                className="h-16 w-16 rounded-2xl bg-pulse-500/10 flex items-center justify-center mb-5"
              >
                <FaCloudUploadAlt className="text-3xl text-pulse-400" />
              </motion.div>
              <h3 className="font-semibold text-white text-lg mb-2">
                {isDragging ? 'Drop it right here' : 'Drag & drop your video'}
              </h3>
              <p className="text-slate-400 text-sm mb-1">or click to browse from your device</p>
              <p className="text-xs text-slate-500 font-mono mt-4">
                Supported: {SUPPORTED_FORMATS.join(' · ')} — up to {MAX_SIZE_MB}MB
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-pulse-500/10 flex items-center justify-center flex-shrink-0">
                  <FaFileVideo className="text-2xl text-pulse-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
                {status !== 'uploading' && (
                  <button onClick={reset} className="text-slate-500 hover:text-alert-400">
                    <FaTimes />
                  </button>
                )}
              </div>

              {previewUrl && (
                <video src={previewUrl} controls className="w-full rounded-xl border border-white/10 max-h-80 bg-black" />
              )}

              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.button
                    key="start"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={startUpload}
                    className="btn-primary w-full"
                  >
                    <FaCloudUploadAlt /> Start Upload
                  </motion.button>
                )}

                {status === 'uploading' && (
                  <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="h-2.5 rounded-full bg-white/5 overflow-hidden mb-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pulse-500 to-neural-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{Math.min(Math.round(progress), 100)}% uploaded…</p>
                  </motion.div>
                )}

                {status === 'done' && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <FaCheckCircle className="text-emerald-400 text-xl" />
                    <div>
                      <p className="text-emerald-400 font-medium text-sm">Upload complete</p>
                      <p className="text-xs text-slate-400">
                        Video registered. Analysis will begin once the AI pipeline is live (Milestone 3+).
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {error && <p className="text-alert-400 text-sm mt-4">{error}</p>}
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  )
}
