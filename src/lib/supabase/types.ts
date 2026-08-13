/**
 * Hand-authored to mirror supabase/migrations/0001_init.sql and
 * 0002_phase12_tasks_projects.sql, in the same shape
 * `supabase gen types typescript` produces. Once a real project exists,
 * regenerate this file from the live schema with:
 *
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 *
 * to guarantee it never drifts from the database. Every table carries an
 * empty `Relationships: []` and the schema an empty `Views`/`Functions` —
 * supabase-js's generic constraints (`GenericTable`/`GenericSchema`) require
 * those keys to be present for query builder types to resolve correctly.
 */

export type ProjectStatus = "planning" | "active" | "paused" | "completed";
export type TaskStatus = "inbox" | "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type ProjectMemberRole = "owner" | "member";
export type NotificationType =
  | "task_due"
  | "project_update"
  | "ai_suggestion"
  | "calendar_reminder"
  | "task_completed";
export type RelatedEntityType = "task" | "project" | "note" | "calendar_event";
export type AiContextType = "global" | "project" | "note" | "task" | "calendar";
export type AiMessageRole = "user" | "assistant" | "system";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          status: ProjectStatus;
          color: string | null;
          icon: string;
          progress: number;
          deadline: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          owner_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: ProjectMemberRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["project_members"]["Row"]> & {
          project_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_members"]["Row"]>;
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tags"]["Row"]> & {
          owner_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
        Relationships: [];
      };
      task_tags: {
        Row: { task_id: string; tag_id: string };
        Insert: { task_id: string; tag_id: string };
        Update: Partial<{ task_id: string; tag_id: string }>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          owner_id: string;
          project_id: string | null;
          parent_task_id: string | null;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          estimated_duration_minutes: number | null;
          tags: string[];
          position: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          owner_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          owner_id: string;
          project_id: string | null;
          title: string;
          content: string;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notes"]["Row"]> & {
          owner_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Row"]>;
        Relationships: [];
      };
      calendar_events: {
        Row: {
          id: string;
          owner_id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          all_day: boolean;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["calendar_events"]["Row"]> & {
          owner_id: string;
          title: string;
          start_time: string;
          end_time: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_events"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          owner_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          is_read: boolean;
          related_entity_type: RelatedEntityType | null;
          related_entity_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          owner_id: string;
          type: NotificationType;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          owner_id: string;
          project_id: string | null;
          type: string;
          description: string;
          related_entity_type: RelatedEntityType | null;
          related_entity_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activities"]["Row"]> & {
          owner_id: string;
          type: string;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Row"]>;
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          owner_id: string;
          context_type: AiContextType | null;
          context_id: string | null;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ai_conversations"]["Row"]> & {
          owner_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_conversations"]["Row"]>;
        Relationships: [];
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: AiMessageRole;
          content: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ai_messages"]["Row"]> & {
          conversation_id: string;
          role: AiMessageRole;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_messages"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
