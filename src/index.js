import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

const SERVICE_NAME = 'connector-prr'
const PORT = parseInt(process.env.PORT || '3014')

const app = Fastify({
  logger: {
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined
  }
})

await app.register(swagger, {
  openapi: {
    info: {
      title: 'API Aberta - PRR/PT2030 Connector',
      description: 'PRR (Plano de Recuperacao e Resiliencia) and PT2030 project data from transparencia.gov.pt',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:' + PORT }],
    tags: [
      { name: 'PRR', description: 'Plano de Recuperacao e Resiliencia projects' },
      { name: 'PT2030', description: 'Portugal 2030 funding programmes' },
    ],
  },
})

await app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list' },
})

app.get('/swagger', async () => app.swagger())

app.get('/health', async () => ({
  status: 'ok',
  service: SERVICE_NAME,
  version: '1.0.0',
  timestamp: new Date().toISOString()
}))

app.get('/meta', async () => ({
  service: SERVICE_NAME,
  version: '1.0.0',
  description: 'PRR and PT2030 project data',
  source: 'https://transparencia.gov.pt',
  docs: 'https://github.com/apiaberta/connector-prr'
}))

const PRR_COMPONENTS = [
  { id: 'C01', name: 'Servico Nacional de Saude', section: 'component' },
  { id: 'C01', name: 'Cuidados de saude primarios com mais respostas', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Rede Nacional de Cuidados Continuados Integrados e Rede Nacional de Cuidados Paliativos', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Conclusao da reforma da saude mental e implementacao da Estrategia para as Demencias', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Construcao do Hospital de Lisboa Oriental e equipamento para hospitais em Lisboa e Vale do Tejo', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Transicao digital da saude', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Fortalecimento do Servico Regional de Saude da Regiao Autonoma da Madeira', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Digitalizacao do Servico Regional de Saude da Madeira', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Hospital Digital da Regiao Autonoma dos Acores', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Sistema Universal de Apoio a Vida Ativa', section: 'investment', parent_id: 'C01' },
  { id: 'C01', name: 'Programa de Modernizacao Tecnologica do SNS', section: 'investment', parent_id: 'C01' },
  { id: 'C02', name: 'Habitacao', section: 'component' },
  { id: 'C02', name: 'Alojamento estudantil a custos acessiveis', section: 'investment', parent_id: 'C02' },
  { id: 'C02', name: 'Aumentar as condicoes habitacionais do parque habitacional da Regiao Autonoma dos Acores', section: 'investment', parent_id: 'C02' },
  { id: 'C02', name: 'Bolsa Nacional de Alojamento Urgente e Temporario', section: 'investment', parent_id: 'C02' },
  { id: 'C02', name: 'Infraestruturas para parcelas de terreno destinadas a habitacao', section: 'investment', parent_id: 'C02' },
  { id: 'C02', name: 'Programa de apoio ao acesso a habitacao (emprestimo)', section: 'investment', parent_id: 'C02' },
  { id: 'C02', name: 'Parque habitacional publico a custos acessiveis', section: 'investment', parent_id: 'C02' },
  { id: 'C02', name: 'Programa de apoio ao acesso a habitacao', section: 'investment', parent_id: 'C02' },
  { id: 'C02', name: 'Reforco da oferta de habitacao apoiada na Regiao Autonoma da Madeira', section: 'investment', parent_id: 'C02' },
  { id: 'C02', name: 'Reforco do parque habitacional social', section: 'investment', parent_id: 'C02' },
  { id: 'C03', name: 'Respostas sociais', section: 'component' },
  { id: 'C03', name: 'Acessibilidades 360', section: 'investment', parent_id: 'C03' },
  { id: 'C03', name: 'Fortalecimento das respostas sociais na Regiao Autonoma da Madeira (RAM)', section: 'investment', parent_id: 'C03' },
  { id: 'C03', name: 'Implementar a Estrategia Regional de Combate a Pobreza e Exclusao Social - Redes de Apoio Social (RAA)', section: 'investment', parent_id: 'C03' },
  { id: 'C03', name: 'Modernizacao e expansao da rede de estruturas residenciais para pessoas idosas (ERPI)', section: 'investment', parent_id: 'C03' },
  { id: 'C03', name: 'Nova Geracao de Equipamentos e Respostas Sociais', section: 'investment', parent_id: 'C03' },
  { id: 'C03', name: 'Operacoes integradas em comunidades desfavorecidas nas Areas Metropolitanas de Lisboa e do Porto', section: 'investment', parent_id: 'C03' },
  { id: 'C03', name: 'Plataforma +Acesso', section: 'investment', parent_id: 'C03' },
  { id: 'C04', name: 'Cultura', section: 'component' },
  { id: 'C04', name: 'Patrimonio cultural', section: 'investment', parent_id: 'C04' },
  { id: 'C04', name: 'Redes culturais e transicao digital', section: 'investment', parent_id: 'C04' },
  { id: 'C05', name: 'Investimento e inovacao', section: 'component' },
  { id: 'C05', name: 'Agenda de investigacao e inovacao para a sustentabilidade da agricultura, alimentacao e agroindustria', section: 'investment', parent_id: 'C05' },
  { id: 'C05', name: 'Agendas mobilizadoras para a Inovacao Empresarial', section: 'investment', parent_id: 'C05' },
  { id: 'C05', name: 'Agendas Verdes para a Inovacao Empresarial', section: 'investment', parent_id: 'C05' },
  { id: 'C05', name: 'Capitalizacao de empresas e resiliencia financeira/Banco Portugues de Fomento', section: 'investment', parent_id: 'C05' },
  { id: 'C05', name: 'Ciencia Mais Digital', section: 'investment', parent_id: 'C05' },
  { id: 'C05', name: 'Instrumentos de capitalizacao para empresas da Madeira', section: 'investment', parent_id: 'C05' },
  { id: 'C05', name: 'Missao Interface - renovacao da rede de suporte cientifico e tecnologico e orientacao para tecido produtivo', section: 'investment', parent_id: 'C05' },
  { id: 'C05', name: 'Recapitalizar o Sistema Empresarial dos Acores', section: 'investment', parent_id: 'C05' },
  { id: 'C05', name: 'Recuperacao economica da agricultura dos Acores', section: 'investment', parent_id: 'C05' },
  { id: 'C06', name: 'Qualificacoes e competencias', section: 'component' },
  { id: 'C06', name: 'Ampliacao do edificio do CITMA', section: 'investment', parent_id: 'C06' },
  { id: 'C06', name: 'Ciencia Mais Capacitacao', section: 'investment', parent_id: 'C06' },
  { id: 'C06', name: 'Compromisso para o emprego sustentavel', section: 'investment', parent_id: 'C06' },
  { id: 'C06', name: 'Escolas novas ou renovadas', section: 'investment', parent_id: 'C06' },
  { id: 'C06', name: 'Impulso Jovens - CTEAM', section: 'investment', parent_id: 'C06' },
  { id: 'C06', name: 'Impulso Mais Digital', section: 'investment', parent_id: 'C06' },
  { id: 'C06', name: 'Incentivo Adultos', section: 'investment', parent_id: 'C06' },
  { id: 'C06', name: 'Modernizacao das instituicoes de ensino e formacao profissionais', section: 'investment', parent_id: 'C06' },
  { id: 'C06', name: 'Qualificacao de Adultos e Aprendizagem ao Longo da Vida (RAA)', section: 'investment', parent_id: 'C06' },
  { id: 'C07', name: 'Infraestruturas', section: 'component' },
  { id: 'C07', name: 'Alargamento da Rede de Carregamento de Veiculos Eletricos', section: 'investment', parent_id: 'C07' },
  { id: 'C07', name: 'Areas de acolhimento de empresas', section: 'investment', parent_id: 'C07' },
  { id: 'C07', name: 'Circuitos logisticos - Rede Regional dos Acores', section: 'investment', parent_id: 'C07' },
  { id: 'C07', name: 'Ligacoes em falta e aumento de capacidade da rede', section: 'investment', parent_id: 'C07' },
  { id: 'C07', name: 'Ligacoes transfronteiras', section: 'investment', parent_id: 'C07' },
  { id: 'C07', name: 'Zonas de acolhimento de empresas - acessibilidade rodoviaria', section: 'investment', parent_id: 'C07' },
  { id: 'C08', name: 'Florestas', section: 'component' },
  { id: 'C08', name: 'Cadastro da propriedade rustica e Sistema de Monitorizacao da Ocupacao do Solo', section: 'investment', parent_id: 'C08' },
  { id: 'C08', name: 'Meios de prevencao e combate a incendios rurais', section: 'investment', parent_id: 'C08' },
  { id: 'C08', name: 'Programa MAIS Floresta', section: 'investment', parent_id: 'C08' },
  { id: 'C08', name: 'Quebras na gestao do combustivel - rede primaria', section: 'investment', parent_id: 'C08' },
  { id: 'C08', name: 'Transformacao da paisagem dos territorios de floresta vulneraveis', section: 'investment', parent_id: 'C08' },
  { id: 'C09', name: 'Gestao hidrica', section: 'component' },
  { id: 'C09', name: 'Aproveitamento hidraulico de fins multiplos do Crato - fase de construcao', section: 'investment', parent_id: 'C09' },
  { id: 'C09', name: 'Aproveitamento hidraulico de fins multiplos do Crato - fase de planeamento', section: 'investment', parent_id: 'C09' },
  { id: 'C09', name: 'Plano de eficiencia e reforco hidrico dos sistemas de abastecimento e regadio da RAM', section: 'investment', parent_id: 'C09' },
  { id: 'C09', name: 'Plano Regional de Eficiencia Hidrica do Algarve', section: 'investment', parent_id: 'C09' },
]

