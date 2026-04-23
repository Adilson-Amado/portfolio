/**
 * Tipos baseados nos modelos de dados descritos no Skeleton para integração futura com CMS.
 */

export interface Perfil {
  fotografia: string;
  nomeCompleto: string;
  destaqueNome: string; // Ex: "PINTO"
  eyebrowEntrada: string; // Ex: "Designer, Luanda, Angola"
  tagline: string;
  biografia: string;
  labelBotaoInicio: string;
  labelBotaoAcaoFinal: string;
  tituloApresentacao: string; // Ex: "Portfolio 2025"
}

export interface Servico {
  id: string;
  titulo: string;
  descricao: string;
  corFundo: 'azul-escuro' | 'laranja';
  ordem: number;
}

export interface Projecto {
  id: string;
  imagemDestaque: string;
  titulo: string;
  nomeCliente: string;
  categoria: string;
  descricao: string;
  ano: number;
  emDestaque: boolean;
}

export interface Metrica {
  id: string;
  valor: string;
  sufixo: string;
  legenda: string;
}

export interface Sector {
  id: string;
  nome: string;
}

export interface Pais {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
}

export interface Depoimento {
  id: string;
  texto: string;
  autor: string;
  cargo: string;
  organizacao: string;
  fotografiaAutor?: string;
  iniciais: string;
}

export interface Ferramenta {
  id: string;
  nome: string;
  grupo: 'adobe' | 'outras';
}

export interface Contacto {
  id: string;
  etiqueta: string;
  valor: string;
  tipo: 'email' | 'whatsapp' | 'instagram';
  link: string;
}

export interface ConfigGlobals {
  processoTrabalho: string;
  servicosRodape: string;
  nomeAgencia: string;
  anoPortfolio: number;
  etiquetaRodapeContacto: string;
}
