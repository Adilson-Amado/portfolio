import {
  cmsDeleteRecord,
  cmsInsertRecord,
  cmsUpsertRecord,
  cmsUpsertSingleton,
} from './cms-api';
import { supabase } from './supabase';

const APP_TO_DB_FIELD_MAP: Record<string, Record<string, string>> = {
  perfil: {
    nomeCompleto: 'nomecompleto',
    destaqueNome: 'destaquenome',
    eyebrowEntrada: 'eyebrowentrada',
    labelBotaoInicio: 'labelbotaoinicio',
    labelBotaoAcaoFinal: 'labelbotaoacaofinal',
    anoPortfolio: 'anoportfolio',
  },
  quemsou: {
    nomePrimeiraLinha: 'nomeprimeiralinha',
    nomeDestaque: 'nomedestaque',
  },
  configuracoes: {
    nomeAgencia: 'nomeagencia',
    servicosRodape: 'servicosrodape',
    processoTrabalho: 'processotrabalho',
    etiquetaRodapeContacto: 'etiquetarodapecontacto',
  },
  servicos: {
    corFundo: 'corfundo',
  },
  projectos: {
    nomeCliente: 'nomecliente',
    imagemDestaque: 'imagemdestaque',
    emDestaque: 'emdestaque',
    concepto: 'concepto',
    duracao: 'duracao',
    ferramentas: 'ferramentas',
    cores: 'cores',
    agencia: 'agencia',
  },
  depoimentos: {
    emDestaque: 'emdestaque',
  },
  metricas: {
    valor: 'valor',
    sufixo: 'sufixo',
    legenda: 'legenda',
  },
  contactos: {
    tipo: 'tipo',
    etiqueta: 'etiqueta',
  },
  sectores: {},
  paises: {
    bandeira: 'bandeira',
  },
  ferramentas: {},
  parceiros: {
    logo: 'logo',
  },
};

const DB_TO_APP_FIELD_MAP = Object.fromEntries(
  Object.entries(APP_TO_DB_FIELD_MAP).map(([table, fields]) => [
    table,
    Object.fromEntries(Object.entries(fields).map(([appKey, dbKey]) => [dbKey, appKey])),
  ]),
) as Record<string, Record<string, string>>;

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
  imagemDestaque: string[];
  emDestaque: boolean;
  ordem: number;
  activo: boolean;
  concepto: string;
  duracao: string;
  ferramentas: string[];
  cores: string[];
  agencia: string;
}

function normalizeProjectImageList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return [value];
  }

  return [];
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

export interface Mensagem {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  tipo_origem: string;
  lida: boolean;
  responded: boolean;
  created_at: string;
  updated_at: string;
}

export function serializeTableData(table: string, data: Record<string, unknown>) {
  const fieldMap = APP_TO_DB_FIELD_MAP[table] || {};
  const normalizedData =
    table === 'projectos'
      ? {
          ...data,
          imagemDestaque: normalizeProjectImageList(data.imagemDestaque),
        }
      : data;

  return Object.fromEntries(
    Object.entries(normalizedData).map(([key, value]) => [fieldMap[key] || key, value]),
  );
}

export function normalizeTableRow<T>(table: string, row: Record<string, unknown> | null | undefined): T | null {
  if (!row) return null;

  const fieldMap = DB_TO_APP_FIELD_MAP[table] || {};
  const normalizedRow = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [fieldMap[key] || key, value]),
  ) as Record<string, unknown>;

  if (table === 'projectos') {
    normalizedRow.imagemDestaque = normalizeProjectImageList(normalizedRow.imagemDestaque);
  }

  return normalizedRow as T;
}

export function normalizeTableRows<T>(table: string, rows: Record<string, unknown>[] | null | undefined): T[] {
  if (!rows?.length) return [];
  return rows.map((row) => normalizeTableRow<T>(table, row)).filter(Boolean) as T[];
}

export async function getPerfil(): Promise<PerfilData | null> {
  const { data } = await supabase.from('perfil').select('*').single();
  return normalizeTableRow<PerfilData>('perfil', data);
}

export async function getQuemSou(): Promise<QuemSouData | null> {
  const { data } = await supabase.from('quemsou').select('*').single();
  return normalizeTableRow<QuemSouData>('quemsou', data);
}

export async function getSlides(): Promise<SlideConfig[]> {
  const { data } = await supabase.from('slides').select('*').order('id');
  return normalizeTableRows<SlideConfig>('slides', data);
}

