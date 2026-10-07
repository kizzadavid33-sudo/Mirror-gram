// Generated from the connected Mirror Gram Supabase project.
// Regenerate with the Supabase type generator whenever the schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; username: string; display_name: string; bio: string; avatar_path: string | null; cover_path: string | null; bio_link: string | null; contact_email: string | null; contact_phone: string | null; contact_other: string | null; creator_status: string; is_private: boolean; created_at: string; updated_at: string }
        Insert: { id: string; username: string; display_name?: string; bio?: string; avatar_path?: string | null; cover_path?: string | null; bio_link?: string | null; contact_email?: string | null; contact_phone?: string | null; contact_other?: string | null; creator_status?: string; is_private?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; username?: string; display_name?: string; bio?: string; avatar_path?: string | null; cover_path?: string | null; creator_status?: string; is_private?: boolean; created_at?: string; updated_at?: string }
        Relationships: []
      }
      posts: {
        Row: { id: string; user_id: string; caption: string; visibility: string; music_path: string | null; music_name: string | null; music_url: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; caption?: string; visibility?: string; music_path?: string | null; music_name?: string | null; music_url?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; caption?: string; visibility?: string; music_path?: string | null; music_name?: string | null; music_url?: string | null; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "posts_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      media: {
        Row: { id: string; post_id: string; storage_path: string; media_type: string; mime_type: string | null; width: number | null; height: number | null; duration_seconds: number | null; created_at: string }
        Insert: { id?: string; post_id: string; storage_path: string; media_type: string; mime_type?: string | null; width?: number | null; height?: number | null; duration_seconds?: number | null; created_at?: string }
        Update: { id?: string; post_id?: string; storage_path?: string; media_type?: string; mime_type?: string | null; width?: number | null; height?: number | null; duration_seconds?: number | null; created_at?: string }
        Relationships: [{ foreignKeyName: "media_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] }]
      }
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string }
        Insert: { follower_id: string; following_id: string; created_at?: string }
        Update: { follower_id?: string; following_id?: string; created_at?: string }
        Relationships: []
      }
      likes: {
        Row: { user_id: string; post_id: string; created_at: string }
        Insert: { user_id: string; post_id: string; created_at?: string }
        Update: { user_id?: string; post_id?: string; created_at?: string }
        Relationships: []
      }
      comments: {
        Row: { id: string; post_id: string; user_id: string; body: string; created_at: string; updated_at: string }
        Insert: { id?: string; post_id: string; user_id: string; body: string; created_at?: string; updated_at?: string }
        Update: { id?: string; post_id?: string; user_id?: string; body?: string; created_at?: string; updated_at?: string }
        Relationships: []
      }
      saved_posts: {
        Row: { user_id: string; post_id: string; created_at: string }
        Insert: { user_id: string; post_id: string; created_at?: string }
        Update: { user_id?: string; post_id?: string; created_at?: string }
        Relationships: []
      }
      blocks: {
        Row: { blocker_id: string; blocked_id: string; created_at: string }
        Insert: { blocker_id: string; blocked_id: string; created_at?: string }
        Update: { blocker_id?: string; blocked_id?: string; created_at?: string }
        Relationships: []
      }
      conversations: {
        Row: { id: string; created_at: string }
        Insert: { id?: string; created_at?: string }
        Update: { id?: string; created_at?: string }
        Relationships: []
      }
      conversation_members: {
        Row: { conversation_id: string; user_id: string; joined_at: string }
        Insert: { conversation_id: string; user_id: string; joined_at?: string }
        Update: { conversation_id?: string; user_id?: string; joined_at?: string }
        Relationships: []
      }
      messages: {
        Row: { id: string; conversation_id: string; sender_id: string; body: string; created_at: string; deleted_at: string | null }
        Insert: { id?: string; conversation_id: string; sender_id: string; body: string; created_at?: string; deleted_at?: string | null }
        Update: { id?: string; conversation_id?: string; sender_id?: string; body?: string; created_at?: string; deleted_at?: string | null }
        Relationships: []
      }
      notifications: {
        Row: { id: string; user_id: string; actor_id: string | null; type: string; post_id: string | null; message: string | null; read_at: string | null; created_at: string }
        Insert: { id?: string; user_id: string; actor_id?: string | null; type: string; post_id?: string | null; message?: string | null; read_at?: string | null; created_at?: string }
        Update: { id?: string; user_id?: string; actor_id?: string | null; type?: string; post_id?: string | null; message?: string | null; read_at?: string | null; created_at?: string }
        Relationships: []
      }
      reports: {
        Row: { id: string; reporter_id: string; reported_user_id: string | null; post_id: string | null; message_id: string | null; reason: string; details: string | null; status: string; created_at: string }
        Insert: { id?: string; reporter_id: string; reported_user_id?: string | null; post_id?: string | null; message_id?: string | null; reason: string; details?: string | null; status?: string; created_at?: string }
        Update: { id?: string; reporter_id?: string; reported_user_id?: string | null; post_id?: string | null; message_id?: string | null; reason?: string; details?: string | null; status?: string; created_at?: string }
        Relationships: []
      }
      live_streams: {
        Row: { id: string; host_user_id: string; title: string; category: string; status: string; started_at: string | null; ended_at: string | null; created_at: string }
        Insert: { id?: string; host_user_id: string; title?: string; category?: string; status?: string; started_at?: string | null; ended_at?: string | null; created_at?: string }
        Update: { id?: string; host_user_id?: string; title?: string; category?: string; status?: string; started_at?: string | null; ended_at?: string | null; created_at?: string }
        Relationships: []
      }
      public_events: {
        Row: { id: string; creator_id: string; title: string; description: string; area_name: string; approximate_lat: number | null; approximate_lng: number | null; starts_at: string | null; ends_at: string | null; created_at: string }
        Insert: { id?: string; creator_id: string; title: string; description?: string; area_name?: string; approximate_lat?: number | null; approximate_lng?: number | null; starts_at?: string | null; ends_at?: string | null; created_at?: string }
        Update: { id?: string; creator_id?: string; title?: string; description?: string; area_name?: string; approximate_lat?: number | null; approximate_lng?: number | null; starts_at?: string | null; ends_at?: string | null; created_at?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_blocked: { Args: { viewer: string; other_user: string }; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
