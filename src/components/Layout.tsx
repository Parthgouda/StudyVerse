import { Link, NavLink } from "react-router-dom";
import { BookOpen, Menu, X, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const links = [["Home", "/"], ["Browse Notes", "/notes"], ["About", "/about"], ["Contact", "/contact"]];
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0f]/90 backdrop-blur-xl">
    <div className="container-page flex h-[72px] items-center justify-between gap-5">
      <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-lg"><span className="grid size-9 place-items-center rounded-xl bg-violet-500"><BookOpen size={20}/></span>Study<span className="text-violet-400">Verse</span></Link>
      <nav className="hidden items-center gap-7 md:flex">{links.map(([label, to]) => <NavLink key={to} to={to} className={({isActive}) => `text-sm transition ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`}>{label}</NavLink>)}</nav>
      <div className="hidden items-center gap-2 md:flex">{user ? <><Link to="/account" className="btn-secondary text-sm"><UserRound size={16}/> Account</Link><button onClick={() => void signOut()} className="btn-secondary text-sm" aria-label="Sign out"><LogOut size={16}/></button></> : <><Link to="/login" className="text-sm text-zinc-300 px-3 py-2">Log in</Link><Link to="/register" className="btn-primary text-sm">Get started</Link></>}</div>
      <button className="md:hidden btn-secondary !p-2" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <nav className="container-page grid gap-1 pb-4 md:hidden">{links.map(([label,to]) => <Link onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/5" key={to} to={to}>{label}</Link>)}<Link className="px-3 py-2 text-violet-300" to={user ? "/account" : "/login"}>{user ? "My account" : "Log in / Register"}</Link></nav>}
  </header>;
}
export function Footer() { return <footer className="mt-24 border-t border-white/10"><div className="container-page grid gap-8 py-10 sm:grid-cols-2"><div><Link to="/" className="font-bold text-lg">Study<span className="text-violet-400">Verse</span></Link><p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">A simple place to discover and access free study resources for Class 11 and Class 12.</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-400 sm:justify-end"><Link to="/notes">Browse notes</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div></div><div className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">© {new Date().getFullYear()} StudyVerse. Learn without limits.</div></footer>; }
export function PageLayout({ children }: { children: React.ReactNode }) { return <><Navbar/><main className="min-h-[65vh]">{children}</main><Footer/></>; }