export async function getServicos(): Promise<Servico[]> {
  const { data } = await supabase.from('servicos').select('*').order('ordem');
  return normalizeTableRows<Servico>('servicos', data);
}

export async function getProjectos(): Promise<Projecto[]> {
  const { data } = await supabase.from('projectos').select('*').order('ordem');
  return normalizeTableRows<Projecto>('projectos', data);
}

export async function getMetricas(): Promise<Metrica[]> {
  const { data } = await supabase.from('metricas').select('*').order('ordem');
  return normalizeTableRows<Metrica>('metricas', data);
}

export async function getDepoimentos(): Promise<Depoimento[]> {
  const { data } = await supabase.from('depoimentos').select('*').order('ordem');
  return normalizeTableRows<Depoimento>('depoimentos', data);
}

export async function getContactos(): Promise<Contacto[]> {
  const { data } = await supabase.from('contactos').select('*').order('ordem');
  return normalizeTableRows<Contacto>('contactos', data);
}

export async function getConfig(): Promise<Configuracao | null> {
  const { data } = await supabase.from('configuracoes').select('*').single();
  return normalizeTableRow<Configuracao>('configuracoes', data);
}

export async function getSectores(): Promise<Sector[]> {
  const { data } = await supabase.from('sectores').select('*').order('ordem');
  return normalizeTableRows<Sector>('sectores', data);
}

export async function getPaises(): Promise<Pais[]> {
  const { data } = await supabase.from('paises').select('*').order('ordem');
  return normalizeTableRows<Pais>('paises', data);
}

export async function getFerramentas(): Promise<Ferramenta[]> {
  const { data } = await supabase.from('ferramentas').select('*').order('ordem');
  return normalizeTableRows<Ferramenta>('ferramentas', data);
}

export async function getParceiros(): Promise<Parceiro[]> {
  const { data } = await supabase.from('parceiros').select('*').order('ordem');
  return normalizeTableRows<Parceiro>('parceiros', data);
}

export async function getMensagens(): Promise<Mensagem[]> {
  const { data } = await supabase.from('mensagens').select('*').order('created_at', { ascending: false });
  return normalizeTableRows<Mensagem>('mensagens', data);
}

export async function getMensagensNaoLidas(): Promise<Mensagem[]> {
  const { data } = await supabase.from('mensagens').select('*').eq('lida', false).order('created_at', { ascending: false });
  return normalizeTableRows<Mensagem>('mensagens', data);
}

export async function addMensagem(data: Omit<Mensagem, 'id' | 'created_at' | 'updated_at' | 'lida' | 'responded'>): Promise<string> {
  const result = await supabase.from('mensagens').insert(data).select();
  if (result.error) throw new Error(result.error.message);
  return result.data[0]?.id || '';
}

