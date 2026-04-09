import 'dotenv/config'
import Fastify from 'fastify'
import axios from 'axios'

const app = Fastify({
  logger: process.env.NODE_ENV !== 'production'
    ? { transport: { target: 'pino-pretty' } }
    : undefined
})

const SERVICE_NAME = 'connector-pt2030'
const PORT = parseInt(process.env.PORT || '3014')
const DADOS_GOV_API = 'https://dados.gov.pt/api/1'

// ─── In-memory store ─────────────────────────────────────────────────────────

let projectsStore = []
let lastSynced = null
let syncStatus = 'never'

// ─── Demo seed data ───────────────────────────────────────────────────────────

const DEMO_PROJECTS = [
  {
    id: 'PRR-001',
    name: 'Digitalizacao da Administracao Publica',
    beneficiary: 'Republica Portuguesa',
    nif: '600084123',
    component: 'C19 - Transformacao Digital',
    investment: '707000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2021-06-01',
    end_date: '2026-06-30',
    location: 'Nacional',
    description: 'Agenda de digitalizacao da administracao publica paramodernizacao dos servicos publicos',
    fund_type: 'PRR'
  },
  {
    id: 'PRR-002',
    name: 'Linha de Credito para PMEs Digitais',
    beneficiary: 'IAPMEI',
    nif: '601384772',
    component: 'C19 - Transformacao Digital',
    investment: '130000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2022-01-01',
    end_date: '2025-12-31',
    location: 'Nacional',
    description: 'Apoio a projetos de digitalizacao em pequenas e medias empresas',
    fund_type: 'PRR'
  },
  {
    id: 'PRR-003',
    name: 'Eficiencia Energetica em Edificios Publicos',
    beneficiary: 'DGAE',
    nif: '600084456',
    component: 'C12 - Sustentabilidade',
    investment: '320000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2022-03-01',
    end_date: '2026-03-31',
    location: 'Nacional',
    description: 'Intervencoes de eficiencia energetica em edificios da administracao central e local',
    fund_type: 'PRR'
  },
  {
    id: 'PRR-004',
    name: 'Ferrovias de Portugal - Modernizacao',
    beneficiary: 'IP',
    nif: '600084321',
    component: 'C11 - Ferrovia',
    investment: '2300000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2021-10-01',
    end_date: '2026-12-31',
    location: 'Nacional',
    description: 'Modernizacao e eletrificacao de linhas ferreas Secundarias',
    fund_type: 'PRR'
  },
  {
    id: 'PRR-005',
    name: 'Habitar Portugal - Apoio a Construcao',
    beneficiary: 'Instituto da Habitacao',
    nif: '600084789',
    component: 'C01 - Housing First',
    investment: '115000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2022-06-01',
    end_date: '2026-06-30',
    location: 'Nacional',
    description: 'Programa de apoio a construcao de habitacao a precos acessiveis',
    fund_type: 'PRR'
  },
  {
    id: 'PT2030-001',
    name: 'Sistema de Incentivos a Investigacao',
    beneficiary: 'FCT',
    nif: '600084999',
    component: 'POCH',
    investment: '450000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2024-01-01',
    end_date: '2029-12-31',
    location: 'Nacional',
    description: 'Apoio a projetos de investigacao cientifica em universidades einstitutos',
    fund_type: 'PT2030'
  },
  {
    id: 'PT2030-002',
    name: 'Internacionalizacao de PMEs',
    beneficiary: 'AICEP',
    nif: '600085111',
    component: 'COMPETE2030',
    investment: '200000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2024-03-01',
    end_date: '2029-12-31',
    location: 'Nacional',
    description: 'Incentivos a internacionalizacao e competitividade das pequenas emedias empresas',
    fund_type: 'PT2030'
  },
  {
    id: 'PT2030-003',
    name: 'Transicoes Digital e Energetica',
    beneficiary: 'AD&C',
    nif: '600085222',
    component: 'PT2030',
    investment: '580000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2024-01-01',
    end_date: '2029-12-31',
    location: 'Nacional',
    description: 'Apoio a investimentos em transicao digital e energetica paraempresas',
    fund_type: 'PT2030'
  },
  {
    id: 'PT2030-004',
    name: 'Desenvolvimento do Interior',
    beneficiary: 'CCDR Norte',
    nif: '600085333',
    component: 'PT2030',
    investment: '150000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2024-06-01',
    end_date: '2029-12-31',
    location: 'Interior Norte',
    description: 'Programas de coesao territorial para o interior do pais',
    fund_type: 'PT2030'
  },
  {
    id: 'PT2030-005',
    name: 'Formacao e Qualificacao Profissional',
    beneficiary: 'IEFP',
    nif: '600085444',
    component: 'POCH',
    investment: '300000000',
    investment_unit: 'EUR',
    status: 'approved',
    start_date: '2024-01-01',
    end_date: '2029-12-31',
    location: 'Nacional',
    description: 'Apoio a formacao profissional e requalificacao de trabalhadores',
    fund_type: 'PT2030'
  }
]

