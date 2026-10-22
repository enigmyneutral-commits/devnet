# DEVNET Core MVP

## Objetivo

Construir e testar a base local do protocolo de endereçamento, identidade, registos assinados, mensagens versionadas, saúde dos nós e planeamento de failover.

## Requisitos

- Node.js 20 ou superior.
- Nenhuma dependência externa de runtime no núcleo atual.
- Testes executados com `node:test`.

## Componentes implementados

- `parseDevnetAddress`: parser para nomes lógicos e URIs `devnet://`.
- `createNodeIdentity`: identidade Ed25519 e fingerprint da chave pública.
- `signPayload` / `verifyPayload`: assinatura de payload JSON canónico.
- `createSignedServiceRecord` / `verifySignedServiceRecord`: registos assinados com expiração.
- `createEnvelope` / `verifyEnvelope`: envelope DEVNET v1, tipos permitidos, timestamp, nonce e assinatura.
- `ReplayGuard`: cache anti-replay em memória limitada.
- `NodeRegistry`: registo em memória de nós e serviços.
- `HealthMonitor`: estados online, degradado e offline por heartbeat.
- `RouteManager`: planeamento de failover entre endpoints saudáveis no mesmo grupo de réplicas.

## Executar

~~~bash
npm run check
npm test
npm run demo
~~~

## Semântica de falha

Uma rota alternativa só recupera a ligação se apontar para uma aplicação real e compatível. Um relay não substitui uma aplicação desligada. Réplicas de aplicação e consistência de dados são responsabilidade do proprietário.

## Limites atuais

- O protocolo ainda não tem transporte de rede nem handshake autenticado.
- Não há API pública, resolver distribuído, armazenamento durável ou enrollment.
- A identidade devolvida contém a chave privada PEM em memória; a persistência segura deve ser implementada antes do uso real.
- A validação de assinatura não é uma política completa de autorização.
- O replay guard é local ao processo.
- O registry é volátil e não deve ser usado em produção.
- O parser não altera DNS nem habilita nomes em navegadores comuns.
- Não há integração Cloudflare executável nem cliente desktop/extensão.

## Segurança e responsabilidade

A DEVNET não hospeda nem copia os projetos. Cada desenvolvedor controla a origem, banco de dados, credenciais e réplicas. A integração Cloudflare deve usar conectividade de saída, segredos fora do código e destinos explicitamente autorizados. Não usar em produção antes de implementar os controlos pendentes e obter revisão independente.
