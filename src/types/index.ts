export type StreamName = "Science" | "Commerce" | "Arts / Humanities";
export type NoteStatus = "draft" | "published";
export interface Note {
  id: string; title: string; description: string | null; stream_id: string; class_id: string;
  subject_id: string; chapter: string | null; topic: string | null; resource_type: string;
  board: string | null; storage_path: string; thumbnail_path: string | null; file_size: number | null;
  mime_type: string; status: NoteStatus; uploaded_by: string | null; created_at: string;
  updated_at: string; published_at: string | null;
  streams?: { name: string; slug: string } | null;
  classes?: { class_number: number } | null;
  subjects?: { name: string; slug: string } | null;
}
export interface Subject { id: string; name: string; slug: string; stream_id: string; class_id: string; is_active: boolean; }
export interface Stream { id: string; name: StreamName; slug: string; }
export interface StudyClass { id: string; class_number: 11 | 12; }