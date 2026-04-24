import { useEffect, useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, getDocs, collection, query, orderBy } from 'firebase/firestore';

export function usePortfolio() {
  const [perfil, setPerfil] = useState<any>(undefined);
  const [servicos, setServicos] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any[]>([]);
  const [projectos, setProjectos] = useState<any[]>([]);
  const [contactos, setContactos] = useState<any[]>([]);
  const [sectores, setSectores] = useState<any[]>([]);
  const [paises, setPaises] = useState<any[]>([]);
  const [ferramentas, setFerramentas] = useState<any[]>([]);
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const fetchData = async () => {
      try {
        const [perfilSnap, configSnap, servicosSnap, projectosSnap, metricasSnap, contactosSnap, sectoresSnap, paisesSnap, ferramentasSnap, depoimentosSnap, parceirosSnap] = await Promise.all([
          getDoc(doc(db, 'perfil', 'principal')),
          getDoc(doc(db, 'configuracoes', 'global')),
          getDocs(query(collection(db, 'servicos'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'projectos'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'metricas'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'contactos'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'sectores'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'paises'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'ferramentas'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'depoimentos'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'parceiros'), orderBy('ordem', 'asc')))
        ]);

        if (perfilSnap.exists()) setPerfil(perfilSnap.data());
        if (configSnap.exists()) setConfig(configSnap.data());
        setServicos(servicosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setProjectos(projectosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setMetricas(metricasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setContactos(contactosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setSectores(sectoresSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPaises(paisesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setFerramentas(ferramentasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setDepoimentos(depoimentosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setParceiros(parceirosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error loading portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { perfil, servicos, metricas, projectos, contactos, sectores, paises, ferramentas, depoimentos, parceiros, config, loading };
}