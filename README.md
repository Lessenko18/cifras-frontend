# Cifras Caritas - Frontend

Aplicação web para gestão de cifras e playlists da Caritas.

> Este repositório contém o **frontend** (React + Vite). O backend REST é um projeto separado.

## Visão geral

O sistema foi desenvolvido para facilitar a organização de repertórios musicais, com controle de acesso por nível (ADM/USER), visualização otimizada de cifras e compartilhamento de playlists.

## Funcionalidades

- Autenticação completa: login, cadastro, recuperação e redefinição de senha.
- Visualização de cifras com suporte a duas colunas (separador `!!!`).
- Autoscroll com ajuste de velocidade para execução musical.
- Gestão de playlists com compartilhamento por e-mail e busca dinâmica de usuários.
- Perfil do usuário com edição de dados e avatar.
- Painel administrativo (ADM): CRUD de categorias e usuários.

## Stack

- React 19 + Vite 7
- React Router DOM
- Styled Components
- Axios (interceptors com JWT)
- React Hot Toast

## Pré-requisitos

- Node.js 20+
- npm 10+
- Backend da API rodando (padrão: `http://localhost:3000`)

## Variáveis de ambiente (frontend)

Crie um arquivo `.env` na raiz deste projeto:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_PUBLIC_APP_URL=http://localhost:5173
```

Observações:

- `VITE_API_BASE_URL`: URL base da API consumida pelo Axios.
- `VITE_PUBLIC_APP_URL`: URL pública do frontend usada para gerar link de recuperação de senha.
- Alternativa legada suportada: `VITE_APP_BASE_URL`.

## Instalação e execução

```bash
npm install
npm run dev
```

Aplicação local: `http://localhost:5173`

## Scripts

- `npm run dev` - inicia ambiente de desenvolvimento.
- `npm run build` - gera build de produção.
- `npm run preview` - preview local da build.
- `npm run lint` - executa ESLint.

## Rotas da aplicação

- `/` e `/login` - Login
- `/signup` - Cadastro
- `/forgot-password` - Recuperação de senha
- `/reset-password?token=...` - Redefinição de senha
- `/home` - Home
- `/home/profile` - Perfil
- `/home/cifras` - Cifras
- `/home/cifra/:id` - Visualizar cifra
- `/home/playlists` - Playlists
- `/home/playlists/:id/ver` - Visualizar playlist
- `/home/users` - Usuários (ADM)
- `/home/categorias` - Categorias (ADM)

## Integração com API (resumo)

Autenticação:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

O frontend também consome endpoints de usuários, categorias, cifras e playlists.

## Comportamentos importantes

- O token JWT é salvo no `localStorage` e enviado automaticamente pelo interceptor do Axios.
- Em resposta `401`, o app remove sessão local e redireciona para `/login`.
- Controle de acesso de rotas ADM feito por `user.level === "ADM"`.

## Deploy (Vercel)

O projeto já possui `vercel.json` com rewrite para SPA:

- todas as rotas são redirecionadas para `/`.

## Problemas comuns

- CORS: backend deve permitir o domínio do frontend.
- `401` frequente: validar token retornado no login e validade JWT.
- Link de recuperação inválido: validar `VITE_PUBLIC_APP_URL` e rota `/reset-password`.

## Licença

Projeto interno da Caritas.
