"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CommandIcon, ShieldIcon, Mail01Icon, LockKeyIcon, ArrowRight01Icon, AlertCircleIcon, UserIcon } from "@hugeicons/core-free-icons"
import { toast, Toaster } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { isFirebaseEnabled, auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth"

type SelectedRole = "Admin" | "Manager"
type AuthMode = "signin" | "signup"

export default function Home() {
  const [authMode, setAuthMode] = React.useState<AuthMode>("signin")
  const [fullName, setFullName] = React.useState("ServiceBuddy Manager")
  const [email, setEmail] = React.useState("admin@servicebuddy.com")
  const [password, setPassword] = React.useState("admin123")
  const [loading, setLoading] = React.useState(false)

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          window.location.href = "/dashboard"
        }
      })
      return () => unsub()
    } else {
      const storedRole = localStorage.getItem("servicebuddy_role")
      if (storedRole) {
        window.location.href = "/dashboard"
      }
    }
  }, [])

  // Authentication Submission Handler (Unified Sign-in & Sign-up)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Automatically determine Sandbox Role based on email prefix/domain
    let assignedRole: SelectedRole = "Admin"
    const emailLower = email.toLowerCase()
    if (emailLower.includes("manager")) assignedRole = "Manager"
    else assignedRole = "Admin"

    const authPromise = new Promise(async (resolve, reject) => {
      try {
        // Pre-save simulated role parameter in LocalStorage so dashboard reads it instantly
        localStorage.setItem("servicebuddy_role", assignedRole)

        if (isFirebaseEnabled && auth) {
          if (authMode === "signup") {
            try {
              // Sign Up Mode: Create a new account
              const userCredential = await createUserWithEmailAndPassword(auth, email, password)
              if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: fullName })
              }
            } catch (err: any) {
              // Clean UX fallback: if already exists, sign in directly
              if (err.code === "auth/email-already-in-use") {
                await signInWithEmailAndPassword(auth, email, password)
              } else {
                throw err
              }
            }
          } else {
            // Sign In Mode: Try signing in. If the account doesn't exist, auto-create it on-the-fly!
            try {
              await signInWithEmailAndPassword(auth, email, password)
            } catch (err: any) {
              if (
                err.code === "auth/user-not-found" || 
                err.code === "auth/invalid-credential"
              ) {
                // If account does not exist, auto-provision sandbox account seamlessly!
                try {
                  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                  if (userCredential.user) {
                    await updateProfile(userCredential.user, { displayName: fullName })
                  }
                } catch (createErr: any) {
                  // If creation fails because it already existed but password was wrong,
                  // throw the original wrong password invalid-credential exception!
                  if (createErr.code === "auth/email-already-in-use") {
                    throw err
                  } else {
                    throw createErr
                  }
                }
              } else {
                throw err
              }
            }
          }
        } else {
          // Offline local sandbox testing delay
          await new Promise((r) => setTimeout(r, 1000))
        }
        resolve(true)
      } catch (err: any) {
        console.error("Authentication check failure:", err)
        reject(err)
      }
    })

    toast.promise(
      authPromise,
      {
        loading: "Verifying secure workspace credentials...",
        success: () => {
          // Relocate to dashboard
          window.location.href = "/dashboard"
          return `Access Granted! Welcome, ${assignedRole}.`
        },
        error: (err: any) => {
          let msg = "Authorization failed: "
          if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
            msg += "Incorrect password for this account."
          } else if (err.code === "auth/weak-password") {
            msg += "Password must be at least 6 characters."
          } else if (err.code === "auth/invalid-email") {
            msg += "Please enter a valid email address."
          } else {
            msg += err.message || "Invalid credentials."
          }
          return msg
        }
      }
    )
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans relative overflow-hidden px-4">
      <Toaster position="top-center" richColors />
      
      {/* Mesh decorative backdrops */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 size-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Main Centered Auth card container */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 relative z-10 animate-in fade-in duration-300">
        
        {/* App Logo */}
        <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-sm shrink-0">
            <img src="/icon.png" alt="ServiceBuddy Logo" className="size-full object-cover" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">ServiceBuddy CRM</h1>
          <p className="text-xs text-zinc-400 max-w-[280px]">
            Appliance Repairs, Payouts & Spreadsheet Reconciliation Hub
          </p>
        </div>

        {/* Shadcn inspired auth switcher tabs */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-lg border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => setAuthMode("signin")}
            className={`py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-all ${
              authMode === "signin"
                ? "bg-primary/20 text-primary shadow-xs border border-primary/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className={`py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-all ${
              authMode === "signup"
                ? "bg-primary/20 text-primary shadow-xs border border-primary/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Sign Up
          </button>
        </div>



        {/* Credentials Form */}
        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
          
          {/* Full Name (Sign Up only) */}
          {authMode === "signup" && (
            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-200">
              <Label htmlFor="fullname" className="text-xs font-bold text-zinc-400">Full Name</Label>
              <div className="relative">
                <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <Input 
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white focus:border-primary/50 text-xs h-10 w-full"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-zinc-400">Email Address</Label>
            <div className="relative">
              <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input 
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-zinc-950 border-zinc-800 text-white focus:border-primary/50 text-xs h-10 w-full"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pass" className="text-xs font-bold text-zinc-400">Password</Label>
            <div className="relative">
              <HugeiconsIcon icon={LockKeyIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input 
                id="pass"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-zinc-950 border-zinc-800 text-white focus:border-primary/50 text-xs h-10 w-full"
                required
              />
            </div>
          </div>



          {/* Auth Action Button */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all mt-3 cursor-pointer"
          >
            {loading ? "Authenticating session..." : authMode === "signin" ? "Unlock Workspace Console" : "Provision New Sandbox Account"}
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.5} className="size-4 text-primary-foreground animate-in fade-in" />
          </Button>

        </form>

      </div>
    </div>
  )
}
