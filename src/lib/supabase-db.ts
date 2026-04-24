import { supabase } from './supabase';

export interface PerfilData {
  fotografia: string;
  nomeCompleto: string;
  destaqueNome: string;
  eyebrowEntrada: string;
  tagline: string;
  biografia: string;
  labelBotaoInicio: string;
  labelBotaoAcaoFinal: string;
  anoPortfolio: string;
}

export interface QuemSouData {
  nomePrimeiraLinha: string;
  nomeDestaque: string;
  biografia: string;
  fotografia: string;
  tags: string[];
}

export interface SlideConfig {
  id: string;
  titulo: string;
  eyebrow: string;
}

export interface Servico {
  id: string;
  titulo: string;
  descricao: string;
  corFundo: 'azul-escuro' | 'laranja';
  ordem: number;
  ativo: boolean;
}

export interface Projecto {
  id: string;
  titulo: string;
  categoria: string;
  nomeCliente: string;
  ano: string;
  imagemDestaque: string;
  emDestaque: boolean;
  ordem: number;
  ativo: boolean;
}

export interface Metrica {
  id: string;
  valor: string;
  sufixo: string;
  legenda: string;
  ordem: number;
  ativo: boolean;
}

export interface Depoimento {
  id: string;
  texto: string;
  autor: string;
  cargo: string;
  organizacao: string;
  iniciais: string;
  emDestaque: boolean;
  ordem: number;
  ativo: boolean;
}

export interface Contacto {
  id: string;
  tipo: 'email' | 'whatsapp' | 'instagram';
  etiqueta: string;
  valor: string;
  link: string;
  ordem: number;
  ativo: boolean;
}

export interface Configuracao {
  nomeAgencia: string;
  servicosRodape: string;
  processoTrabalho: string;
  etiquetaRodapeContacto: string;
}

