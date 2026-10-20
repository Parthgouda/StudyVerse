import { BookOpen, Download, FileText } from "lucide-react";
import type { Note } from "../types";
import { getNoteUrl } from "../services/notes";
import toast from "react-hot-toast";

export function NoteCard({ note }: { note: Note }) {
  const download = async () => {
    const url = await getNoteUrl(note);
    if (!url) { toast.error("Could not open this PDF. Check your Supabase setup and storage policies."); return; }
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return <article className="surface flex h-full flex-col p-5 transition hover:-translate-y-1 hover:border-violet-500/50">
    <div className="mb-4 flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><FileText/></span><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-400">{note.resource_type}</span></div>
    <h3 className="font-semibold leading-6">{note.title}</h3>
    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{note.description || "Study resource for your learning journey."}</p>
    <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500"><span>{note.streams?.name || "Stream"}</span><span>·</span><span>Class {note.classes?.class_number || "—"}</span><span>·</span><span>{note.subjects?.name || "Subject"}</span></div>
    {note.chapter && <p className="mt-2 text-xs text-zinc-500"><BookOpen size={13} className="mr-1 inline"/> {note.chapter}</p>}
    <button onClick={() => void download()} className="btn-secondary mt-5 w-full text-sm"><Download size={16}/> Open / download PDF</button>
  </article>;
}