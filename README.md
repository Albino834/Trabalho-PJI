# VivaCidade — versão HTML, CSS e JavaScript

Esta versão é independente de React, Node, pnpm e banco externo. Abra `index.html` no VS Code com a extensão Live Server ou execute qualquer servidor HTTP local.

## Como executar

1. Extraia os arquivos na mesma pasta.
2. Abra a pasta no VS Code.
3. Instale a extensão **Live Server**.
4. Clique com o botão direito em `index.html` e selecione **Open with Live Server**.

Também é possível executar:

```bash
python3 -m http.server 5500
```

Depois acesse `http://localhost:5500`.

## Funcionalidades incluídas

- Navegação entre início, cadastro, denúncias, mapa, perfil e organizações.
- Denúncias salvas no `localStorage` do navegador.
- Fotos convertidas para Data URL e salvas localmente.
- Perfil, avatar, preferências e organizações persistidos localmente.
- Apoio comunitário e atualização de status funcionando.
- GPS real pelo navegador, mediante permissão.
- Geocodificação de endereço com Nominatim/OpenStreetMap.
- Mapa aberto com OpenStreetMap e marcador da ocorrência.

## Observação sobre banco de dados

HTML, CSS e JavaScript puro não conseguem acessar diretamente o banco MySQL do projeto WebDev com segurança. Por isso, esta versão funciona imediatamente com `localStorage`. Para usar o banco real, substitua as funções de persistência do `app.js` por chamadas `fetch` para uma API REST/tRPC hospedada, sem colocar credenciais do banco no navegador.
