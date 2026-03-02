"use client"

import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface RoomPlayer {
  id: string
  user_id: string
  display_name: string
  is_alive: boolean
  correct_answers: number
}

export interface GameRoom {
  id: string
  status: "waiting" | "playing" | "finished"
  entry_fee: number
  max_players: number
  current_round: number
  players: RoomPlayer[]
}

let currentChannel: RealtimeChannel | null = null

// Find or create a waiting room
export async function findOrCreateRoom(entryFee: number, userId: string, displayName: string): Promise<GameRoom | null> {
  const supabase = createClient()

  // First, try to find a waiting room with the same entry fee
  const { data: existingRooms } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("status", "waiting")
    .eq("entry_fee", entryFee)
    .order("created_at", { ascending: true })
    .limit(1)

  let roomId: string

  if (existingRooms && existingRooms.length > 0) {
    roomId = existingRooms[0].id
  } else {
    // Create a new room
    const { data: newRoom, error } = await supabase
      .from("game_rooms")
      .insert({ entry_fee: entryFee, max_players: 50 })
      .select()
      .single()

    if (error || !newRoom) return null
    roomId = newRoom.id
  }

  // Join the room
  const { error: joinError } = await supabase
    .from("game_room_players")
    .insert({
      room_id: roomId,
      user_id: userId,
      display_name: displayName,
    })

  if (joinError) {
    console.log("[v0] Join error:", joinError.message)
    // Might already be in room, continue anyway
  }

  return {
    id: roomId,
    status: "waiting",
    entry_fee: entryFee,
    max_players: 50,
    current_round: 0,
    players: [],
  }
}

// Subscribe to room updates via Realtime
export function subscribeToRoom(
  roomId: string,
  onPlayerJoined: (player: RoomPlayer) => void,
  onPlayerCount: (count: number) => void,
  onGameStart: () => void,
) {
  const supabase = createClient()

  // Clean up previous channel
  if (currentChannel) {
    supabase.removeChannel(currentChannel)
  }

  // Use Broadcast channel for room events
  currentChannel = supabase.channel(`room:${roomId}`, {
    config: { broadcast: { self: true } },
  })

  // Track presence for live player count
  currentChannel
    .on("presence", { event: "sync" }, () => {
      const state = currentChannel?.presenceState() ?? {}
      const count = Object.keys(state).length
      onPlayerCount(count)
    })
    .on("presence", { event: "join" }, ({ newPresences }) => {
      for (const p of newPresences) {
        onPlayerJoined({
          id: p.user_id as string,
          user_id: p.user_id as string,
          display_name: p.display_name as string,
          is_alive: true,
          correct_answers: 0,
        })
      }
    })
    .on("broadcast", { event: "game_start" }, () => {
      onGameStart()
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // Track our presence
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await currentChannel?.track({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Player",
            online_at: new Date().toISOString(),
          })
        }
      }
    })

  return currentChannel
}

// Broadcast game start to all players in room
export async function broadcastGameStart(roomId: string) {
  const supabase = createClient()
  await supabase
    .from("game_rooms")
    .update({ status: "playing" })
    .eq("id", roomId)

  if (currentChannel) {
    await currentChannel.send({
      type: "broadcast",
      event: "game_start",
      payload: {},
    })
  }
}

// Leave room and cleanup
export function leaveRoom() {
  if (currentChannel) {
    const supabase = createClient()
    supabase.removeChannel(currentChannel)
    currentChannel = null
  }
}

// Broadcast answer to room (for sync)
export async function broadcastAnswer(roomId: string, userId: string, isCorrect: boolean) {
  if (currentChannel) {
    await currentChannel.send({
      type: "broadcast",
      event: "player_answer",
      payload: { userId, isCorrect },
    })
  }
}
