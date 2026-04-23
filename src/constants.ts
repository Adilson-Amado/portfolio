import { Perfil, Servico, Projecto, Metrica, Sector, Pais, Depoimento, Ferramenta, Contacto, ConfigGlobals } from './types';

export const PERFIL_DATA: Perfil = {
  fotografia: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop', // Placeholder image
  nomeCompleto: 'ADILSON PINTO AMADO',
  destaqueNome: 'PINTO',
  eyebrowEntrada: 'DESIGNER, LUANDA, ANGOLA',
  tagline: 'Criador de identidades visuais que comunicam, vendem e ficam na memória. Mais de 5 anos a transformar marcas em Angola, Portugal e Alemanha.',
  biografia: 'Designer com mais de 5 anos de experiência especializado em identidade visual e comunicação criativa. Apaixonado por transformar conceitos em marcas poderosas que conectam pessoas e organizações aos seus propósitos.',
  labelBotaoInicio: 'Começar',
  labelBotaoAcaoFinal: 'Solicitar Orçamento',
  tituloApresentacao: 'Portfolio 2025'
};

export const SERVICOS_DATA: Servico[] = [
  {
    id: '1',
    titulo: 'IDENTIDADE VISUAL',
    descricao: 'Criação de logos, paletas de cor, tipografia e manual de marca. Do conceito à entrega completa do sistema visual.',
    corFundo: 'azul-escuro',
    ordem: 1
  },
  {
    id: '2',
    titulo: 'DESIGN GRÁFICO',
    descricao: 'Artes para redes sociais, cartazes, flyers e materiais institucionais com impacto visual real.',
    corFundo: 'laranja',
    ordem: 2
  }
];

export const METRICAS_DATA: Metrica[] = [
  { id: '1', valor: '5', sufixo: '+', legenda: 'Anos de\nExperiência' },
  { id: '2', valor: '150', sufixo: '+', legenda: 'Clientes\nServidos' },
  { id: '3', valor: '3', sufixo: '', legenda: 'Países de\nAtuação' },
  { id: '4', valor: '500', sufixo: '+', legenda: 'Artes\nEntregues' }
];

export const PROJECTOS_DATA: Projecto[] = [
  {
    id: '1',
    imagemDestaque: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800',
    titulo: 'Projecto 01',
    nomeCliente: 'Cliente Exemplo',
    categoria: 'IDENTIDADE VISUAL',
    descricao: 'Descrição detalhada do projecto 01.',
    ano: 2024,
    emDestaque: true
  },
  {
    id: '2',
    imagemDestaque: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800',
    titulo: 'Projecto 02',
    nomeCliente: 'Cliente Alpha',
    categoria: 'DESIGN GRÁFICO',
    descricao: 'Descrição detalhada do projecto 02.',
    ano: 2024,
    emDestaque: true
  },
  {
    id: '3',
    imagemDestaque: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800',
    titulo: 'Projecto 03',
    nomeCliente: 'Cliente Beta',
    categoria: 'BRANDING',
    descricao: 'Descrição detalhada do projecto 03.',
    ano: 2023,
    emDestaque: true
  }
];

export const SECTORES_DATA: Sector[] = [
  { id: '1', nome: 'Igrejas Evangélicas' },
  { id: '2', nome: 'Ministérios Cristãos' },
  { id: '3', nome: 'Empresas e Startups' },
  { id: '4', nome: 'ONGs' },
  { id: '5', nome: 'Eventos e Media' }
];

export const PAISES_DATA: Pais[] = [
  { id: '1', nome: 'Angola', descricao: 'Mercado principal', emoji: '🇦🇴' },
  { id: '2', nome: 'Portugal', descricao: 'Presença internacional', emoji: '🇵🇹' },
  { id: '3', nome: 'Alemanha', descricao: 'Presença internacional', emoji: '🇩🇪' }
];

export const DEPOIMENTOS_DATA: Depoimento[] = [
  {
    id: '1',
    texto: 'O Adilson transformou completamente a identidade visual da nossa organização. O resultado superou todas as expectativas.',
    autor: 'João Carlos',
    cargo: 'Director Executivo',
    organizacao: 'Missão Hope',
    iniciais: 'JC'
  },
  {
    id: '2',
    texto: 'Trabalho sério, criativo e sempre dentro do prazo. Recomendo a qualquer empresa que queira uma presença visual forte.',
    autor: 'Maria Santos',
    cargo: 'Gestora de Eventos',
    organizacao: 'Eventos Pro',
    iniciais: 'MS'
  }
];

export const FERRAMENTAS_DATA: Ferramenta[] = [
  { id: '1', nome: 'Illustrator', grupo: 'adobe' },
  { id: '2', nome: 'Photoshop', grupo: 'adobe' },
  { id: '3', nome: 'InDesign', grupo: 'adobe' },
  { id: '4', nome: 'Premiere', grupo: 'adobe' },
  { id: '5', nome: 'Figma', grupo: 'outras' },
  { id: '6', nome: 'Canva Pro', grupo: 'outras' },
  { id: '7', nome: 'CapCut', grupo: 'outras' }
];

export const CONTACTOS_DATA: Contacto[] = [
  { id: '1', etiqueta: 'Email', valor: 'exemplo@a-design.ao', tipo: 'email', link: 'mailto:exemplo@a-design.ao' },
  { id: '2', etiqueta: 'WhatsApp', valor: '+244 000 000 000', tipo: 'whatsapp', link: 'https://wa.me/244000000000' },
  { id: '3', etiqueta: 'Instagram', valor: '@adesignangola', tipo: 'instagram', link: 'https://instagram.com/adesignangola' }
];

export const CONFIG_GLOBALS: ConfigGlobals = {
  processoTrabalho: 'Processo de trabalho: Briefing, Conceito, Desenvolvimento, Revisão e Entrega. Comunicação transparente em cada etapa.',
  servicosRodape: 'Identidade Visual • Branding • Design Gráfico • Redes Sociais',
  nomeAgencia: 'A-DESIGN ANGOLA',
  anoPortfolio: 2025,
  etiquetaRodapeContacto: 'Vamos conversar'
};
