"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function OfflineBlocker() {
  const [checking, setChecking] = React.useState(false)

  const handleRetry = async () => {
    setChecking(true)
    // Small delay to simulate connection check
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    if (typeof window !== "undefined") {
      if (window.navigator.onLine) {
        toast.success("Connection restored! Reloading workspace...")
        window.location.reload()
      } else {
        toast.error("Still offline. Please check your internet connection.")
      }
    }
    setChecking(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md font-sans">
      {/* Decorative backdrops */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[450px] rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />

      {/* Center glassmorphic card */}
      <div className="relative w-full max-w-md bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-200">
        
        {/* Animated Custom Wifi-Off Icon */}
        <div className="relative flex items-center justify-center size-20 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-9"
          >
            <path d="M1 1l22 22" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5" />
            <path d="M5 12.5a10.94 10.94 0 0 1 5.83-2.84" />
            <path d="M7.34 16.7a5.89 5.89 0 0 1 1.62-1" />
            <path d="M12 20h.01" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold tracking-tight text-white">Connection Lost</h2>
          <p className="text-xs text-zinc-400 leading-relaxed px-2">
            ServiceBuddy CRM requires an active internet connection to authenticate your session, access client directories, or synchronize repairs to the Cloud database.
          </p>
        </div>

        <div className="w-full bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-3 text-[10px] text-zinc-500 font-mono">
          STATUS: OFFLINE fallback mode disabled
        </div>

        {/* Retry Button */}
        <Button
          onClick={handleRetry}
          disabled={checking}
          className="w-full h-10 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-700/50"
        >
          {checking ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying Network Gateway...
            </>
          ) : (
            "Retry Connection"
          )}
        </Button>
      </div>
    </div>
  )
}
