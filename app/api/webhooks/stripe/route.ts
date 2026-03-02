import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Development fallback: parse the body directly
      event = JSON.parse(body)
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const metadata = session.metadata || {}
    const coins = parseInt(metadata.coins || "0", 10)
    const customerEmail = session.customer_details?.email

    if (coins > 0 && customerEmail) {
      // Find user by email
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const user = users?.users?.find((u) => u.email === customerEmail)

      if (user) {
        // Add coins to user profile
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("coins")
          .eq("id", user.id)
          .single()

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({ coins: profile.coins + coins })
            .eq("id", user.id)

          // Record transaction
          await supabaseAdmin.from("transactions").insert({
            user_id: user.id,
            amount: coins,
            type: "purchase",
            description: `Purchased ${coins} coins via Stripe`,
          })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
