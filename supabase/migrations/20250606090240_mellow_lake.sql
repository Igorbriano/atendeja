/*
  # Adicionar categorias às promoções

  1. Changes
    - Adicionar coluna `category` à tabela promotions
    - Adicionar coluna `target_days` para identificar promoções por dias de inatividade
    - Atualizar constraint para incluir as novas categorias

  2. Categories
    - reativacao_7_dias: Para clientes inativos há 7 dias
    - reativacao_15_dias: Para clientes inativos há 15 dias  
    - reativacao_30_dias: Para clientes inativos há 30 dias
    - promocao_geral: Promoções gerais
    - combo_especial: Combos especiais
    - desconto_categoria: Desconto por categoria de produto
*/

-- Adicionar colunas de categoria e dias alvo
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'promocao_geral' 
CHECK (category IN ('reativacao_7_dias', 'reativacao_15_dias', 'reativacao_30_dias', 'promocao_geral', 'combo_especial', 'desconto_categoria'));

ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS target_days integer;

-- Criar índice para melhor performance nas consultas por categoria
CREATE INDEX IF NOT EXISTS idx_promotions_category ON promotions(category);
CREATE INDEX IF NOT EXISTS idx_promotions_target_days ON promotions(target_days);