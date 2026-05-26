# Ciclo 4: Implementação do Frontend

## Prompt Utilizado

```
Você é um desenvolvedor React especializado em TypeScript + Vite. Preciso que você implemente o frontend do ParkingWash com os seguintes componentes:

**Contexto:**
- Stack: React + Vite + TypeScript
- Styling: CSS puro (sem bibliotecas de UI)
- HTTP Client: fetch wrapper customizado
- Hooks: custom hooks para lógica reutilizável

**Módulos a implementar:**

1. **API Client (src/api/):**
   - client.ts: fetch wrapper que lança erro com { error, statusCode } em respostas não-ok
   - parking.ts: checkIn(licensePlate), checkOut(id), listParking(status?)
   - washOrders.ts: createWashOrder(licensePlate, washServiceId), updateWashOrderStatus(id, status), listWashOrders(status?)
   - washServices.ts: listWashServices()

2. **Types (src/types/):**
   - parking.ts: interfaces ParkingRecord, CheckInRequest, CheckInResponse, CheckOutResponse
   - washOrders.ts: interfaces WashOrder, WashService, WashOrderResponse

3. **Hooks (src/hooks/):**
   - useElapsedTime.ts: recebe entryTime (string ISO 8601), retorna string formatada HH:MM:SS atualizada a cada 1000ms
   - useAutoRefresh.ts: recebe callback e intervalo (padrão 30000ms), chama callback imediatamente e a cada intervalo

4. **Componentes ParkingPanel:**
   - CheckInForm.tsx: campo de texto para licensePlate, botão "Check-in" desabilitado enquanto vazio/inválido
   - ElapsedTimer.tsx: exibe tempo decorrido usando useElapsedTime
   - VehicleCard.tsx: exibe placa, ElapsedTimer, botão "Checkout"
   - CheckoutModal.tsx: modal com placa, tempo, valor; botões "Confirmar" e "Cancelar"
   - ParkingPanel.tsx: gerencia estado, integra todos os componentes

5. **Componentes WashQueue:**
   - NewOrderForm.tsx: campo licensePlate, seletor de WashService, botão "Nova Ordem"
   - WashOrderCard.tsx: exibe placa, serviço, status, botão contextual
   - StatusColumn.tsx: agrupa ordens por status
   - WashQueue.tsx: gerencia estado, usa useAutoRefresh, agrupa por status

6. **App.tsx:**
   - Abas para ParkingPanel e WashQueue
   - Navegação entre abas

**Requisitos específicos:**
- Validação de placa em tempo real (regex legado/Mercosul)
- Timer de 1s para veículos estacionados
- Polling de 30s para WashQueue
- Tratamento de erros da API
- Botões desabilitados enquanto campos obrigatórios vazios/inválidos
- Limpar formulários após sucesso

Por favor, forneça o código completo para cada arquivo, seguindo as melhores práticas de React e TypeScript.
```

## Resposta Obtida da IA

A IA forneceu:

1. **client.ts**: Fetch wrapper com tratamento de erro
2. **parking.ts, washOrders.ts, washServices.ts**: Funções de API bem estruturadas
3. **Types**: Interfaces TypeScript bem definidas
4. **useElapsedTime.ts**: Hook que calcula tempo decorrido e atualiza a cada 1s
5. **useAutoRefresh.ts**: Hook que chama callback a cada intervalo
6. **CheckInForm.tsx**: Formulário com validação de placa
7. **ElapsedTimer.tsx**: Componente que exibe tempo
8. **VehicleCard.tsx**: Card com placa, timer e botão
9. **CheckoutModal.tsx**: Modal com confirmação
10. **ParkingPanel.tsx**: Componente principal que integra tudo
11. **NewOrderForm.tsx**: Formulário para nova ordem
12. **WashOrderCard.tsx**: Card com informações da ordem
13. **StatusColumn.tsx**: Coluna agrupada por status
14. **WashQueue.tsx**: Componente principal com polling
15. **App.tsx**: Navegação por abas

## Limitações Identificadas

1. **Falta de tratamento de erro de validação de placa no formulário**: O CheckInForm não mostrava mensagem de erro específica quando a placa era inválida.

2. **Falta de estado de carregamento**: Os componentes não indicavam visualmente quando uma requisição estava em andamento.

3. **Falta de limpeza de intervalo em useElapsedTime**: Se o componente fosse desmontado enquanto o intervalo estava rodando, poderia causar memory leak.

4. **Falta de tratamento de erro em useAutoRefresh**: Se o callback lançasse erro, o hook não capturava e continuava tentando.

5. **Falta de desabilitação de botão durante requisição**: Os botões "Check-in", "Checkout", "Nova Ordem" não ficavam desabilitados enquanto a requisição estava em andamento.

6. **Falta de feedback visual de sucesso**: Não havia mensagem de sucesso após operações bem-sucedidas.

7. **Falta de tratamento de erro em WashQueue**: Se o polling falhasse, não havia retry automático.

8. **Falta de validação de seletor de serviço**: O seletor de WashService não validava se um serviço foi realmente selecionado.

## Mudanças Aplicadas

1. **Mensagem de erro de validação**: Adicionado estado `plateError` em CheckInForm que exibe mensagem "Placa inválida. Use o formato AAA-9999 ou AAA9A99" quando a placa não corresponde ao regex.

2. **Estado de carregamento**: Adicionado estado `isLoading` em ParkingPanel e WashQueue que é setado durante requisições e usado para desabilitar botões.

3. **Limpeza de intervalo**: Adicionado `return () => clearInterval(intervalId)` em useElapsedTime para limpar o intervalo no unmount.

4. **Tratamento de erro em useAutoRefresh**: Adicionado try-catch no callback que loga erro mas não interrompe o polling.

5. **Desabilitação de botão durante requisição**: Adicionado `disabled={isLoading || !isValidPlate}` nos botões "Check-in", "Checkout", "Nova Ordem".

6. **Feedback visual de sucesso**: Adicionado estado `successMessage` que exibe mensagem por 3 segundos após operação bem-sucedida.

7. **Retry automático em WashQueue**: Adicionado try-catch em useAutoRefresh que loga erro mas continua tentando a cada intervalo.

8. **Validação de seletor de serviço**: Adicionado estado `selectedServiceId` em NewOrderForm que valida se um serviço foi selecionado antes de habilitar botão.

9. **Melhor tratamento de erro**: Adicionado fallback "Erro inesperado. Tente novamente." quando a resposta da API não contém mensagem de erro.
