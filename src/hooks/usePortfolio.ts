import { useEffect, useState } from 'react';
import { db, subscribeToCollection } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function usePortfolio() {
  const [perfil, setPerfil] = useState<any>(null);
  const [servicos, setServicos] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any[]>([]);
  const [projectos, setProjectos] = useState<any[]>([]);
  const [contactos, setContactos] = useState<any[]>([]);
  const [sectores, setSectores] = useState<any[]>([]);
  const [paises, setPaises] = useState<any[]>([]);
  const [ferramentas, setFerramentas] = useState<any[]>([]);
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar Perfil
    const unsubPerfil = onSnapshot(doc(db, 'perfil', 'principal'), (s) => {
      if (s.exists()) setPerfil(s.data());
    });

    // Escutar Config
    const unsubConfig = onSnapshot(doc(db, 'configuracoes', 'global'), (s) => {
      if (s.exists()) setConfig(s.data());
      setLoading(false);
    });

    // Escutar Coleções
    const unsubServicos = subscribeToCollection('servicos', (list) => {
      if (list.length > 0) setServicos(list);
    });

    const unsubProjectos = subscribeToCollection('projectos', (list) => {
      if (list.length > 0) setProjectos(list);
    });

    const unsubMetricas = subscribeToCollection('metricas', (list) => {
      if (list.length > 0) setMetricas(list);
    });

    const unsubContactos = subscribeToCollection('contactos', (list) => {
      if (list.length > 0) setContactos(list);
    });

    const unsubSectores = subscribeToCollection('sectores', (list) => {
      if (list.length > 0) setSectores(list);
    });

    const unsubPaises = subscribeToCollection('paises', (list) => {
      if (list.length > 0) setPaises(list);
    });

    const unsubFerramentas = subscribeToCollection('ferramentas', (list) => {
      if (list.length > 0) setFerramentas(list);
    });

    const unsubDepoimentos = subscribeToCollection('depoimentos', (list) => {
      if (list.length > 0) setDepoimentos(list);
    });

    const unsubParceiros = subscribeToCollection('parceiros', (list) => {
      if (list.length > 0) setParceiros(list);
    });

    return () => {
      unsubPerfil();
      unsubConfig();
      unsubServicos();
      unsubProjectos();
      unsubMetricas();
      unsubContactos();
      unsubSectores();
      unsubPaises();
      unsubFerramentas();
      unsubDepoimentos();
      unsubParceiros();
    };
  }, []);

  return { perfil, servicos, metricas, projectos, contactos, sectores, paises, ferramentas, depoimentos, parceiros, config, loading };
}
