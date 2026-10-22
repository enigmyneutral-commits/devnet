# DEEVO DEVNET

Rede sobreposta experimental para desenvolvimento de software, APIs e ambientes de teste. A DEVNET fornece endereçamento lógico, identidade de nós, descoberta e planeamento de failover; não hospeda nem copia os projetos dos utilizadores.

## Princípio de funcionamento

- Cada desenvolvedor controla código, aplicação, base de dados, credenciais e política de réplica.
- Cada nó terá identidade própria e poderá usar um conector de saída, como Cloudflare Tunnel, sem abrir portas de entrada.
- O resolver associará nomes DEVNET a serviços registados e autorizados.
- O failover só selecionará réplicas saudáveis e previamente autorizadas.
- Um relay não mantém uma aplicação disponível quando a máquina de origem desliga; isso exige uma réplica real e uma estratégia de consistência.

## Endereços de exemplo

- `devnet://api.projeto`
- `devnet://preview.projeto`
- `devnet://docs.projeto`

Estes nomes são tratados pelo parser experimental. Ainda não são resolvidos por navegadores sem cliente e não alteram o DNS público.

## Implementado na branch `feat/devnet-core-mvp`

- Parser de endereços DEVNET.
- Identidade Ed25519 e fingerprint de chave pública.
- Assinatura e verificação de payloads.
- Registos de serviço assinados com expiração.
- Envelope DEVNET v1 com tipos permitidos, timestamp, nonce e assinatura.
- ReplayGuard em memória.
- Registo de nós/serviços, monitor de heartbeat e planeador de failover.
- Testes automatizados e workflow de CI.

## Executar

Requer Node.js 20+.

~~~bash
npm run check
npm test
npm run demo
~~~

## Estado honesto

Este é um núcleo de biblioteca experimental. Ainda não existe transporte real entre nós, API autenticada, resolver distribuído, persistência, adaptador Cloudflare executável ou cliente de navegador. Não usar em produção até implementar enrollment/ACLs, armazenamento seguro, limites de tráfego, testes de integração e revisão de segurança.

## Documentação

- [Requisitos](docs/REQUIREMENTS.md)
- [Especificação do protocolo v1](docs/PROTOCOL-V1.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Modelo de ameaças](docs/THREAT-MODEL.md)
- [Implementação do MVP](docs/MVP-IMPLEMENTATION.md)

Não publicar tokens, chaves privadas, credenciais de túnel ou dados pessoais no repositório.
