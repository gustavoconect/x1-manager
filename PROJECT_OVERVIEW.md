# Ultime X1 v2 - Overview

Documento centralizador de informações técnicas e arquiteturais do projeto Ultime X1 v2.

## Overview
Sistema de gerenciamento de torneios 1v1 de League of Legends (X1), projetado para organizar competições com fases de grupos (MD2 - Pontos Corridos) e mata-mata (MD3/MD5). A aplicação controla regras complexas de draft espelhado (Mirror Matchup), banimentos, sorteio de campeões e seleção de lados baseada em desempenho (Elo ou Campanha).

## User Preferences
- **Interface**: Dark Mode (Estética Hextech/Gaming)
- **Design**: Moderno, utilizando TailwindCSS com fontes personalizadas (Outfit/Display).
- **Idiomas**: Português (PT-BR)

## System Architecture
A aplicação opera como um monolito distribuído localmente, com um frontend React servido via Vite e um backend Python (FastAPI) gerenciando a lógica de jogo e persistência.

## Frontend Architecture
- **Framework**: React 18 (Vite)
- **UI Library**: TailwindCSS v3
- **Fonts**: Outfit (sans-serif), Custom Display Fonts
- **State Management**: React Context / Local State (gerenciado via `App.jsx` e `api.js`)
- **Routing**: Single Page Application (State-based routing) - Componentes trocam baseados no `tournament_phase` e `setup_complete`.

## Backend Architecture
- **Server**: FastAPI (Python)
- **Database Provider**: Supabase
- **Database**: PostgreSQL
- **Logic**: `GameManager` class (`game_logic.py`) mantém o estado da sessão e sincroniza com o banco.

## Project Structure
### Main Components
- `SetupPhase`: Configuração inicial do duelo (Jogadores, Elos).
- `LaneBanPhase`: Banimento de rotas (Top, Jungle, Mid, Bot, Sup).
- `ChoicePhase`: Sorteio e seleção de campeões (Fase de Grupos).
- `KnockoutPhase`: Gerenciamento de séries MD3/MD5 (Anúncios, Bans, Side Selection).

## Database Layer
- **Schema**:
  - `players`:
    - `name` (PK): Identificador do jogador.
    - `elo`, `pdl`: Dados de ranking.
    - `wins`, `losses`: Estatísticas agregadas.
    - `history` (JSONB): Histórico simplificado de correlação de campeões jogados.
  - `match_history`:
    - `id`, `created_at`: Metadados.
    - `data` (JSONB): Payload completo da partida (picks, bans, resultado, fase).
  - `blacklist`:
    - `id` (PK), `name`, `image`: Dados do campeão.
    - `phase`: Fase onde o campeão foi utilizado (Groups/Mata-Mata).
    - `player`: Jogador que utilizou (para lógica de pool refill).

## Business Rules
### Regra Principal (Mirror Matchup)
- Ambos os jogadores utilizam SEMPRE o mesmo campeão em cada partida.

### Fase de Grupos
- Formato MD2 (Ida e Volta).
- Sorteio de 4 campeões da rota escolhida (excluindo Blacklist).
- Jogadores banem/escolhem dentre os sorteados.

### Fase Mata-Mata
- Formato MD3 ou MD5.
- Sem sorteio: Jogadores "Anunciam" campeões que desejam jogar.
- Oponente pode banir campeões anunciados.
- Critério de escolha de lado/ordem baseado na campanha anterior (Seed).

## External Dependencies
- `fastapi`, `uvicorn`: Servidor Backend.
- `supabase`: Cliente do Banco de Dados.
- `axios`: Comunicação HTTP Frontend.
- `framer-motion`: Animações de UI.
- `lucide-react`: Ícones.
