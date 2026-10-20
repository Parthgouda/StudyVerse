import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, LogOut, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { getPublishedNotes } from "../services/notes";
import { NoteCard } from "../components/NoteCard";
import type { Note } from "../types";

export default function Account() {
 const {user,signOut,isAdmin} = useAuth(); const [favorites,setFavorites] = useState<Note[]>([]);
 useEffect(()=>{ if(!user || !isSupabaseConfigured)return; supabase.from("favorites").select("note_id").eq("user_id",user.id).then(async({data,error})=>{if(error){toast.error("Could not load favourites.");return;}const all=await getPublishedNotes();setFavorites(all.filter(n=>data?.some(f=>f.note_id===n.id)));});},[user]);
 if(!user)return <div className="container-page py-20 text-center"><h1 className="text-3xl font-semibold">Log in to view your account</h1><Link className="btn-primary mt-5" to="/login">Log in</Link></div>;
 return <div className="container-page py-12"><div className="surface flex flex-wrap items-center justify-between gap-5 p-6"><div><p className="text-sm text-violet-300">Student space</p><h1 className="mt-2 text-3xl font-semibold">Your account</h1><p className="mt-2 text-sm text-zinc-400">{user.email}</p></div><div className="flex gap-2">{isAdmin&&<Link className="btn-primary" to="/admin"><ShieldCheck size={16}/> Admin dashboard</Link>}<button className="btn-secondary" onClick={async()=>{await signOut();toast.success("Signed out.");}}><LogOut size={16}/> Sign out</button></div></div><div className="mt-10"><h2 className="flex items-center gap-2 text-2xl font-semibold"><Bookmark className="text-violet-300"/> Favourite notes</h2>{favorites.length?<div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{favorites.map(n=><NoteCard key={n.id} note={n}/>)}</div>:<div className="surface mt-5 p-7 text-sm text-zinc-400">No favourites saved yet. Browse the library to discover notes.</div>}</div></div>;
}