# DEVNET — Registo de decisões de arquitetura

## ADR-001: rede sobreposta, não hospedagem
**Decisão:** a DEVNET fornece endereçamento e comunicação; o desenvolvedor mantém a aplicação, base de dados e dados.  
**Motivo:** preservar controlo do proprietário e evitar criar um provedor de hospedagem central.  
**Consequência:** a origem precisa de conectividade segura e o serviço fica indisponível se não houver réplica.

## ADR-002: Cloudflare Tunnel como adaptador de conectividade inicial
**Decisão:** estudar e implementar primeiro um adaptador opcional por nó usando ligações de saída.  
**Motivo:** evita exigir IP público ou portas de entrada abertas.  
**Consequência:** a conta Cloudflare é parte da configuração do nó, não identidade criptográfica DEVNET nem garantia de descentralização. A DEVNET deve evitar depender de um único controlador ou resolver.

## ADR-003: Node.js e APIs criptográficas nativas para o núcleo inicial
**Decisão:** usar JavaScript ESM e Node.js 20+ no protótipo.  
**Motivo:** manter o núcleo pequeno, testável e sem dependências criptográficas externas.  
**Consequência:** a implementação inicial não define ainda o agente desktop final nem exige que todos os nós usem Node.js.

## ADR-004: Ed25519 para assinatura experimental
**Decisão:** usar Ed25519 para identidade de nó e assinatura de mensagens.  
**Motivo:** suporte nativo e assinaturas compactas.  
**Consequência:** precisa de armazenamento de chave, rotação e revogação antes de produção.

## ADR-005: registos assinados com validade curta
**Decisão:** anúncios de serviço carregam emissão e expiração.  
**Motivo:** limitar a vida de informação obsoleta.  
**Consequência:** relógios e renovação precisam ser tratados pelo serviço de resolução.

## ADR-006: failover somente para réplicas autorizadas
**Decisão:** não encaminhar para qualquer nó que anuncie o mesmo nome; exigir grupo de réplica registado pelo proprietário.  
**Motivo:** evitar hijacking e encaminhamento para endpoints não relacionados.  
**Consequência:** o failover de aplicação requer réplica real, autorização e consistência de dados.

## ADR-007: sem DNS público para nomes DEVNET
**Decisão:** os nomes internos são resolvidos pelo cliente/protocolo DEVNET.  
**Motivo:** não depender da compra de domínio nem alegar controlo sobre a raiz pública DNS.  
**Consequência:** navegadores comuns precisam de cliente, extensão, integração de esquema ou proxy local restrito para usar esses nomes.
