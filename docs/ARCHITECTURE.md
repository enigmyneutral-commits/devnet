# DEEVO DEVNET — Arquitetura do MVP

## Missão

A DEVNET é uma rede sobreposta de endereçamento e comunicação para desenvolvimento. Não hospeda os projetos: cada proprietário mantém a aplicação, a base de dados, as credenciais e a política de réplica. O nó usa um conector de saída, como Cloudflare Tunnel, para expor apenas serviços explicitamente autorizados sem abrir portas de entrada na rede doméstica.

## Camadas

1. **DEVNET Client** — recebe endereços `devnet://...`, aplica identidade do utilizador e pede resolução; não executa conteúdo remoto automaticamente.
2. **DEVNET Protocol** — envelopes versionados, tipos de mensagem permitidos, assinatura Ed25519, timestamps e nonces.
3. **Node Agent** — executa no computador do proprietário, mantém identidade local e anuncia apenas serviços aprovados. A chave privada não deve sair do nó.
4. **Connectivity Adapter** — integração futura com Cloudflare Tunnel; configura e verifica conectividade, sem armazenar tokens em código ou no repositório.
5. **Resolver / Registry** — valida registos assinados e devolve endpoints elegíveis. A implementação atual do registry é apenas em memória e não é distribuída.
6. **Health & Route Manager** — monitoriza heartbeat e escolhe endpoints saudáveis apenas dentro do grupo de réplicas declarado pelo proprietário.
7. **Owner Application** — serviço e banco de dados continuam sob controlo do desenvolvedor.

## Fluxo de acesso pretendido

1. O utilizador introduz `devnet://api.projeto` no cliente.
2. O cliente autentica o utilizador e consulta um resolver autorizado.
3. O resolver devolve um registo assinado e ainda válido.
4. O cliente verifica a assinatura, identidade, autorização e validade.
5. O conector encaminha para o endpoint aprovado pelo proprietário.
6. Em falha, o gestor escolhe uma réplica saudável do mesmo grupo, se existir.
7. Se não existir réplica, devolve indisponibilidade; não simula sucesso.

## Decisões do protótipo

- Runtime: Node.js 20+; JavaScript ESM e APIs criptográficas nativas.
- Identidade: Ed25519; ID derivado do SHA-256 da chave pública SPKI.
- Endereçamento: nomes lógicos e esquema `devnet://`; parser local, não DNS global.
- Assinatura: JSON canónico por ordenação recursiva de chaves.
- Mensagens: protocolo `devnet`, versão 1, tipos permitidos, timestamp, nonce e assinatura.
- Registos de serviço: assinados e com expiração.
- Failover: apenas endpoints online dentro de um grupo de réplicas comum.
- Dependências de runtime: nenhuma dependência externa para o núcleo atual.

## Limites conhecidos

- Ainda não há canal de transporte de nó a nó nem handshake de sessão.
- O ReplayGuard é local ao processo e não substitui armazenamento distribuído anti-replay.
- O registry não persiste, não faz consenso e não é resistente a reinícios.
- A assinatura prova posse da chave, não prova que o proprietário está autorizado a publicar um nome; essa política precisa de uma camada de enrollment/ACL.
- A assinatura de um registo não prova que o endpoint está operacional.
- O esquema `devnet://` não funciona em navegadores comuns sem cliente ou integração.
- A redundância do Tunnel não substitui réplicas da aplicação nem replicação consistente da base de dados.

## Fora do escopo do MVP

- DNS público, novo TLD reconhecido pela raiz global ou nova infraestrutura física de Internet.
- Hospedagem central de aplicações.
- Proxy aberto, encaminhamento para URLs arbitrários ou execução automática de código remoto.
- Garantia de anonimato, disponibilidade absoluta ou tolerância a qualquer falha.
