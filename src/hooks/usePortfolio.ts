import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  normalizeTableRow,
  normalizeTableRows,
} from '../lib/supabase-db';
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
  lastUpdate: string | null;
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
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const subscriptionsRef = useRef<any[]>([]);

  // Função para registrar atualização em tempo real
  const registerRealtimeUpdate = (tableName: string, action: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-PT');
    setLastUpdate(`${timestamp} - ${tableName} ${action}`);
    
    // Mostrar notificação no console
    console.log(`🔄 CMS Realtime Update: ${tableName} ${action} às ${timestamp}`);
    
    // Limpar notificação após 5 segundos
    setTimeout(() => setLastUpdate(null), 5000);
  };

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

  // Função para configurar subscrições realtime
  const setupRealtimeSubscriptions = () => {
    // Subscrição para perfil (único registro)
    const perfilSubscription = supabase
      .channel('perfil_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'perfil' }, 
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setPerfil(normalizeTableRow<PerfilData>('perfil', payload.new as Record<string, unknown>));
            registerRealtimeUpdate('Perfil', payload.eventType === 'INSERT' ? 'adicionado' : 'atualizado');
          }
        }
      )
      .subscribe();
    
    // Subscrição para quemsou (único registro)
    const quemSouSubscription = supabase
      .channel('quemsou_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'quemsou' }, 
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setQuemSou(normalizeTableRow<QuemSouData>('quemsou', payload.new as Record<string, unknown>));
            registerRealtimeUpdate('Quem Sou', payload.eventType === 'INSERT' ? 'adicionado' : 'atualizado');
          }
        }
      )
      .subscribe();

    // Subscrição para configurações (único registro)
    const configSubscription = supabase
      .channel('configuracoes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'configuracoes' }, 
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setConfig(normalizeTableRow<Configuracao>('configuracoes', payload.new as Record<string, unknown>));
          }
        }
      )
      .subscribe();

    // Subscrição para slides (lista)
    const slidesSubscription = supabase
      .channel('slides_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'slides' }, 
        async () => {
          const { data } = await supabase.from('slides').select('*').order('id');
          const normalizedSlides = normalizeTableRows<SlideConfig>('slides', data);
          setSlides(normalizedSlides.length ? normalizedSlides : defaultSlides);
        }
      )
      .subscribe();

    // Subscrição para serviços (lista)
    const servicosSubscription = supabase
      .channel('servicos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'servicos' }, 
        async () => {
          const { data } = await supabase.from('servicos').select('*').order('ordem');
          setServicos(normalizeTableRows<Servico>('servicos', data));
        }
      )
      .subscribe();

    // Subscrição para projetos (lista) - IMPORTANTE para fotos
    const projectosSubscription = supabase
      .channel('projectos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projectos' }, 
        async (payload) => {
          const { data } = await supabase.from('projectos').select('*').order('ordem');
          setProjectos(normalizeTableRows<Projecto>('projectos', data));
          
          const action = payload.eventType === 'INSERT' ? 'adicionado' : 
                        payload.eventType === 'UPDATE' ? 'atualizado' : 'removido';
          registerRealtimeUpdate('Projetos', action);
        }
      )
      .subscribe();

    // Subscrição para métricas (lista)
    const metricasSubscription = supabase
      .channel('metricas_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'metricas' }, 
        async () => {
          const { data } = await supabase.from('metricas').select('*').order('ordem');
          setMetricas(normalizeTableRows<Metrica>('metricas', data));
        }
      )
      .subscribe();

    // Subscrição para depoimentos (lista)
    const depoimentosSubscription = supabase
      .channel('depoimentos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'depoimentos' }, 
        async () => {
          const { data } = await supabase.from('depoimentos').select('*').order('ordem');
          setDepoimentos(normalizeTableRows<Depoimento>('depoimentos', data));
        }
      )
      .subscribe();

    // Subscrição para contactos (lista)
    const contactosSubscription = supabase
      .channel('contactos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contactos' }, 
        async () => {
          const { data } = await supabase.from('contactos').select('*').order('ordem');
          setContactos(normalizeTableRows<Contacto>('contactos', data));
        }
      )
      .subscribe();

    // Subscrição para sectores (lista)
    const sectoresSubscription = supabase
      .channel('sectores_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sectores' }, 
        async () => {
          const { data } = await supabase.from('sectores').select('*').order('ordem');
          setSectores(normalizeTableRows<Sector>('sectores', data));
        }
      )
      .subscribe();

    // Subscrição para países (lista)
    const paisesSubscription = supabase
      .channel('paises_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'paises' }, 
        async () => {
          const { data } = await supabase.from('paises').select('*').order('ordem');
          setPaises(normalizeTableRows<Pais>('paises', data));
        }
      )
      .subscribe();

    // Subscrição para ferramentas (lista)
    const ferramentasSubscription = supabase
      .channel('ferramentas_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ferramentas' }, 
        async () => {
          const { data } = await supabase.from('ferramentas').select('*').order('ordem');
          setFerramentas(normalizeTableRows<Ferramenta>('ferramentas', data));
        }
      )
      .subscribe();

    // Subscrição para parceiros (lista)
    const parceirosSubscription = supabase
      .channel('parceiros_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'parceiros' }, 
        async () => {
          const { data } = await supabase.from('parceiros').select('*').order('ordem');
          setParceiros(normalizeTableRows<Parceiro>('parceiros', data));
        }
      )
      .subscribe();

    // Guardar todas as subscrições para limpeza
    subscriptionsRef.current = [
      perfilSubscription,
      quemSouSubscription,
      configSubscription,
      slidesSubscription,
      servicosSubscription,
      projectosSubscription,
      metricasSubscription,
      depoimentosSubscription,
      contactosSubscription,
      sectoresSubscription,
      paisesSubscription,
      ferramentasSubscription,
      parceirosSubscription
    ];
  };

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

        setPerfil(normalizeTableRow<PerfilData>('perfil', perfilData.data));
        setQuemSou(normalizeTableRow<QuemSouData>('quemsou', quemSouData.data));
        setConfig(normalizeTableRow<Configuracao>('configuracoes', configData.data));
        const normalizedSlides = normalizeTableRows<SlideConfig>('slides', slidesData.data);
        setSlides(normalizedSlides.length ? normalizedSlides : defaultSlides);
        setServicos(normalizeTableRows<Servico>('servicos', servicosData.data));
        setProjectos(normalizeTableRows<Projecto>('projectos', projectosData.data));
        setMetricas(normalizeTableRows<Metrica>('metricas', metricasData.data));
        setDepoimentos(normalizeTableRows<Depoimento>('depoimentos', depoimentosData.data));
        setContactos(normalizeTableRows<Contacto>('contactos', contactosData.data));
        setSectores(normalizeTableRows<Sector>('sectores', sectoresData.data));
        setPaises(normalizeTableRows<Pais>('paises', paisesData.data));
        setFerramentas(normalizeTableRows<Ferramenta>('ferramentas', ferramentasData.data));
        setParceiros(normalizeTableRows<Parceiro>('parceiros', parceirosData.data));

        // Configurar subscrições realtime após carregar dados iniciais
        setupRealtimeSubscriptions();
      } catch (err) {
        console.error('Error loading portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup: cancelar todas as subscrições quando o componente for desmontado
    return () => {
      subscriptionsRef.current.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
      subscriptionsRef.current = [];
    };
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
    lastUpdate,
    loading
  };
}