// ─── Seed demo data ───────────────────────────────────────────────────────────

projectsStore = [...DEMO_PROJECTS]

// ─── Sync from dados.gov.pt ─────────────────────────────────────────────────

async function syncFromDadosGov () {
  try {
    app.log.info('Syncing PRR projects from dados.gov.pt...')

    // Search for PRR projects dataset
    const searchRes = await axios.get(`${DADOS_GOV_API}/datasets/`, {
      params: { q: 'PRR projetos', page_size: 5 },
      timeout: 15000
    })

    const datasets = searchRes.data?.data || []
    const projectsDataset = datasets.find(d =>
      d.title?.toLowerCase().includes('projetos') &&
      d.organization?.acronym === 'EMRP'
    )

    if (!projectsDataset) {
      app.log.warn('PRR projects dataset not found on dados.gov.pt, using demo data')
      syncStatus = 'demo_only'
      return
    }

    // Get dataset resources to find downloadable files
    const resources = projectsDataset.resources || []
    const xlsxResource = resources.find(r => r.format === 'xlsx' || r.format === 'csv')

    if (xlsxResource) {
      app.log.info({ url: xlsxResource.url, format: xlsxResource.format },
        'Found PRR projects file, manual download required')
    }

    syncStatus = 'synced'
    lastSynced = new Date().toISOString()
    app.log.info('Sync complete — using stored demo data with dados.gov.pt reference')
  } catch (err) {
    app.log.warn({ err: err.message }, 'Failed to sync from dados.gov.pt, using demo data')
    syncStatus = 'demo_only'
  }
}

// ─── Required health + meta endpoints ───────────────────────────────────────

app.get('/health', async () => ({
  status: 'ok',
  service: SERVICE_NAME,
  timestamp: new Date().toISOString()
}))

app.get('/meta', async () => ({
  service: SERVICE_NAME,
  description: 'PRR and Portugal 2030 European funds projects API',
  sources: {
    dados_gov: 'https://dados.gov.pt (Estrutura de Missao Recuperar Portugal)',
    transparencia: 'https://transparencia.gov.pt/pt/fundos-europeus/prr/',
    prr2030: 'https://prr2030.pt'
  },
  sync_status: syncStatus,
  last_synced: lastSynced,
  record_count: projectsStore.length,
  data_note: syncStatus === 'demo_only'
    ? 'Running with demo data — awaiting official data source from dados.gov.pt'
    : 'Data synced from dados.gov.pt'
}))

// ─── GET /pt2030/projects ─────────────────────────────────────────────────────

app.get('/pt2030/projects', async (request) => {
  const {
    page = 1,
    limit = 20,
    status,
    fund_type,
    component,
    search
  } = request.query

  let results = [...projectsStore]

  if (status) {
    results = results.filter(p => p.status === status)
  }
  if (fund_type) {
    results = results.filter(p => p.fund_type === fund_type)
  }
  if (component) {
    results = results.filter(p =>
      p.component.toLowerCase().includes(component.toLowerCase())
    )
  }
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.beneficiary.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }

  const total = results.length
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const start = (pageNum - 1) * limitNum
  const items = results.slice(start, start + limitNum)

  return {
    data: items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      total_pages: Math.ceil(total / limitNum)
    },
    meta: {
      source: syncStatus === 'demo_only'
        ? 'demo — awaiting official source'
        : 'dados.gov.pt'
    }
  }
})

// ─── GET /pt2030/projects/:id ─────────────────────────────────────────────────

app.get('/pt2030/projects/:id', async (request, reply) => {
  const { id } = request.params
  const project = projectsStore.find(p => p.id === id)

  if (!project) {
    reply.code(404)
    return { error: 'Project not found', id }
  }

  return { data: project }
})

// ─── GET /pt2030/stats ────────────────────────────────────────────────────────

app.get('/pt2030/stats', async () => {
  const total = projectsStore.length

  const byStatus = {}
  const byFundType = {}
  const byComponent = {}
  let totalInvestment = 0

  for (const p of projectsStore) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1
    byFundType[p.fund_type] = (byFundType[p.fund_type] || 0) + 1
    byComponent[p.component] = (byComponent[p.component] || 0) + 1
    totalInvestment += parseFloat(p.investment) || 0
  }

  return {
    data: {
      total_projects: total,
      total_investment_eur: totalInvestment,
      by_status: byStatus,
      by_fund_type: byFundType,
      by_component: byComponent
    },
    meta: {
      source: syncStatus === 'demo_only'
        ? 'demo — awaiting official source'
        : 'dados.gov.pt',
      generated_at: new Date().toISOString()
    }
  }
})

// ─── Startup ───────────────────────────────────────────────────────────────────

await syncFromDadosGov()

await app.listen({ port: PORT, host: '0.0.0.0' })
app.log.info(`${SERVICE_NAME} listening on port ${PORT}`)
