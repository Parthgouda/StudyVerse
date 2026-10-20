import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, BookOpen, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const schema = z.object({ name: z.string().optional(), email: z.string().email("Enter a valid email address"), password: z.string().min(8, "Password must be at least 8 characters") });
type Values = z.infer<typeof schema>;
export default function Auth({ mode }: { mode: "login" | "register" }) {
  const [showPassword,setShowPassword] = useState(false);
  const [busy,setBusy] = useState(false);
  const navigate = useNavigate();
  const { register,handleSubmit,formState:{errors} } = useForm<Values>({ resolver:zodResolver(schema), defaultValues:{name:"",email:"",password:""} });
  const submit = async (values:Values) => {
    if (!isSupabaseConfigured) { toast.error("Configure Supabase in .env.local first."); return; }
    setBusy(true);
    try {
      if (mode==="register") {
        const {error} = await supabase.auth.signUp({email:values.email,password:values.password,options:{data:{display_name:values.name || ""}}});
        if (error) throw error;
        toast.success("Account request submitted. Check your email if confirmation is enabled.");
        navigate("/login");
      } else {
        const {error} = await supabase.auth.signInWithPassword({email:values.email,password:values.password});
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/account");
      }
    } catch(e) { toast.error(e instanceof Error ? e.message : "Authentication failed."); }
    finally { setBusy(false); }
  };
  return <div className="container-page grid min-h-[75vh] place-items-center py-12"><div className="surface w-full max-w-md p-7 sm:p-9"><Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={15}/> Back to home</Link><div className="mb-5 grid size-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-300"><BookOpen size={24}/></div><h1 className="text-3xl font-semibold">{mode==="login"?"Welcome back":"Create your account"}</h1><p className="mt-2 text-sm leading-6 text-zinc-400">{mode==="login"?"Log in to save your favourite resources.":"Join StudyVerse to save useful study resources."}</p>
    {!isSupabaseConfigured && <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">Supabase credentials are missing. Configure `.env.local` before using authentication.</p>}
    <form className="mt-6 space-y-4" onSubmit={handleSubmit(submit)}>{mode==="register" && <label className="block text-sm">Display name<input className="field mt-1.5" placeholder="Your name" {...register("name")}/></label>}<label className="block text-sm">Email address<input className="field mt-1.5" type="email" placeholder="you@example.com" {...register("email")}/>{errors.email && <span className="mt-1 block text-xs text-rose-300">{errors.email.message}</span>}</label><label className="block text-sm">Password<div className="relative mt-1.5"><input className="field pr-12" type={showPassword?"text":"password"} placeholder="At least 8 characters" {...register("password")}/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{errors.password && <span className="mt-1 block text-xs text-rose-300">{errors.password.message}</span>}</label>{mode==="login" && <div className="text-right"><Link to="/forgot-password" className="text-xs text-violet-300">Forgot password?</Link></div>}<button disabled={busy} className="btn-primary w-full disabled:opacity-50">{busy?"Please wait...":mode==="login"?"Log in":"Create account"}</button></form><p className="mt-6 text-center text-sm text-zinc-500">{mode==="login"?"New to StudyVerse? ":"Already have an account? "}<Link className="text-violet-300" to={mode==="login"?"/register":"/login"}>{mode==="login"?"Create an account":"Log in"}</Link></p>
  </div></div>;
}