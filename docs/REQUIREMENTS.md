# DEEVO DEVNET — Requisitos do MVP v0.1

## 1. Objetivo do produto

Permitir que desenvolvedores atribuam nomes internos a aplicações e APIs de desenvolvimento, comuniquem-se por uma rede sobreposta e controlem quem pode aceder aos serviços, sem comprar domínios convencionais nem abrir portas de entrada no computador de origem.

A DEVNET não é um provedor de hospedagem. O proprietário mantém a aplicação, a base de dados, os ficheiros, as credenciais e as decisões de réplica.

## 2. Personas e casos de uso

- **Desenvolvedor individual:** expõe temporariamente uma aplicação local para revisão autenticada.
- **Equipa de engenharia:** partilha APIs e previews com membros convidados.
- **Agente/CI:** verifica uma aplicação num endereço DEVNET com credenciais de serviço limitadas.
- **Mantenedor de nó:** configura conectividade e decide quais serviços podem ser anunciados.

## 3. Requisitos funcionais

| ID | Requisito | Critério de aceitação |
|---|---|---|
| FR-001 | Interpretar endereço `devnet://service.project` | Parser devolve nome e caminho canónicos ou rejeita entrada inválida. |
| FR-002 | Identidade criptográfica do nó | Cada nó possui par de chaves Ed25519 e ID derivado da chave pública. |
| FR-003 | Verificar mensagens | Alteração de payload, assinatura ou identidade invalida a mensagem. |
| FR-004 | Prevenir replay básico | Repetir o mesmo nonce para o mesmo nó dentro da janela é rejeitado pelo guard ativo. |
| FR-005 | Anunciar serviço | Registo assinado inclui emissor, payload, emissão e expiração. |
| FR-006 | Registar nós e serviços | Só é possível associar um serviço a um nó já registado no registry local. |
| FR-007 | Observar saúde | Heartbeat atualiza o estado; silêncio acima dos limites marca degradação/offline. |
| FR-008 | Planejar failover | Só escolhe endpoints online do grupo de réplica selecionado. |
| FR-009 | Falha sem réplica | O resultado indica indisponibilidade; nunca finge servir a aplicação. |
| FR-010 | Executar verificações localmente | `npm run check`, `npm test` e `npm run demo` estão documentados. |

## 4. Requisitos de segurança

- **SEC-001:** nunca enviar a chave privada do nó ao resolver nem guardá-la no repositório.
- **SEC-002:** validar assinatura e identidade antes de confiar num anúncio.
- **SEC-003:** aplicar expiração e timestamp a registos e mensagens.
- **SEC-004:** usar HTTPS/TLS nos endpoints de conectividade.
- **SEC-005:** não criar proxy aberto nem encaminhar URLs arbitrários.
- **SEC-006:** não executar código remoto automaticamente.
- **SEC-007:** validar autorização do proprietário separadamente da validade criptográfica.
- **SEC-008:** limitar payload, taxa, tempo e recursos no serviço de rede antes de beta.
- **SEC-009:** evitar SSRF e bloqueio de acesso a metadata endpoints, loopback e redes privadas por padrão.
- **SEC-010:** oferecer revogação de identidade e rotação de chaves antes de produção.

## 5. Requisitos não funcionais

- Node.js 20+ para o protótipo.
- Sem dependências externas de runtime no núcleo criptográfico inicial.
- Mensagens versionadas para evolução compatível.
- Comportamento determinístico em testes.
- Logs mínimos e sem segredos.
- Instalação e recuperação documentadas.
- Falhas de conectividade devem ser explícitas e recuperáveis.
- Não prometer anonimato nem disponibilidade sem redundância.

## 6. Fora do escopo

- TLD reconhecido pela raiz pública do DNS.
- Hospedagem centralizada de aplicações.
- Armazenamento central dos bancos de dados dos utilizadores.
- Browser completo baseado em Chromium.
- Alta disponibilidade sem réplicas da aplicação.
- Anonimato absoluto ou independência da Internet física.

## 7. Estado de conformidade

O núcleo atual cobre parte de FR-001 a FR-010 em testes unitários. Os requisitos de autorização de produção, transporte real, armazenamento durável, proteção contra abuso e revogação permanecem pendentes. Ver `ROADMAP.md` antes de considerar qualquer uso fora de laboratório.
