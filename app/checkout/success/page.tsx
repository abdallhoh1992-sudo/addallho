"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-8 text-center">
      <div className="animate-scale-in flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
          <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
        <p className="text-muted-foreground">Your coins have been added. Redirecting...</p>
      </div>
    </div>
  )
}
