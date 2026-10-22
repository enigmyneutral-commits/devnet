# DEVNET Protocol v1 — Especificação experimental

**Estado:** rascunho implementado parcialmente; não é ainda um padrão estável.

## 1. Endereçamento lógico

Forma canónica:

```
devnet://<service>[.<project>[.<namespace>...]][/path]
```

Os labels aceitam letras ASCII minúsculas, dígitos e hífen interno, com limites definidos pelo parser. O endereço identifica um nome lógico; não é uma resolução DNS pública. O cliente deve normalizar o nome e rejeitar credenciais, portas, query, fragmentos e segmentos de caminho `.`/ `..`.

## 2. Identidade do nó

- Algoritmo: Ed25519 através das APIs criptográficas nativas do Node.js.
- Chave pública: PEM SubjectPublicKeyInfo.
- ID: `node-` seguido dos primeiros 32 caracteres hexadecimais do SHA-256 do DER da chave pública SPKI.
- Chave privada: PKCS#8 PEM, segredo local; nunca deve ser transmitida.
- Fingerprint completo: SHA-256 hex para comparação e auditoria.

Este formato é experimental. Antes de produção será necessário definir armazenamento protegido, exportação/importação segura, rotação, revogação e política de recuperação.

## 3. Canonicalização e assinatura

Payloads são serializados como JSON canónico experimental: propriedades de objetos ordenadas lexicograficamente de forma recursiva; arrays preservam ordem. A assinatura Ed25519 incide sobre os bytes UTF-8 da representação canónica.

Implementações de outras linguagens devem reproduzir exatamente a canonicalização antes de interoperar. Para protocolo interoperável futuro, avaliar RFC 8785 (JSON Canonicalization Scheme) e publicar vetores de teste.

## 4. Envelope de mensagem

Representação lógica:

```json
{
  "body": {
    "protocol": "devnet",
    "version": 1,
    "type": "node.hello",
    "senderNodeId": "node-...",
    "timestamp": 1790000000000,
    "nonce": "base64url-random",
    "payload": {}
  },
  "publicKeyPem": "-----BEGIN PUBLIC KEY-----...",
  "signature": "base64url..."
}
```

Tipos permitidos no protótipo:
- `node.hello`
- `node.heartbeat`
- `service.announce`
- `service.resolve`
- `service.resolve.result`
- `route.health`
- `route.failover`
- `error`

O envelope inclui assinatura do corpo, versão, timestamp e nonce. O verificador confere o ID do emissor contra a chave pública, a janela temporal e, quando configurado, uma lista de emissores autorizados.

## 5. Registo de serviço assinado

Payload:
- `version`: versão do formato;
- `issuerNodeId`: nó que assina;
- `record`: descrição do serviço;
- `issuedAt`: epoch em milissegundos;
- `expiresAt`: expiração epoch em milissegundos.

O verificador rejeita formato inválido, versão desconhecida, registo expirado, emissão excessivamente futura ou assinatura inválida.

## 6. Proteção contra replay

O protótipo fornece `ReplayGuard`, uma cache limitada em memória que regista pares emissor/nonce até à expiração. É útil para testes de processo único, mas não protege vários controladores nem sobrevive a reinícios. Um serviço distribuído deve usar estado anti-replay partilhado ou sessões autenticadas com contadores e janelas definidas.

## 7. Semântica de resolução e failover

A resolução deve devolver apenas anúncios assinados, não expirados e autorizados. O planeador atual escolhe endpoints online registados no mesmo grupo de réplica. Um nó relay não substitui a aplicação original se a máquina e a aplicação estiverem offline.

## 8. Requisitos para transporte futuro

Antes de implementar um listener de rede:
- handshake autenticado com proteção contra downgrade;
- TLS moderno e autenticação mútua ou canal equivalente;
- limites de tamanho, taxa, concorrência e timeout;
- validação de schema por tipo de mensagem;
- autorização baseada em ACL e proprietário;
- bloqueio de destinos internos perigosos e proteção contra SSRF;
- revogação e rotação de chaves;
- testes de interoperabilidade e fuzzing.

## 9. Compatibilidade

A versão major do envelope é `version: 1`. Clientes devem rejeitar versões não suportadas e tipos desconhecidos, em vez de tentar interpretá-los de forma permissiva.

## 10. Limitações

Esta especificação não define wire framing, handshake de sessão, descoberta P2P, consenso, bootstrap distribuído ou integração com navegador. A implementação atual é uma biblioteca local, não uma rede de comunicação pronta para uso público.