app.get('/prr/components', {
  schema: {
    description: 'List all PRR components and investments',
    tags: ['PRR'],
    querystring: {
      type: 'object',
      properties: {
        section: { type: 'string', description: 'Filter: component or investment' }
      }
    }
  }
}, async (req) => {
  const { section } = req.query
  let data = PRR_COMPONENTS
  if (section) {
    data = data.filter(i => i.section === section)
  }
  return { total: data.length, data, source: 'https://transparencia.gov.pt' }
})

app.get('/prr/summary', {
  schema: { description: 'Get PRR summary statistics', tags: ['PRR'] }
}, async () => {
  const components = [...new Set(PRR_COMPONENTS.filter(i => i.section === 'component').map(i => ({ id: i.id, name: i.name })))]
  return {
    plan: 'PRR - Plano de Recuperacao e Resiliencia',
    execution_period: '2021-2026',
    total_components: components.length,
    total_investments: PRR_COMPONENTS.filter(i => i.section === 'investment').length,
    source: 'https://transparencia.gov.pt',
    components,
  }
})

app.get('/prr/projects', {
  schema: {
    description: 'Search PRR projects',
    tags: ['PRR'],
    querystring: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search term' },
        component: { type: 'string', description: 'Filter by component ID (e.g. C01)' },
        page: { type: 'integer', default: 1, minimum: 1 },
        limit: { type: 'integer', default: 20, minimum: 1, maximum: 100 }
      }
    }
  }
}, async (req) => {
  const { q, component, page = 1, limit = 20 } = req.query
  let data = PRR_COMPONENTS.filter(i => i.section === 'investment')
  if (component) data = data.filter(i => i.id === component.toUpperCase())
  if (q) data = data.filter(i => i.name.toLowerCase().includes(q.toLowerCase()) || i.id.includes(q.toUpperCase()))
  const start = (page - 1) * limit
  return { query: q || null, component: component || null, page, limit, data: data.slice(start, start + limit), total: data.length, source: 'https://transparencia.gov.pt' }
})

app.get('/pt2030/summary', {
  schema: { description: 'Get PT2030 (Portugal 2030) summary', tags: ['PT2030'] }
}, async () => {
  return {
    plan: 'PT2030 - Portugal 2030',
    description: 'Next generation EU funding programme for Portugal',
    execution_period: '2021-2027',
    total_budget: 'EUR 23.4 billion',
    source: 'https://portugalglobal.pt/PT2030',
    note: 'PT2030 data available at https://prr2030.pt and https://portugalglobal.pt/PT2030'
  }
})

await app.listen({ port: PORT, host: '0.0.0.0' })
app.log.info(SERVICE_NAME + ' listening on port ' + PORT)
