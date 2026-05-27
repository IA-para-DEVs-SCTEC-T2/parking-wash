# Placas Mock — Lista para Consulta e Testes

Este documento lista todas as placas cadastradas no banco de dados mock do sistema ParkingWash.  
Use estas placas para testar o check-in, checkout, consulta FIPE e demais funcionalidades.

> **Endpoint de consulta:** `GET /api/parking/fipe/:placa`  
> **Exemplo:** `GET http://localhost:3333/api/parking/fipe/WEZ5C09`

Qualquer placa **não listada** abaixo retornará dados genéricos ("Desconhecido").

---

## Carros

| # | Placa | Marca | Modelo | Ano | Cor | Combustível | Valor FIPE |
|---|-------|-------|--------|-----|-----|-------------|------------|
| 1 | ABC-1234 | Fiat | Uno 1.0 Fire | 2010 | Prata | Gasolina | R$ 18.500 |
| 2 | XYZ-5678 | Volkswagen | Gol 1.6 Power | 2015 | Branco | Gasolina | R$ 32.000 |
| 3 | DEF-9012 | Chevrolet | Onix 1.0 Turbo | 2022 | Preto | Gasolina | R$ 72.000 |
| 4 | GHI-3456 | Hyundai | HB20 1.0 Comfort | 2021 | Vermelho | Gasolina | R$ 65.000 |
| 5 | JKL-7890 | Toyota | Corolla 2.0 XEi | 2023 | Cinza | Gasolina | R$ 135.000 |
| 6 | MNO-1122 | Honda | Civic 2.0 EXL | 2022 | Azul | Gasolina | R$ 128.000 |
| 7 | PQR-3344 | Ford | Ka 1.5 SE | 2019 | Branco | Gasolina | R$ 42.000 |
| 8 | STU-5566 | Renault | Kwid 1.0 Zen | 2023 | Laranja | Gasolina | R$ 58.000 |
| 9 | VWX-7788 | Jeep | Renegade 1.8 Sport | 2021 | Verde | Gasolina | R$ 95.000 |
| 10 | BRA2E19 | Fiat | Argo 1.3 Drive | 2024 | Prata | Gasolina | R$ 78.000 |
| 11 | RIO4F56 | Volkswagen | T-Cross 1.0 TSI | 2023 | Branco | Gasolina | R$ 115.000 |
| 12 | SAO7G89 | Chevrolet | Tracker 1.0 Turbo | 2024 | Preto | Gasolina | R$ 125.000 |
| 13 | MIN1H23 | Nissan | Kicks 1.6 SL | 2022 | Cinza | Gasolina | R$ 98.000 |
| 14 | CUR4J56 | Peugeot | 208 1.6 Griffe | 2021 | Azul | Gasolina | R$ 75.000 |
| 15 | POA7K89 | Citroën | C3 1.6 Live | 2020 | Vermelho | Gasolina | R$ 55.000 |
| 16 | BEL2L34 | Caoa Chery | Tiggo 5X 1.5 Turbo | 2023 | Branco | Gasolina | R$ 105.000 |
| 17 | REC5M67 | Toyota | Hilux 2.8 SRX | 2024 | Prata | Diesel | R$ 285.000 |
| 18 | FLO8N90 | Mitsubishi | L200 Triton 2.4 | 2022 | Preto | Diesel | R$ 210.000 |
| 19 | WEZ5C09 | Chevrolet | Prisma 1.4 LTZ | 2018 | Prata | Gasolina | R$ 48.000 |

---

## Motos

| # | Placa | Marca | Modelo | Ano | Cor | Combustível | Valor FIPE |
|---|-------|-------|--------|-----|-----|-------------|------------|
| 20 | MOT1A23 | Honda | CG 160 Fan | 2023 | Vermelho | Gasolina | R$ 14.500 |
| 21 | MOT4B56 | Yamaha | Fazer 250 ABS | 2024 | Azul | Gasolina | R$ 22.000 |
| 22 | MOT7C89 | Honda | CB 500F | 2022 | Preto | Gasolina | R$ 35.000 |
| 23 | MOT2D34 | Kawasaki | Ninja 400 | 2023 | Verde | Gasolina | R$ 38.000 |
| 24 | MOT5E67 | BMW | G 310 GS | 2024 | Branco | Gasolina | R$ 42.000 |

---

## Caminhões

| # | Placa | Marca | Modelo | Ano | Cor | Combustível | Valor FIPE |
|---|-------|-------|--------|-----|-----|-------------|------------|
| 25 | CAM1F23 | Mercedes-Benz | Accelo 1016 | 2021 | Branco | Diesel | R$ 195.000 |
| 26 | CAM4G56 | Volkswagen | Delivery 11.180 | 2022 | Branco | Diesel | R$ 220.000 |

---

## Como testar

### Via navegador ou Postman

```
GET http://localhost:3333/api/parking/fipe/ABC-1234
GET http://localhost:3333/api/parking/fipe/MOT1A23
GET http://localhost:3333/api/parking/fipe/WEZ5C09
```

### Via PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3333/api/parking/fipe/ABC-1234" -Method Get
```

### Via frontend

Basta digitar qualquer placa da lista acima no campo "Placa do Veículo" e as informações aparecerão automaticamente.

---

## Notas

- As placas aceitam formato com ou sem hífen: `ABC-1234` e `ABC1234` funcionam igual
- Placas no formato Mercosul (ex: `BRA2E19`) também são suportadas
- Dados são servidos instantaneamente (mock local, sem latência de rede)
- O arquivo fonte dos dados está em: `backend/src/modules/parking/services/fipe-mock-data.ts`
- Para adicionar novas placas, edite o arquivo acima e reinicie o backend