export async function markMensagemAsRead(id: string): Promise<void> {
  await supabase.from('mensagens').update({ lida: true, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function markMensagemAsResponded(id: string): Promise<void> {
  await supabase.from('mensagens').update({ responded: true, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteMensagem(id: string): Promise<void> {
  await supabase.from('mensagens').delete().eq('id', id);
}

function logSuccess(message: string, details?: unknown) {
  if (details === undefined) {
    console.log(message);
    return;
  }

  console.log(message, details);
}

export async function savePerfil(data: PerfilData): Promise<void> {
  await cmsUpsertSingleton('perfil', serializeTableData('perfil', data as unknown as Record<string, unknown>));
  logSuccess('Perfil atualizado com sucesso');
}

export async function saveQuemSou(data: QuemSouData): Promise<void> {
  await cmsUpsertSingleton('quemsou', serializeTableData('quemsou', data as unknown as Record<string, unknown>));
  logSuccess('Quem Sou atualizado com sucesso');
}

export async function saveSlide(id: string, data: Partial<SlideConfig>): Promise<void> {
  await cmsUpsertRecord('slides', id, serializeTableData('slides', data as Record<string, unknown>));
  logSuccess('Slide atualizado com sucesso');
}

export async function saveServico(id: string, data: Partial<Servico>): Promise<void> {
  await cmsUpsertRecord('servicos', id, serializeTableData('servicos', data as Record<string, unknown>));
  logSuccess('Servico atualizado com sucesso');
}

export async function saveProjecto(id: string, data: Partial<Projecto>): Promise<void> {
  await cmsUpsertRecord('projectos', id, serializeTableData('projectos', data as Record<string, unknown>));
  logSuccess('Projeto atualizado com sucesso');
}

export async function saveMetrica(id: string, data: Partial<Metrica>): Promise<void> {
  await cmsUpsertRecord('metricas', id, data as Record<string, unknown>);
  logSuccess('Metrica atualizada com sucesso');
}

export async function saveDepoimento(id: string, data: Partial<Depoimento>): Promise<void> {
  await cmsUpsertRecord('depoimentos', id, serializeTableData('depoimentos', data as Record<string, unknown>));
  logSuccess('Depoimento atualizado com sucesso');
}

export async function saveContacto(id: string, data: Partial<Contacto>): Promise<void> {
  await cmsUpsertRecord('contactos', id, data as Record<string, unknown>);
  logSuccess('Contacto atualizado com sucesso');
}

export async function saveConfig(data: Configuracao): Promise<void> {
  await cmsUpsertSingleton('configuracoes', serializeTableData('configuracoes', data as unknown as Record<string, unknown>));
  logSuccess('Configuracao atualizada com sucesso');
}

export async function saveSector(id: string, data: Partial<Sector>): Promise<void> {
  await cmsUpsertRecord('sectores', id, data as Record<string, unknown>);
  logSuccess('Setor atualizado com sucesso');
}

export async function savePais(id: string, data: Partial<Pais>): Promise<void> {
  await cmsUpsertRecord('paises', id, data as Record<string, unknown>);
  logSuccess('Pais atualizado com sucesso');
}

export async function saveFerramenta(id: string, data: Partial<Ferramenta>): Promise<void> {
  await cmsUpsertRecord('ferramentas', id, data as Record<string, unknown>);
  logSuccess('Ferramenta atualizada com sucesso');
}

export async function saveParceiro(id: string, data: Partial<Parceiro>): Promise<void> {
  await cmsUpsertRecord('parceiros', id, data as Record<string, unknown>);
  logSuccess('Parceiro atualizado com sucesso');
}

export async function deleteServico(id: string): Promise<void> {
  await cmsDeleteRecord('servicos', id);
  logSuccess('Servico apagado com sucesso');
}

export async function deleteProjecto(id: string): Promise<void> {
  await cmsDeleteRecord('projectos', id);
  logSuccess('Projeto apagado com sucesso');
}

export async function deleteMetrica(id: string): Promise<void> {
  await cmsDeleteRecord('metricas', id);
  logSuccess('Metrica apagada com sucesso');
}

export async function deleteDepoimento(id: string): Promise<void> {
  await cmsDeleteRecord('depoimentos', id);
  logSuccess('Depoimento apagado com sucesso');
}

export async function deleteContacto(id: string): Promise<void> {
  await cmsDeleteRecord('contactos', id);
  logSuccess('Contacto apagado com sucesso');
}

export async function deleteSector(id: string): Promise<void> {
  await cmsDeleteRecord('sectores', id);
  logSuccess('Setor apagado com sucesso');
}

export async function deletePais(id: string): Promise<void> {
  await cmsDeleteRecord('paises', id);
  logSuccess('Pais apagado com sucesso');
}

export async function deleteFerramenta(id: string): Promise<void> {
  await cmsDeleteRecord('ferramentas', id);
  logSuccess('Ferramenta apagada com sucesso');
}

export async function deleteParceiro(id: string): Promise<void> {
  await cmsDeleteRecord('parceiros', id);
  logSuccess('Parceiro apagado com sucesso');
}

export async function addServico(data: Partial<Servico>): Promise<string> {
  const result = await cmsInsertRecord<Servico>('servicos', serializeTableData('servicos', data as Record<string, unknown>));
  logSuccess('Servico adicionado com sucesso', result.id);
  return result.id;
}

export async function addProjecto(data: Partial<Projecto>): Promise<string> {
  const result = await cmsInsertRecord<Projecto>('projectos', serializeTableData('projectos', data as Record<string, unknown>));
  logSuccess('Projeto adicionado com sucesso', result.id);
  return result.id;
}

export async function addMetrica(data: Partial<Metrica>): Promise<string> {
  const result = await cmsInsertRecord<Metrica>('metricas', serializeTableData('metricas', data as Record<string, unknown>));
  logSuccess('Metrica adicionada com sucesso', result.id);
  return result.id;
}

export async function addDepoimento(data: Partial<Depoimento>): Promise<string> {
  const result = await cmsInsertRecord<Depoimento>('depoimentos', serializeTableData('depoimentos', data as Record<string, unknown>));
  logSuccess('Depoimento adicionado com sucesso', result.id);
  return result.id;
}

export async function addContacto(data: Partial<Contacto>): Promise<string> {
  const result = await cmsInsertRecord<Contacto>('contactos', serializeTableData('contactos', data as Record<string, unknown>));
  logSuccess('Contacto adicionado com sucesso', result.id);
  return result.id;
}

export async function addSector(data: Partial<Sector>): Promise<string> {
  const result = await cmsInsertRecord<Sector>('sectores', serializeTableData('sectores', data as Record<string, unknown>));
  logSuccess('Setor adicionado com sucesso', result.id);
  return result.id;
}

export async function addPais(data: Partial<Pais>): Promise<string> {
  const result = await cmsInsertRecord<Pais>('paises', serializeTableData('paises', data as Record<string, unknown>));
  logSuccess('Pais adicionado com sucesso', result.id);
  return result.id;
}

export async function addFerramenta(data: Partial<Ferramenta>): Promise<string> {
  const result = await cmsInsertRecord<Ferramenta>('ferramentas', serializeTableData('ferramentas', data as Record<string, unknown>));
  logSuccess('Ferramenta adicionada com sucesso', result.id);
  return result.id;
}

export async function addParceiro(data: Partial<Parceiro>): Promise<string> {
  const result = await cmsInsertRecord<Parceiro>('parceiros', serializeTableData('parceiros', data as Record<string, unknown>));
  logSuccess('Parceiro adicionado com sucesso', result.id);
  return result.id;
}

// ============================================
// CODE VERSIONS
// ============================================

export interface CodeVersion {
  id: string;
  version: string;
  changelog: string;
  is_active: boolean;
  is_deployed: boolean;
  deployed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeployHistory {
  id: string;
  version_id: string;
  action: 'deployed' | 'rolled_back' | 'reviewed';
  notes: string;
  performed_by: string;
  created_at: string;
}

export async function getCodeVersions(): Promise<CodeVersion[]> {
  const { data } = await supabase.from('code_versions').select('*').order('created_at', { ascending: false });
  return normalizeTableRows<CodeVersion>('code_versions', data);
}

export async function getLatestCodeVersion(): Promise<CodeVersion | null> {
  const { data } = await supabase.from('code_versions').select('*').order('created_at', { ascending: false }).limit(1);
  return normalizeTableRow<CodeVersion>('code_versions', data?.[0] || null);
}

export async function getActiveCodeVersion(): Promise<CodeVersion | null> {
  const { data } = await supabase.from('code_versions').select('*').eq('is_active', true).single();
  return normalizeTableRow<CodeVersion>('code_versions', data);
}

export async function addCodeVersion(data: { version: string; changelog: string }): Promise<string> {
  const result = await supabase.from('code_versions').insert(data).select();
  if (result.error) throw new Error(result.error.message);
  logSuccess('Versão de código adicionada:', result.data?.[0]?.id);
  return result.data?.[0]?.id || '';
}

export async function deployCodeVersion(id: string, performedBy: string = 'admin'): Promise<void> {
  await supabase.from('code_versions').update({ 
    is_deployed: true, 
    deployed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', id);
  
  await supabase.from('deploy_history').insert({
    version_id: id,
    action: 'deployed',
    performed_by: performedBy
  });
  
  logSuccess('Versão aplicada com sucesso');
}

export async function rollbackCodeVersion(id: string, notes: string, performedBy: string = 'admin'): Promise<void> {
  await supabase.from('code_versions').update({ 
    is_deployed: false,
    updated_at: new Date().toISOString()
  }).eq('id', id);
  
  await supabase.from('deploy_history').insert({
    version_id: id,
    action: 'rolled_back',
    notes,
    performed_by: performedBy
  });
  
  logSuccess('Versão revertida com sucesso');
}

export async function markVersionReviewed(id: string, performedBy: string = 'admin'): Promise<void> {
  await supabase.from('deploy_history').insert({
    version_id: id,
    action: 'reviewed',
    performed_by: performedBy
  });
}

export async function getDeployHistory(): Promise<DeployHistory[]> {
  const { data } = await supabase.from('deploy_history').select('*').order('created_at', { ascending: false });
  return normalizeTableRows<DeployHistory>('deploy_history', data);
}
