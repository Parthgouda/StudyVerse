import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { getPublishedNotes, getReferenceData } from "../services/notes";
import type { Note, Stream, StudyClass, Subject } from "../types";
import { NoteCard } from "../components/NoteCard";
import { isSupabaseConfigured } from "../lib/supabase";

export default function Notes() {
  const [params] = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [classes, setClasses] = useState<StudyClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [query, setQuery] = useState("");
  const [stream, setStream] = useState(params.get("stream") || "");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([getPublishedNotes(), getReferenceData()]).then(([n,r]) => { setNotes(n); setStreams(r.streams as Stream[]); setClasses(r.classes as StudyClass[]); setSubjects(r.subjects as Subject[]); }).catch(() => toast.error("Unable to load notes. Check your database setup.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => notes.filter(n => {
    const text = `${n.title} ${n.description || ""} ${n.chapter || ""} ${n.topic || ""} ${n.subjects?.name || ""}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (!stream || n.streams?.name === stream) && (!classId || n.class_id === classId) && (!subjectId || n.subject_id === subjectId);
  }).sort((a,b) => sort === "alpha" ? a.title.localeCompare(b.title) : new Date(b.created_at).getTime()-new Date(a.created_at).getTime()), [notes,query,stream,classId,subjectId,sort]);
  const selectedStream = streams.find(s=>s.name===stream);
  const filteredSubjects = subjects.filter(s => (!selectedStream || s.stream_id === selectedStream.id) && (!classId || s.class_id === classId));
  return <div className="container-page py-12"><div className="max-w-2xl"><p className="text-sm text-violet-300">The study library</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Browse study notes.</h1><p className="mt-4 leading-7 text-zinc-400">Search published notes and narrow down by stream, class and subject.</p></div>
    {!isSupabaseConfigured && <div className="mt-7 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">Supabase is not configured yet. Add your environment values and run the SQL migration to use real notes.</div>}
    <div className="surface mt-8 p-4 sm:p-5"><div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/><input className="field pl-10" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, chapter, topic or subject..."/></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs text-zinc-400">Stream<select className="field mt-1.5" value={stream} onChange={e=>{setStream(e.target.value);setSubjectId("");}}><option value="">All streams</option>{streams.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}{!streams.length && ["Science","Commerce","Arts / Humanities"].map(s=><option key={s}>{s}</option>)}</select></label><label className="text-xs text-zinc-400">Class<select className="field mt-1.5" value={classId} onChange={e=>{setClassId(e.target.value);setSubjectId("");}}><option value="">All classes</option>{classes.map(c=><option key={c.id} value={c.id}>Class {c.class_number}</option>)}</select></label><label className="text-xs text-zinc-400">Subject<select className="field mt-1.5" value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">All subjects</option>{filteredSubjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label className="text-xs text-zinc-400">Sort by<select className="field mt-1.5" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="alpha">Alphabetical</option></select></label></div><p className="mt-4 text-xs text-zinc-500"><SlidersHorizontal size={13} className="mr-1 inline"/>{filtered.length} resource{filtered.length===1?"":"s"} found</p></div>
    {loading ? <div className="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(x=><div key={x} className="surface h-64 animate-pulse"/>)}</div> : filtered.length ? <div className="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-3">{filtered.map(n=><NoteCard key={n.id} note={n}/>)}</div> : <div className="surface mt-8 py-14 text-center"><BookOpen className="mx-auto text-zinc-600" size={30}/><h2 className="mt-3 text-lg font-semibold">No notes found</h2><p className="mt-2 text-sm text-zinc-500">Try a different search or clear your filters.</p><button className="btn-secondary mt-4" onClick={()=>{setQuery("");setStream("");setClassId("");setSubjectId("");}}>Clear filters</button></div>}
  </div>;
}