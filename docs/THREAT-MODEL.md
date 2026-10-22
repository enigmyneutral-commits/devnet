# Modelo de ameaças inicial

## Ativos a proteger
- Chaves privadas e identidades dos nós.
- Integridade dos registros e dos artefatos.
- Dados e credenciais dos desenvolvedores.
- Disponibilidade e integridade dos serviços.
- Isolamento entre serviços e usuários.

## Ameaças consideradas
- Nós que anunciam serviços falsos.
- Registros de serviço adulterados ou expirados.
- Repetição de mensagens e conexões não autenticadas.
- Negação de serviço e consumo excessivo de recursos.
- Dependências comprometidas e atualizações maliciosas.
- Vazamento acidental de metadados ou credenciais.
- Execução de conteúdo remoto sem consentimento.

## Controles iniciais
- Assinaturas digitais e validação de identidade.
- Proteção de transporte e validação de mensagens.
- Nonces, expiração e proteção contra replay quando aplicável.
- Limites de tamanho, taxa, tempo e recursos.
- Atualizações verificáveis e dependências fixadas.
- Segredos fora do repositório e rotação de credenciais.
- Revisão de segurança antes de executar código de terceiros.

## Limitações
Criptografia não garante anonimato absoluto. Uma rede sobreposta transportada pela internet continua sujeita a análise de tráfego, indisponibilidade do transporte e comprometimento dos endpoints. Este documento é preliminar e deverá ser revisado antes de qualquer beta público.
