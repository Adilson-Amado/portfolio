import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, Plus, Trash2, Loader2, 
  User, Briefcase, Layers, BarChart3, Users, Mail, 
  Globe, Search, Bell, Settings, LayoutDashboard, ChevronRight,
  Database, Upload, Building2, Shield, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PerfilData, QuemSouData, SlideConfig, Servico, Projecto, Metrica, Depoimento, Contacto, Configuracao, Sector, Pais, Ferramenta, Parceiro } from '../lib/supabase-db';
import { savePerfil, saveQuemSou, saveSlide, saveServico, saveProjecto, saveMetrica, saveDepoimento, saveContacto, saveConfig, saveSector, savePais, saveFerramenta, saveParceiro, addServico, addProjecto, addMetrica, addDepoimento, addContacto, addSector, addPais, addFerramenta, addParceiro, deleteServico, deleteProjecto, deleteMetrica, deleteDepoimento, deleteContacto, deleteSector, deletePais, deleteFerramenta, deleteParceiro } from '../lib/supabase-db';

const ADMIN_PIN = '1234';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [itemsCount, setItemsCount] = useState<any>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadCounts = async () => {
      const collections = ['servicos', 'projectos', 'metricas', 'depoimentos', 'contactos', 'sectores', 'paises', 'ferramentas', 'parceiros'];
      const counts: any = {};
      for (const col of collections) {
        const { count } = await supabase.from(col).select('*', { count: 'exact', head: true });
        counts[col] = count || 0;
      }
      setItemsCount(counts);
    };
    loadCounts();
  }, []);

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
    } else {
      setStatus('PIN incorreto');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const showStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 text-center">
        <button onClick={onClose} className="absolute top-10 right-10 text-zinc-400 hover:text-brand-orange"><X className="h-6 w-6" /></button>
        <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mb-8">
          <Shield className="h-8 w-8 text-brand-orange" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-display font-bold mb-8 uppercase tracking-tighter">Acesso Admin CMS</h2>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map(i => (
            <input
              key={i}
              type="password"
              maxLength={1}
              value={pinInput[i-1] || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 1) {
                  const newPin = pinInput.split('');
                  newPin[i-1] = val;
                  const finalPin = newPin.join('');
                  setPinInput(finalPin);
                  if (finalPin.length === 4) {
                    setTimeout(() => {
                      if (finalPin === ADMIN_PIN) setIsAuthenticated(true);
                      else { setStatus('PIN incorreto'); setPinInput(''); }
                    }, 100);
                  }
                }
              }}
              className="w-14 h-16 bg-zinc-50 border border-zinc-200 rounded-xl text-center text-2xl font-bold focus:ring-2 focus:ring-brand-orange outline-none"
            />
          ))}
        </div>
        <button 
          onClick={handlePinSubmit}
          className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-brand-orange transition-all"
        >
          Entrar
        </button>
        {status && <p className="mt-4 text-red-500 font-bold">{status}</p>}
      </div>
    );
  }

  const menuItems = [
    { id: 'slides', label: 'Slides', icon: LayoutDashboard, category: 'Menu' },
    { id: 'quemSou', label: 'Quem Sou Eu', icon: User, category: 'Menu' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Menu' },
    { id: 'perfil', label: 'Perfil', icon: User, category: 'Menu' },
    { id: 'servicos', label: 'Serviços', icon: Briefcase, category: 'Menu' },
    { id: 'projectos', label: 'Projectos', icon: Layers, category: 'Menu' },
    { id: 'metricas', label: 'Estatísticas', icon: BarChart3, category: 'Menu' },
    { id: 'depoimentos', label: 'Testemunhos', icon: Users, category: 'Social' },
    { id: 'contactos', label: 'Contactos', icon: Mail, category: 'Social' },
    { id: 'parceiros', label: 'Parceiros', icon: Building2, category: 'Social' },
    { id: 'sectores', label: 'Sectores', icon: List, category: 'Social' },
    { id: 'paises', label: 'Países', icon: Flag, category: 'Social' },
    { id: 'ferramentas', label: 'Ferramentas', icon: Cpu, category: 'Social' },
    { id: 'config', label: 'Configs', icon: Globe, category: 'Social' },
  ];

  return (
    <div className="fixed inset-0 bg-[#F5F7FB] z-[200] flex overflow-hidden font-sans text-brand-dark">
      <aside className="w-20 lg:w-72 bg-white flex flex-col shrink-0 border-r border-zinc-100 shadow-sm">
        <div className="p-6 pb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-orange/20">
             <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-lg uppercase tracking-tighter hidden lg:block">Admin<span className="text-brand-orange">Panel</span></span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-6">
           <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 mb-4 px-3 hidden lg:block">Navegação</p>
              <nav className="space-y-1">
                {menuItems.filter(i => i.category === 'Menu').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-zinc-400 hover:bg-zinc-50 hover:text-brand-orange'}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="font-bold text-[12px] hidden lg:block">{item.label}</span>
                  </button>
                ))}
              </nav>
           </div>

           <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 mb-4 px-3 hidden lg:block">Integrações</p>
              <nav className="space-y-1">
                {menuItems.filter(i => i.category === 'Social').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-zinc-400 hover:bg-zinc-50 hover:text-brand-orange'}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="font-bold text-[12px] hidden lg:block">{item.label}</span>
                  </button>
                ))}
              </nav>
           </div>
        </div>

        <div className="p-3 border-t border-zinc-100">
          <button onClick={onClose} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <X className="h-4 w-4 shrink-0" />
            <span className="font-bold text-[12px] hidden lg:block">Fechar</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white flex items-center justify-between px-6 lg:px-10 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-6 flex-1 max-w-xl">
             <div className="relative w-full hidden sm:block">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
               <input type="text" placeholder="Pesquisar..." className="w-full bg-[#F5F7FB] border-none rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-medium focus:ring-1 focus:ring-brand-orange focus:bg-white transition-all outline-none" />
             </div>
             <button className="p-2.5 bg-[#F5F7FB] rounded-xl text-zinc-400 hover:text-brand-orange transition-all">
                <Settings className="h-4 w-4" />
             </button>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
               <div className="relative p-2.5 bg-[#F5F7FB] rounded-xl text-zinc-400">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-orange rounded-full border-2 border-white"></span>
               </div>
            </div>
            <button onClick={onClose} className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-brand-orange transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-1 px-1">
               <div>
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{activeTab}</h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-1">Visão Geral e Gestão</p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl shadow-zinc-200/40 border border-zinc-100 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                  {activeTab === 'dashboard' && <DashboardOverview counts={itemsCount} setTab={setActiveTab} />}
                  {activeTab === 'slides' && <EditorSlides showStatus={showStatus} />}
                  {activeTab === 'quemSou' && <EditorQuemSou showStatus={showStatus} />}
                  {activeTab === 'perfil' && <EditorPerfil showStatus={showStatus} />}
                  {activeTab === 'servicos' && <CollectionManager colName="servicos" title="Serviços" defaultItem={{ titulo: 'Novo Serviço', descricao: '', corFundo: 'azul-escuro', ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'projectos' && <CollectionManager colName="projectos" title="Projectos" defaultItem={{ titulo: 'Novo Projecto', categoria: 'Design', nomeCliente: '', ano: '2025', emDestaque: false, ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'metricas' && <CollectionManager colName="metricas" title="Estatísticas" defaultItem={{ valor: '0', sufixo: '+', legenda: 'Nova Métrica', ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'depoimentos' && <CollectionManager colName="depoimentos" title="Testemunhos" defaultItem={{ texto: '', autor: 'Nome', cargo: '', organizacao: '', iniciais: 'NA', emDestaque: false, ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'contactos' && <CollectionManager colName="contactos" title="Contactos" defaultItem={{ tipo: 'email', etiqueta: 'Novo Canal', valor: '', link: '', ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'sectores' && <CollectionManager colName="sectores" title="Sectores" defaultItem={{ nome: 'Novo Sector', ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'paises' && <CollectionManager colName="paises" title="Países" defaultItem={{ nome: 'Novo País', bandeira: '🌍', descricao: '', ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'ferramentas' && <CollectionManager colName="ferramentas" title="Ferramentas" defaultItem={{ nome: 'Nova Ferramenta', grupo: 'outras', ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'parceiros' && <CollectionManager colName="parceiros" title="Parceiros" defaultItem={{ nome: 'Empresa', logo: '', link: '', ordem: 1, ativo: true }} showStatus={showStatus} />}
                  {activeTab === 'config' && <EditorConfig showStatus={showStatus} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
      
      {status && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-10 right-10 bg-brand-dark text-white p-4 rounded-2xl shadow-2xl text-[10px] uppercase font-bold tracking-[0.2em] z-[300]">
          {status}
        </motion.div>
      )}
    </div>
  );
}

function DashboardOverview({ counts, setTab }: { counts: any, setTab: (t: string) => void }) {
  const cards = [
    { id: 'projectos', label: 'Projetos', count: counts.projectos || 0, icon: Layers, color: 'bg-brand-orange' },
    { id: 'servicos', label: 'Serviços', count: counts.servicos || 0, icon: Briefcase, color: 'bg-brand-dark' },
    { id: 'contactos', label: 'Contactos', count: counts.contactos || 0, icon: Mail, color: 'bg-zinc-500' },
    { id: 'depoimentos', label: 'Testemunhos', count: counts.depoimentos || 0, icon: Users, color: 'bg-brand-cream' },
  ];
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <button key={card.id} onClick={() => setTab(card.id)} className="flex flex-col p-6 bg-[#F5F7FB] border border-zinc-100 rounded-xl hover:border-brand-orange transition-all group text-left">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white mb-4 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
               <card.icon className="h-5 w-5" />
            </div>
            <span className="text-2xl font-display font-bold leading-none mb-1">{card.count}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{card.label}</span>
          </button>
        ))}
      </div>
      <div className="p-8 bg-brand-dark rounded-xl text-white">
        <h3 className="text-xl font-display font-bold uppercase mb-2">Bem-vindo, Administrador</h3>
        <p className="text-[11px] opacity-60 uppercase tracking-widest font-bold max-w-sm mb-6">Explore o painel para gerir o seu portfólio.</p>
        <button onClick={() => setTab('perfil')} className="bg-brand-orange px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">Configurar Perfil</button>
      </div>
    </div>
  );
}

function EditorSlides({ showStatus }: { showStatus: (m: string) => void }) {
  const [slides, setSlides] = useState<SlideConfig[]>([]);
  useEffect(() => {
    supabase.from('slides').select('*').order('id').then(({ data }) => {
      setSlides(data || getDefaultSlides());
    });
  }, []);
  const getDefaultSlides = () => [
    { id: 'slide-01', titulo: 'QUEM SOU', eyebrow: 'Quem Sou' },
    { id: 'slide-02', titulo: 'O QUE FAÇO', eyebrow: 'Expertise' },
    { id: 'slide-03', titulo: 'NÚMEROS QUE FALAM', eyebrow: 'Performance' },
    { id: 'slide-04', titulo: 'PROJETOS', eyebrow: 'Trabalhos' },
    { id: 'slide-05', titulo: 'CLIENTES E SECTORES', eyebrow: 'Global' },
    { id: 'slide-06', titulo: 'PARCEIROS', eyebrow: 'Parcerias' },
    { id: 'slide-07', titulo: 'TESTEMUNHOS', eyebrow: 'Depoimentos' },
    { id: 'slide-08', titulo: 'FERRAMENTAS', eyebrow: 'Tecnologias' },
    { id: 'slide-09', titulo: 'CONTACTOS', eyebrow: 'Fale Comigo' },
  ];
  const updateSlide = async (id: string, field: string, value: string) => {
    setSlides(s => s.map(sl => sl.id === id ? { ...sl, [field]: value } : sl));
    await saveSlide(id, { [field]: value });
    showStatus('Guardado!');
  };
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="p-6 bg-white border border-zinc-100 rounded-2xl flex flex-col gap-4 hover:border-brand-orange/20 transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-brand-orange">{String(idx + 1).padStart(2, '0')}</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{slide.id}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400">Título</label>
                <input type="text" value={slide.titulo} onChange={e => updateSlide(slide.id, 'titulo', e.target.value)} className="w-full bg-zinc-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-brand-orange transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400">Eyebrow</label>
                <input type="text" value={slide.eyebrow} onChange={e => updateSlide(slide.id, 'eyebrow', e.target.value)} className="w-full bg-zinc-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-brand-orange transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorQuemSou({ showStatus }: { showStatus: (m: string) => void }) {
  const [data, setData] = useState<QuemSouData | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase.from('quemsou').select('*').single().then(({ data: d }) => {
      setData(d || { nomePrimeiraLinha: 'Adilson', nomeDestaque: 'Pinto', biografia: '', fotografia: '', tags: [] });
    });
  }, []);
  const save = async () => {
    setSaving(true);
    await saveQuemSou(data!);
    setSaving(false);
    showStatus('Guardado!');
  };
  if (!data) return <div className="animate-pulse h-32 bg-zinc-100 rounded-xl" />;
  const updateTag = (i: number, v: string) => { const t = [...data.tags]; t[i] = v; setData({ ...data, tags: t }); };
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Nome (Primeira Linha)</label>
          <input type="text" value={data.nomePrimeiraLinha} onChange={e => setData({...data, nomePrimeiraLinha: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Nome em Destaque (Laranja)</label>
          <input type="text" value={data.nomeDestaque} onChange={e => setData({...data, nomeDestaque: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="md:col-span-2 space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Biografia</label>
          <textarea value={data.biografia} onChange={e => setData({...data, biografia: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none h-32 transition-all font-medium text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Fotografia</label>
          {data.fotografia && <img src={data.fotografia} className="w-16 h-16 rounded-xl object-cover" />}
          <input type="text" value={data.fotografia} onChange={e => setData({...data, fotografia: e.target.value})} placeholder="URL da imagem" className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
      </div>
      <div className="space-y-3">
        <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Tags</label>
        <div className="flex flex-wrap gap-2">
          {data.tags.map((t, i) => (
            <div key={i} className="flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/20 rounded-full px-4 py-2">
              <input value={t} onChange={e => updateTag(i, e.target.value)} className="bg-transparent text-[10px] font-bold uppercase outline-none w-32" />
            </div>
          ))}
          <button onClick={() => setData({...data, tags: [...data.tags, 'NOVA TAG']})} className="px-4 py-2 bg-zinc-100 rounded-full text-[10px] font-bold uppercase hover:bg-brand-orange hover:text-white transition-all">+ Tag</button>
        </div>
      </div>
      <button onClick={save} disabled={saving} className="flex items-center justify-center gap-3 bg-brand-orange text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 rounded-xl">
        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Guardar
      </button>
    </div>
  );
}

function EditorPerfil({ showStatus }: { showStatus: (m: string) => void }) {
  const [data, setData] = useState<PerfilData | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase.from('perfil').select('*').single().then(({ data: d }) => setData(d));
  }, []);
  const save = async () => {
    setSaving(true);
    await savePerfil(data!);
    setSaving(false);
    showStatus('Guardado!');
  };
  if (!data) return <div className="animate-pulse h-32 bg-zinc-100 rounded-xl" />;
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Nome Completo</label><input type="text" value={data.nomeCompleto || ''} onChange={e => setData({...data, nomeCompleto: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
        <div className="space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Destaque Nome</label><input type="text" value={data.destaqueNome || ''} onChange={e => setData({...data, destaqueNome: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
        <div className="space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Eyebrow</label><input type="text" value={data.eyebrowEntrada || ''} onChange={e => setData({...data, eyebrowEntrada: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
        <div className="space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Tagline</label><input type="text" value={data.tagline || ''} onChange={e => setData({...data, tagline: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
        <div className="md:col-span-2 space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Biografia</label><textarea value={data.biografia || ''} onChange={e => setData({...data, biografia: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none h-32 font-medium text-sm" /></div>
        <div className="space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Label Botão Início</label><input type="text" value={data.labelBotaoInicio || ''} onChange={e => setData({...data, labelBotaoInicio: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
        <div className="space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Label Botão Final</label><input type="text" value={data.labelBotaoAcaoFinal || ''} onChange={e => setData({...data, labelBotaoAcaoFinal: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
      </div>
      <button onClick={save} disabled={saving} className="flex items-center justify-center gap-3 bg-brand-orange text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-brand-dark rounded-xl">{saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Guardar</button>
    </div>
  );
}

function EditorConfig({ showStatus }: { showStatus: (m: string) => void }) {
  const [data, setData] = useState<Configuracao | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase.from('configuracoes').select('*').single().then(({ data: d }) => setData(d));
  }, []);
  const save = async () => {
    setSaving(true);
    await saveConfig(data!);
    setSaving(false);
    showStatus('Guardado!');
  };
  if (!data) return <div className="animate-pulse h-32 bg-zinc-100 rounded-xl" />;
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Nome Agência</label><input type="text" value={data.nomeAgencia || ''} onChange={e => setData({...data, nomeAgencia: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
        <div className="space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Etiqueta Contacto</label><input type="text" value={data.etiquetaRodapeContacto || ''} onChange={e => setData({...data, etiquetaRodapeContacto: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
        <div className="md:col-span-2 space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Serviços Rodapé</label><input type="text" value={data.servicosRodape || ''} onChange={e => setData({...data, servicosRodape: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none font-bold text-sm" /></div>
        <div className="md:col-span-2 space-y-3"><label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Processo Trabalho</label><textarea value={data.processoTrabalho || ''} onChange={e => setData({...data, processoTrabalho: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none h-32 font-medium text-sm" /></div>
      </div>
      <button onClick={save} disabled={saving} className="flex items-center justify-center gap-3 bg-brand-orange text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-brand-dark rounded-xl">{saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Guardar</button>
    </div>
  );
}

function CollectionManager({ colName, title, defaultItem, showStatus }: { colName: string, title: string, defaultItem: any, showStatus: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from(colName).select('*').order('ordem').then(({ data }) => setItems(data || []));
  }, [colName]);
  const addItem = async () => {
    const id = await addFunctions[colName](defaultItem);
    setItems([...items, { id, ...defaultItem }]);
    showStatus('Adicionado!');
  };
  const deleteItem = async (id: string) => {
    if (!confirm('Eliminar?')) return;
    await deleteFunctions[colName](id);
    setItems(items.filter(i => i.id !== id));
    showStatus('Eliminado!');
  };
  const updateItem = async (id: string, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    await updateFunctions[colName](id, { [field]: value });
    showStatus('Guardado!');
  };
  const getFields = () => Object.keys(defaultItem).filter(k => k !== 'id');
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-zinc-50 p-5 rounded-xl">
        <div><h3 className="text-lg font-display font-bold uppercase tracking-tight leading-none">{title}</h3><p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{items.length} Itens</p></div>
        <button onClick={addItem} className="p-3 bg-brand-orange text-white rounded-lg hover:bg-brand-dark transition-all"><Plus className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {items.map(item => (
          <div key={item.id} className="p-6 bg-white border border-zinc-100 rounded-2xl flex flex-col gap-6 group hover:border-brand-orange/20 transition-all overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-zinc-300">#{item.ordem || 0}</div>
                <h4 className="text-sm font-bold uppercase tracking-tight">{item.titulo || item.nome || item.texto || item.valor || 'Sem Título'}</h4>
              </div>
              <button onClick={() => deleteItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFields().map(field => (
                <div key={field} className="space-y-1.5">
                  <label className="block text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400">{field}</label>
                  {typeof item[field] === 'boolean' ? (
                    <button onClick={() => updateItem(item.id, field, !item[field])} className={`w-full py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${item[field] ? 'bg-brand-orange text-white' : 'bg-zinc-100 text-zinc-400'}`}>{item[field] ? 'Sim' : 'Não'}</button>
                  ) : (
                    <input type="text" value={item[field] || ''} onChange={e => updateItem(item.id, field, e.target.value)} className="w-full bg-zinc-50 rounded-lg p-2.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-brand-orange transition-all" />
                  )}
                </div>
              ))}
              <div className="space-y-1.5"><label className="block text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400">Ordem</label><input type="number" value={item.ordem || 0} onChange={e => updateItem(item.id, 'ordem', parseInt(e.target.value) || 0)} className="w-full bg-zinc-50 rounded-lg p-2.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-brand-orange" /></div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="py-16 flex flex-col items-center justify-center opacity-10 text-center"><LayoutDashboard className="h-16 w-16 mb-4" /><p className="font-bold uppercase tracking-widest text-[10px]">Sem dados</p></div>}
      </div>
    </div>
  );
}

const addFunctions: Record<string, (d: any) => Promise<string>> = {
  servicos: addServico, projectos: addProjecto, metricas: addMetrica,
  depoimentos: addDepoimento, contactos: addContacto, sectores: addSector,
  paises: addPais, ferramentas: addFerramenta, parceiros: addParceiro
};

const updateFunctions: Record<string, (id: string, d: any) => Promise<void>> = {
  servicos: saveServico, projectos: saveProjecto, metricas: saveMetrica,
  depoimentos: saveDepoimento, contactos: saveContacto, sectores: saveSector,
  paises: savePais, ferramentas: saveFerramenta, parceiros: saveParceiro
};

const deleteFunctions: Record<string, (id: string) => Promise<void>> = {
  servicos: deleteServico, projectos: deleteProjecto, metricas: deleteMetrica,
  depoimentos: deleteDepoimento, contactos: deleteContacto, sectores: deleteSector,
  paises: deletePais, ferramentas: deleteFerramenta, parceiros: deleteParceiro
};