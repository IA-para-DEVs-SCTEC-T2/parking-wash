-- Script para popular tipos de veículos padrão
-- Execute este script no SQL Editor do Supabase se a tabela vehicle_types estiver vazia

-- Verificar se já existem tipos de veículos
-- Se não existirem, inserir os padrões

INSERT INTO vehicle_types (name, code, hourly_rate, daily_rate, is_active)
VALUES 
  ('Motocicleta', 'MOTORCYCLE', 5.00, 40.00, true),
  ('Carro', 'CAR', 10.00, 80.00, true),
  ('Motorhome', 'MOTORHOME', 20.00, 150.00, true)
ON CONFLICT (code) DO NOTHING;

-- Verificar os dados inseridos
SELECT id, name, code, hourly_rate, daily_rate, is_active FROM vehicle_types ORDER BY created_at;
