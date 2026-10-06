'use client';
import {FormEvent,useState} from 'react';
import {motion} from 'framer-motion';
import {ArrowRight,Eye,EyeOff,LockKeyhole,ShieldCheck,Sparkles} from 'lucide-react';
import {useRouter} from 'next/navigation';

export default function LoginPage(){
  const router=useRouter();
  const [organizationSlug,setOrganizationSlug]=useState('boulangerie-excellence');
  const [email,setEmail]=useState('proprietaire@demo.boul.ci');
  const [password,setPassword]=useState('');
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  async function submit(event:FormEvent){
    event.preventDefault();setLoading(true);setError('');
    try{
      const response=await fetch('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({organizationSlug,email,password})});
      if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.message??'Connexion impossible');}
      router.push('/');router.refresh();
    }catch(value){setError(value instanceof Error?value.message:'Connexion impossible');}
    finally{setLoading(false)}
  }
  return <main className="min-h-screen bg-[#f5f3ec] grid lg:grid-cols-[1.05fr_.95fr]">
    <section className="hidden lg:flex bg-[#172219] text-white p-12 xl:p-16 relative overflow-hidden flex-col">
      <div className="absolute inset-0 grid-fade opacity-30"/><div className="absolute -right-28 top-20 w-96 h-96 rounded-full bg-[#b7ef5b]/10 blur-3xl"/>
      <Brand/>
      <div className="relative my-auto max-w-[590px]"><span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#b7ef5b]"><Sparkles size={13}/>Le copilote du boulanger</span><h1 className="text-5xl xl:text-6xl leading-[.98] font-black tracking-[-.07em] mt-6">Votre argent.<br/>Enfin expliqué.</h1><p className="text-[#a7b3aa] text-base leading-7 mt-6 max-w-lg">Ventes, matières, production, pertes et bénéfice réunis dans une seule vérité financière.</p><div className="grid grid-cols-3 gap-3 mt-10">{[['37,8 %','marge brute'],['−13 %','invendus'],['86 420 F','gagnés aujourd’hui']].map(([v,l])=><div key={l} className="border border-white/10 bg-white/[.04] rounded-2xl p-4"><div className="font-black text-lg tracking-[-.04em]">{v}</div><div className="text-[9px] text-[#8f9a91] mt-1">{l}</div></div>)}</div></div>
      <div className="relative flex items-center gap-2 text-[10px] text-[#819087]"><ShieldCheck size={13}/>Session chiffrée · Isolation par entreprise</div>
    </section>
    <section className="flex items-center justify-center p-5 md:p-10">
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="w-full max-w-[430px]">
        <div className="lg:hidden mb-10"><Brand dark/></div><div className="w-12 h-12 rounded-2xl bg-[#e5f4ca] grid place-items-center"><LockKeyhole size={19}/></div><h2 className="text-3xl font-black tracking-[-.055em] mt-6">Bon retour parmi nous.</h2><p className="text-sm text-[#7b857d] mt-2">Connectez-vous à votre espace de pilotage.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="Identifiant de la boulangerie"><input value={organizationSlug} onChange={e=>setOrganizationSlug(e.target.value.toLowerCase())} autoComplete="organization" required className="input" placeholder="ma-boulangerie"/></Field>
          <Field label="Adresse e-mail"><input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required className="input" placeholder="vous@boulangerie.ci"/></Field>
          <Field label="Mot de passe"><div className="relative"><input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} autoComplete="current-password" required minLength={8} className="input pr-12" placeholder="Votre mot de passe"/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Masquer le mot de passe':'Afficher le mot de passe'} className="absolute right-1 top-1 w-10 h-10 grid place-items-center text-[#778179]">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></Field>
          {error&&<div role="alert" className="rounded-xl bg-[#fee7e1] text-[#9e493b] p-3 text-xs font-bold">{error}</div>}
          <button disabled={loading} className="w-full h-12 rounded-2xl bg-[#b7ef5b] text-[#172219] font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">{loading?'Connexion…':<>Accéder à mon espace<ArrowRight size={16}/></>}</button>
        </form><p className="text-[10px] text-[#8b938c] text-center mt-6">En continuant, vous acceptez les conditions d’utilisation et la politique de confidentialité.</p>
      </motion.div>
    </section>
    <style jsx>{`.input{width:100%;height:48px;border:1px solid #dcded7;background:white;border-radius:14px;padding:0 14px;font-size:13px;outline:none;transition:.15s}.input:focus{border-color:#8bbf3d;box-shadow:0 0 0 3px rgba(183,239,91,.2)}`}</style>
  </main>
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="block text-[11px] font-bold mb-2">{label}</span>{children}</label>}
function Brand({dark=false}:{dark?:boolean}){return <div className={`relative flex items-center gap-3 ${dark?'text-[#172219]':'text-white'}`}><div className="w-10 h-10 rounded-xl bg-[#b7ef5b] text-[#172219] grid place-items-center font-black text-lg">b.</div><div><div className="text-xl font-black leading-none tracking-[-.06em]">boul.</div><div className={`text-[8px] uppercase tracking-[.2em] mt-1 ${dark?'text-[#768078]':'text-[#829087]'}`}>Business OS</div></div></div>}
