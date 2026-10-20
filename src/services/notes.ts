import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Note } from "../types";

const selectNotes = "*, streams(name,slug), classes(class_number), subjects(name,slug)";
export async function getPublishedNotes(): Promise<Note[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("notes").select(selectNotes).eq("status", "published").order("published_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data || []) as unknown as Note[];
}
export async function getNoteUrl(note: Note): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.storage.from("study-pdfs").createSignedUrl(note.storage_path, 120);
  if (error) throw error;
  return data.signedUrl;
}
export async function getReferenceData() {
  if (!isSupabaseConfigured) return { streams: [], classes: [], subjects: [] };
  const [streams, classes, subjects] = await Promise.all([
    supabase.from("streams").select("*").order("name"),
    supabase.from("classes").select("*").order("class_number"),
    supabase.from("subjects").select("*").eq("is_active", true).order("name")
  ]);
  if (streams.error) throw streams.error;
  if (classes.error) throw classes.error;
  if (subjects.error) throw subjects.error;
  return { streams: streams.data || [], classes: classes.data || [], subjects: subjects.data || [] };
}