export interface Sector {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export interface Pais {
  id: string;
  nome: string;
  bandeira: string;
  descricao: string;
  ordem: number;
  ativo: boolean;
}

export interface Ferramenta {
  id: string;
  nome: string;
  grupo: 'adobe' | 'outras';
  ordem: number;
  ativo: boolean;
}

export interface Parceiro {
  id: string;
  nome: string;
  logo: string;
  link: string;
  ordem: number;
  ativo: boolean;
}

export async function getPerfil(): Promise<PerfilData | null> {
  const { data } = await supabase.from('perfil').select('*').single();
  return data;
}

export async function getQuemSou(): Promise<QuemSouData | null> {
  const { data } = await supabase.from('quemsou').select('*').single();
  return data;
}

export async function getSlides(): Promise<SlideConfig[]> {
  const { data } = await supabase.from('slides').select('*').order('id');
  return data || [];
}

export async function getServicos(): Promise<Servico[]> {
  const { data } = await supabase.from('servicos').select('*').order('ordem');
  return data || [];
}

export async function getProjectos(): Promise<Projecto[]> {
  const { data } = await supabase.from('projectos').select('*').order('ordem');
  return data || [];
}

export async function getMetricas(): Promise<Metrica[]> {
  const { data } = await supabase.from('metricas').select('*').order('ordem');
  return data || [];
}

export async function getDepoimentos(): Promise<Depoimento[]> {
  const { data } = await supabase.from('depoimentos').select('*').order('ordem');
  return data || [];
}

export async function getContactos(): Promise<Contacto[]> {
  const { data } = await supabase.from('contactos').select('*').order('ordem');
  return data || [];
}

export async function getConfig(): Promise<Configuracao | null> {
  const { data } = await supabase.from('configuracoes').select('*').single();
  return data;
}

export async function getSectores(): Promise<Sector[]> {
  const { data } = await supabase.from('sectores').select('*').order('ordem');
  return data || [];
}

export async function getPaises(): Promise<Pais[]> {
  const { data } = await supabase.from('paises').select('*').order('ordem');
  return data || [];
}

export async function getFerramentas(): Promise<Ferramenta[]> {
  const { data } = await supabase.from('ferramentas').select('*').order('ordem');
  return data || [];
}

export async function getParceiros(): Promise<Parceiro[]> {
  const { data } = await supabase.from('parceiros').select('*').order('ordem');
  return data || [];
}

export async function savePerfil(data: PerfilData): Promise<void> {
  await supabase.from('perfil').upsert(data);
}

export async function saveQuemSou(data: QuemSouData): Promise<void> {
  await supabase.from('quemsou').upsert(data);
}

export async function saveSlide(id: string, data: Partial<SlideConfig>): Promise<void> {
  await supabase.from('slides').upsert({ id, ...data });
}

export async function saveServico(id: string, data: Partial<Servico>): Promise<void> {
  await supabase.from('servicos').upsert({ id, ...data });
}

export async function saveProjecto(id: string, data: Partial<Projecto>): Promise<void> {
  await supabase.from('projectos').upsert({ id, ...data });
}

export async function saveMetrica(id: string, data: Partial<Metrica>): Promise<void> {
  await supabase.from('metricas').upsert({ id, ...data });
}

export async function saveDepoimento(id: string, data: Partial<Depoimento>): Promise<void> {
  await supabase.from('depoimentos').upsert({ id, ...data });
}

export async function saveContacto(id: string, data: Partial<Contacto>): Promise<void> {
  await supabase.from('contactos').upsert({ id, ...data });
}

export async function saveConfig(data: Configuracao): Promise<void> {
  await supabase.from('configuracoes').upsert(data);
}

export async function saveSector(id: string, data: Partial<Sector>): Promise<void> {
  await supabase.from('sectores').upsert({ id, ...data });
}

export async function savePais(id: string, data: Partial<Pais>): Promise<void> {
  await supabase.from('paises').upsert({ id, ...data });
}

export async function saveFerramenta(id: string, data: Partial<Ferramenta>): Promise<void> {
  await supabase.from('ferramentas').upsert({ id, ...data });
}

export async function saveParceiro(id: string, data: Partial<Parceiro>): Promise<void> {
  await supabase.from('parceiros').upsert({ id, ...data });
}

export async function deleteServico(id: string): Promise<void> {
  await supabase.from('servicos').delete().eq('id', id);
}

export async function deleteProjecto(id: string): Promise<void> {
  await supabase.from('projectos').delete().eq('id', id);
}

export async function deleteMetrica(id: string): Promise<void> {
  await supabase.from('metricas').delete().eq('id', id);
}

export async function deleteDepoimento(id: string): Promise<void> {
  await supabase.from('depoimentos').delete().eq('id', id);
}

export async function deleteContacto(id: string): Promise<void> {
  await supabase.from('contactos').delete().eq('id', id);
}

export async function deleteSector(id: string): Promise<void> {
  await supabase.from('sectores').delete().eq('id', id);
}

export async function deletePais(id: string): Promise<void> {
  await supabase.from('paises').delete().eq('id', id);
}

export async function deleteFerramenta(id: string): Promise<void> {
  await supabase.from('ferramentas').delete().eq('id', id);
}

export async function deleteParceiro(id: string): Promise<void> {
  await supabase.from('parceiros').delete().eq('id', id);
}

export async function addServico(data: Partial<Servico>): Promise<string> {
  const { data: result } = await supabase.from('servicos').insert(data).select('id').single();
  return result?.id;
}

export async function addProjecto(data: Partial<Projecto>): Promise<string> {
  const { data: result } = await supabase.from('projectos').insert(data).select('id').single();
  return result?.id;
}

export async function addMetrica(data: Partial<Metrica>): Promise<string> {
  const { data: result } = await supabase.from('metricas').insert(data).select('id').single();
  return result?.id;
}

export async function addDepoimento(data: Partial<Depoimento>): Promise<string> {
  const { data: result } = await supabase.from('depoimentos').insert(data).select('id').single();
  return result?.id;
}

export async function addContacto(data: Partial<Contacto>): Promise<string> {
  const { data: result } = await supabase.from('contactos').insert(data).select('id').single();
  return result?.id;
}

export async function addSector(data: Partial<Sector>): Promise<string> {
  const { data: result } = await supabase.from('sectores').insert(data).select('id').single();
  return result?.id;
}

export async function addPais(data: Partial<Pais>): Promise<string> {
  const { data: result } = await supabase.from('paises').insert(data).select('id').single();
  return result?.id;
}

export async function addFerramenta(data: Partial<Ferramenta>): Promise<string> {
  const { data: result } = await supabase.from('ferramentas').insert(data).select('id').single();
  return result?.id;
}

export async function addParceiro(data: Partial<Parceiro>): Promise<string> {
  const { data: result } = await supabase.from('parceiros').insert(data).select('id').single();
  return result?.id;
}