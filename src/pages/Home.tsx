import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Download, GraduationCap, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getPublishedNotes } from "../services/notes";
import type { Note } from "../types";
import { NoteCard } from "../components/NoteCard";
import { isSupabaseConfigured } from "../lib/supabase";

const streams = [
  { name: "Science", desc: "Explore Physics, Chemistry, Mathematics, Biology and more.", icon: "⚛", color: "from-violet-500/20 to-indigo-500/5" },
  { name: "Commerce", desc: "Study Accountancy, Economics, Business Studies and more.", icon: "◈", color: "from-fuchsia-500/20 to-violet-500/5" },
  { name: "Arts / Humanities", desc: "Discover History, Political Science, Geography and more.", icon: "✳", color: "from-indigo-500/20 to-purple-500/5" }
];
export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  useEffect(() => { getPublishedNotes().then(setNotes).catch(() => toast.error("Could not load recent notes.")); }, []);
  return <div>
    <section className="relative overflow-hidden"><div className="pointer-events-none absolute left-1/2 top-[-250px] h-[600px] w-[850px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]"/>
      <div className="container-page relative grid min-h-[590px] items-center gap-12 py-20 lg:grid-cols-[1.1fr_.9fr]">
        <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200"><Sparkles size={14}/> Your learning companion</div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Your Learning Journey <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">Starts Here.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">Discover free study notes and PDF resources, organized around your class, stream and subjects. Spend less time searching and more time learning.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/notes" className="btn-primary">Explore study notes <ArrowRight size={17}/></Link><Link to="/about" className="btn-secondary">Discover StudyVerse</Link></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-400"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-violet-300"/> Free access</span><span className="flex items-center gap-2"><Download size={16} className="text-violet-300"/> PDF resources</span><span className="flex items-center gap-2"><Zap size={16} className="text-violet-300"/> Easy to explore</span></div>
        </motion.div>
        <motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{duration:.6,delay:.1}} className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-5 rounded-[35px] bg-gradient-to-br from-violet-600/20 to-fuchsia-500/10 blur-2xl"/>
          <div className="surface relative p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-sm text-zinc-400">Your study space</p><h2 className="mt-1 text-xl font-semibold">One library. More possibilities.</h2></div><span className="grid size-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-300"><GraduationCap size={25}/></span></div>
            <div className="mt-7 grid grid-cols-2 gap-3">{[["Class 11","Build your foundation"],["Class 12","Prepare with confidence"],["Study notes","Topic-wise resources"],["PDF library","Read at your pace"]].map(([a,b],i)=><div key={a} className="rounded-2xl border border-white/5 bg-white/[.025] p-4"><div className="mb-3 grid size-8 place-items-center rounded-lg bg-violet-500/15 text-violet-300">{i===2?<BookOpen size={17}/>:i===3?<Download size={17}/>:<GraduationCap size={17}/>}</div><p className="font-medium">{a}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{b}</p></div>)}</div>
            <Link to="/notes" className="mt-5 flex items-center justify-between rounded-xl bg-violet-500/10 p-4 text-sm"><span>Find your next resource</span><ArrowRight size={17} className="text-violet-300"/></Link>
          </div>
        </motion.div>
      </div>
    </section>
    <section className="container-page py-16"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-violet-300">Find your path</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Explore by stream</h2><p className="mt-2 text-zinc-400">Choose the subjects that match your learning journey.</p></div><Link to="/notes" className="text-sm text-violet-300 hover:text-violet-200">Browse all notes <ArrowRight size={15} className="ml-1 inline"/></Link></div>
      <div className="grid gap-4 md:grid-cols-3">{streams.map((s,i)=><motion.div key={s.name} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08}}><Link to={`/notes?stream=${encodeURIComponent(s.name)}`} className={`surface group block h-full bg-gradient-to-br ${s.color} p-6 transition hover:-translate-y-1 hover:border-violet-400/40`}><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-black/20 text-2xl">{s.icon}</span><ArrowRight className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-violet-300"/></div><h3 className="mt-6 text-xl font-semibold">{s.name}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{s.desc}</p><p className="mt-6 text-sm text-violet-300">Explore resources <ArrowRight size={14} className="ml-1 inline"/></p></Link></motion.div>)}</div>
    </section>
    <section className="container-page py-12"><div className="surface flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center sm:p-9"><div><p className="text-sm text-violet-300">Built for students</p><h2 className="mt-2 text-2xl font-semibold">The right resource, without the clutter.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Browse by stream, class and subject to find published resources in one organized place.</p></div><Link to="/notes" className="btn-primary shrink-0"><Search size={17}/> Find study notes</Link></div></section>
    <section className="container-page py-12"><div className="mb-7 flex items-end justify-between"><div><p className="text-sm text-violet-300">From the library</p><h2 className="mt-2 text-3xl font-semibold">Recently added notes</h2></div><Link to="/notes" className="text-sm text-violet-300">View library →</Link></div>
      {!isSupabaseConfigured && <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">Connect your Supabase project to load real published notes. Setup instructions are in README.md.</div>}
      {notes.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{notes.slice(0,3).map(n=><NoteCard key={n.id} note={n}/>)}</div> : <div className="surface py-10 text-center"><BookOpen className="mx-auto text-zinc-600" size={28}/><p className="mt-3 font-medium">Your next study resource is waiting</p><p className="mt-1 text-sm text-zinc-500">Published notes will appear here when they are added to the library.</p><Link to="/notes" className="mt-4 inline-block text-sm text-violet-300">Browse library →</Link></div>}
    </section>
    <section className="container-page py-12"><h2 className="text-3xl font-semibold">Frequently asked questions</h2><div className="mt-6 grid gap-3 md:grid-cols-2">{[["Is StudyVerse free?","The platform is designed to make published learning resources freely accessible."],["How do I find my subject?","Open Browse Notes and filter by stream, class and subject."],["Can I download PDFs?","Published resources provide a PDF open/download action when configured."],["Are all subjects available?","Only subjects and resources configured and published by the administrator appear."]].map(([q,a])=><details key={q} className="surface p-5"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-3 text-sm leading-6 text-zinc-400">{a}</p></details>)}</div></section>
  </div>;
}