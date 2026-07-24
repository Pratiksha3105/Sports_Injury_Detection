export default function LoadingSpinner({ label = 'Loading…', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-pulse-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-pulse-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-400 font-mono">{label}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/90 backdrop-blur-sm">
        {content}
      </div>
    )
  }
  return content
}
