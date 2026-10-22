# DEEVO DEVNET

Rede sobreposta dedicada ao desenvolvimento de software, APIs e ambientes de teste. A DEVNET fornece endereçamento lógico, descoberta de serviços e planeamento de failover; não hospeda nem copia os projetos dos utilizadores.

## Princípio de funcionamento

- Cada desenvolvedor mantém o código, a aplicação, o banco de dados e as credenciais sob seu controlo.
- Cada nó associa uma identidade DEVNET a uma configuração de conectividade, podendo usar Cloudflare Tunnel para ligar um serviço local sem abrir portas de entrada.
- O resolver DEVNET associa nomes internos a serviços registados e autorizados.
- O mecanismo de failover só pode escolher endpoints alternativos que o proprietário registou como réplicas compatíveis.
- A rede não presume que uma aplicação num computador desligado continue disponível: isso exige uma réplica real e uma estratégia de consistência de dados.

## Endereços conceituais

- `devnet://api.projeto`
- `devnet://preview.projeto`
- `devnet://docs.projeto`

Os endereços são interpretados pelo núcleo experimental. Ainda não são resolvidos por navegadores sem cliente nem alteram o DNS público.

## Estado do projeto

**MVP do núcleo em desenvolvimento.** A branch `feat/devnet-core-mvp` contém:
- parser de endereços;
- registo em memória de nós e serviços;
- monitor de heartbeats;
- planeador de failover por grupo de réplicas;
- testes automatizados com o módulo nativo `node:test`.

## Executar os testes

Requer Node.js 20 ou superior:

~~~bash
npm test
npm run check
~~~

## Limites atuais

O registo é em memória, não há API pública, autenticação de nós, protocolo de descoberta distribuída, integração executável com Cloudflare, extensão de navegador nem cliente do sistema operativo. Não usar em produção até implementar autenticação, armazenamento durável, controlo de acesso, testes de integração e revisão de segurança.

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Modelo de ameaças](docs/THREAT-MODEL.md)
- [Implementação do MVP](docs/MVP-IMPLEMENTATION.md)

Não publicar tokens, credenciais de túneis, chaves privadas ou dados pessoais no repositório.
