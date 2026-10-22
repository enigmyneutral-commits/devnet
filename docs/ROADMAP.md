# DEEVO DEVNET — Roadmap técnico

## Marco 0 — Especificação inicial
- [x] Definir propósito, limites e modelo de propriedade.
- [x] Documentar arquitetura inicial e modelo de ameaças.
- [x] Definir endereço lógico `devnet://service.project`.
- [x] Definir primeira versão do envelope de mensagem.
- [ ] Definir licença e governança pública.

## Marco 1 — Núcleo criptográfico local (parcial)
- [x] Parser de endereços DEVNET.
- [x] Identidade Ed25519 e fingerprint derivado da chave pública.
- [x] Assinatura/verificação de payloads.
- [x] Registos de serviço assinados e com expiração.
- [x] Envelope versionado, timestamp, nonce e proteção anti-replay em memória.
- [x] Registo de nós/serviços, monitor de heartbeat e planeador de failover.
- [x] Testes automatizados iniciais.
- [ ] Executar CI e confirmar resultados verdes.
- [ ] Persistência segura de identidade e rotação/revogação de chaves.
- [ ] Testes fuzz/property-based e revisão independente.

## Marco 2 — Nó real e conectividade
- [ ] Agente de nó executável com configuração local.
- [ ] Enrollment autenticado e autorização por proprietário/equipa.
- [ ] Adaptador Cloudflare Tunnel documentado e testável.
- [ ] Gestão segura de tokens sem os guardar no repositório.
- [ ] Dois nós reais com mensagens autenticadas e reconexão.

## Marco 3 — Resolver e descoberta
- [ ] API de resolução autenticada.
- [ ] Registo durável e estratégia de bootstrap.
- [ ] Expiração, revogação e proteção contra registos concorrentes.
- [ ] Descoberta distribuída e análise de pontos únicos de falha.

## Marco 4 — Cliente de navegação
- [ ] Cliente de linha de comandos para diagnóstico.
- [ ] Cliente desktop para Linux e Windows.
- [ ] Integração com navegador via protocolo registado/extension ou proxy local restrito.
- [ ] Separação entre contexto DEVNET e web pública.
- [ ] Consentimento explícito para abertura de serviços e conteúdo.

## Marco 5 — Resiliência e dados
- [x] Planeamento de failover apenas entre endpoints saudáveis do mesmo grupo de réplicas.
- [ ] Sondas de saúde reais com limites e autenticação.
- [ ] Backoff, circuit breaker e prevenção de flapping.
- [ ] Contrato de réplica e política de consistência de dados por aplicação.
- [ ] Testes de queda de nó, partição de rede e recuperação.

## Marco 6 — Beta segura
- [ ] Revisão de segurança independente.
- [ ] Testes de carga e limites por nó.
- [ ] Atualização assinada do agente.
- [ ] Política de privacidade, logs minimizados e resposta a incidentes.
- [ ] Documentação de instalação, desinstalação e recuperação.

**Estado honesto:** existe um núcleo experimental de biblioteca. Ainda não existe uma rede distribuída operável nem cliente de navegador pronto.
