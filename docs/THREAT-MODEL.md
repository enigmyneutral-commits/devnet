# DEVNET — Modelo de ameaças v0.2

## Ativos

- Chaves privadas dos nós e identidade dos proprietários.
- Integridade dos anúncios de serviço e das rotas.
- Aplicações, bases de dados, tokens e código dos desenvolvedores.
- Confidencialidade das comunicações e isolamento entre projetos.
- Disponibilidade do resolver, dos nós e dos serviços.
- Integridade das atualizações do agente e do cliente.

## Adversários e ameaças

1. **Nó malicioso:** anuncia endpoint falso, tenta impersonar outro nó ou envia mensagens inválidas.
2. **Replay:** repete heartbeat, anúncio ou pedido de resolução antigo.
3. **Sequestro de nome:** tenta associar um endereço a uma chave/serviço que não controla.
4. **Comprometimento do endpoint:** máquina do desenvolvedor ou aplicação já comprometida.
5. **Abuso de encaminhamento:** tenta transformar a rede num proxy aberto ou alcançar endereços internos arbitrários.
6. **DoS e exaustão:** envia mensagens excessivas, payloads grandes ou conexões lentas.
7. **Roubo de credenciais:** vaza token Cloudflare, chave privada, cookie ou segredo de API.
8. **Ataque à cadeia de fornecimento:** pacote, workflow ou atualização comprometida.
9. **Partição ou falha de nó:** disponibilidade inconsistente e decisões de rota divergentes.
10. **Metadados:** observadores inferem quem comunica, quando e com que frequência.
11. **Confusão de protocolo:** cliente confunde conteúdo DEVNET com web pública ou executa conteúdo remoto sem consentimento.

## Controles implementados no núcleo experimental

- Assinatura Ed25519 para payloads.
- ID de nó derivado do fingerprint da chave pública e verificação de correspondência.
- Envelope de mensagem com versão, tipo permitido, timestamp e nonce.
- ReplayGuard local com expiração e limite de entradas.
- Registo assinado de serviço com expiração.
- Endpoints do registry limitados a HTTPS.
- Failover restrito a endpoints registados, saudáveis e no mesmo grupo de réplicas.

## Controles ainda necessários antes de rede real

- Enrollment/autorização que vincule nomes e serviços a proprietários legítimos.
- TLS autenticado no transporte e proteção contra downgrade.
- Rate limiting, limites de tamanho, timeouts e quotas no servidor.
- Replay cache durável/compartilhado quando houver vários controladores.
- Armazenamento de chaves protegido pelo sistema operativo e rotação/revogação.
- Validação de endpoints contra SSRF, loopback, link-local, metadata endpoints e redes privadas conforme política.
- Isolamento por tenant, ACLs e auditoria com retenção mínima.
- Atualizações assinadas, dependências fixadas e revisão de workflows.
- Testes de penetração, fuzzing, recuperação de backup e resposta a incidentes.

## Limites e riscos residuais

- Assinatura digital prova posse da chave, não legitimidade do proprietário nem segurança da aplicação.
- Cloudflare Tunnel reduz exposição de portas de entrada, mas não corrige vulnerabilidades na aplicação, no endpoint ou no banco de dados.
- A rede usa a Internet como transporte; continua sujeita a observação de tráfego, bloqueios e partições.
- A detecção de falha não garante que uma réplica tenha dados atualizados.
- O registry atual é em memória e não é autoridade de produção.
- Nenhuma promessa de anonimato absoluto, invulnerabilidade ou disponibilidade garantida deve ser feita.

## Política de segurança

Não publicar tokens, chaves privadas ou dados pessoais. Vulnerabilidades devem ser reportadas privadamente ao mantenedor, com passos reproduzíveis e sem explorar sistemas de terceiros.
