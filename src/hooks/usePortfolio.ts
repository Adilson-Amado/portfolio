import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { PerfilData, QuemSouData, SlideConfig, Servico, Projecto, Metrica, Depoimento, Contacto, Configuracao, Sector, Pais, Ferramenta, Parceiro } from '../lib/supabase-db';

export interface PortfolioData {
  perfil: PerfilData | null;
  quemSou: QuemSouData | null;
  config: Configuracao | null;
  slides: SlideConfig[];
  servicos: Servico[];
  projectos: Projecto[];
  metricas: Metrica[];
  depoimentos: Depoimento[];
  contactos: Contacto[];
  sectores: Sector[];
  paises: Pais[];
  ferramentas: Ferramenta[];
  parceiros: Parceiro[];
}

export function usePortfolio() {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [quemSou, setQuemSou] = useState<QuemSouData | null>(null);
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [slides, setSlides] = useState<SlideConfig[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [projectos, setProjectos] = useState<Projecto[]>([]);
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const defaultSlides: SlideConfig[] = [
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

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const fetchData = async () => {
      try {
        const [
          perfilData,
          quemSouData,
          configData,
          slidesData,
          servicosData,
          projectosData,
          metricasData,
          depoimentosData,
          contactosData,
          sectoresData,
          paisesData,
          ferramentasData,
          parceirosData
        ] = await Promise.all([
          supabase.from('perfil').select('*').single(),
          supabase.from('quemsou').select('*').single(),
          supabase.from('configuracoes').select('*').single(),
          supabase.from('slides').select('*').order('id'),
          supabase.from('servicos').select('*').order('ordem'),
          supabase.from('projectos').select('*').order('ordem'),
          supabase.from('metricas').select('*').order('ordem'),
          supabase.from('depoimentos').select('*').order('ordem'),
          supabase.from('contactos').select('*').order('ordem'),
          supabase.from('sectores').select('*').order('ordem'),
          supabase.from('paises').select('*').order('ordem'),
          supabase.from('ferramentas').select('*').order('ordem'),
          supabase.from('parceiros').select('*').order('ordem')
        ]);

        setPerfil(perfilData.data);
        setQuemSou(quemSouData.data);
        setConfig(configData.data);
        setSlides(slidesData.data?.length ? slidesData.data : defaultSlides);
        setServicos(servicosData.data || []);
        setProjectos(projectosData.data || []);
        setMetricas(metricasData.data || []);
        setDepoimentos(depoimentosData.data || []);
        setContactos(contactosData.data || []);
        setSectores(sectoresData.data || []);
        setPaises(paisesData.data || []);
        setFerramentas(ferramentasData.data || []);
        setParceiros(parceirosData.data || []);
      } catch (err) {
        console.error('Error loading portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    perfil,
    quemSou,
    servicos,
    metricas,
    projectos,
    contactos,
    sectores,
    paises,
    ferramentas,
    depoimentos,
    parceiros,
    config,
    slides,
    loading
  };
}