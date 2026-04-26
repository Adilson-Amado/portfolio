-- Tabela para controlar versões do código
CREATE TABLE IF NOT EXISTS code_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(50) NOT NULL UNIQUE,
  changelog TEXT,
  is_active BOOLEAN DEFAULT false,
  is_deployed BOOLEAN DEFAULT false,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para histórico de deploys
CREATE TABLE IF NOT EXISTS deploy_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID REFERENCES code_versions(id),
  action VARCHAR(50) NOT NULL, -- 'deployed', 'rolled_back', 'reviewed'
  notes TEXT,
  performed_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_history ENABLE ROW LEVEL SECURITY;

-- Políticas para tabelas de versão (apenas anon pode ler, admin pode tudo)
CREATE POLICY "Anyone can read code_versions" ON code_versions FOR SELECT USING (true);
CREATE POLICY "Anyone can read deploy_history" ON deploy_history FOR SELECT USING (true);
CREATE POLICY "Admin can insert code_versions" ON code_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update code_versions" ON code_versions FOR UPDATE USING (true);
CREATE POLICY "Admin can delete code_versions" ON code_versions FOR DELETE USING (true);
CREATE POLICY "Admin can insert deploy_history" ON deploy_history FOR INSERT WITH CHECK (true);

-- Inserir versão inicial
INSERT INTO code_versions (version, changelog, is_active, is_deployed)
VALUES ('1.0.0', 'Versão inicial do portfólio', true, true)
ON CONFLICT (version) DO NOTHING;