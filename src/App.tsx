import { Navigate, Route, Routes } from "react-router-dom";
import { PageLayout } from "./components/Layout";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Contact from "./pages/Contact";
import { About, Legal } from "./pages/Info";
import Admin from "./pages/Admin";
import PasswordReset from "./pages/PasswordReset";
import { useAuth } from "./contexts/AuthContext";

function AdminRoute(){const{user,loading,isAdmin}=useAuth();if(loading)return <div className="container-page py-20 text-center text-zinc-400">Checking access...</div>;if(!user)return <Navigate to="/admin/login" replace/>;if(!isAdmin)return <Admin/>;return <Admin/>;}
export default function App(){return <PageLayout><Routes><Route path="/" element={<Home/>}/><Route path="/notes" element={<Notes/>}/><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route path="/admin/login" element={<Auth mode="login"/>}/><Route path="/admin" element={<AdminRoute/>}/><Route path="/account" element={<Account/>}/><Route path="/contact" element={<Contact/>}/><Route path="/about" element={<About/>}/><Route path="/privacy" element={<Legal kind="privacy"/>}/><Route path="/terms" element={<Legal kind="terms"/>}/><Route path="/forgot-password" element={<PasswordReset/>}/><Route path="*" element={<div className="container-page py-24 text-center"><h1 className="text-3xl font-semibold">Page not found</h1><p className="mt-3 text-zinc-400">That page doesn't exist.</p><a className="btn-primary mt-5" href="/">Go home</a></div>}/></Routes></PageLayout>; }