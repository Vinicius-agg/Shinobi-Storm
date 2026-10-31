# Shinobi Storm — Arena Shinobi

> Protótipo pessoal de jogo de luta 2D em navegador, desenvolvido com HTML, CSS, JavaScript e Canvas.

**Demonstração online:** _adicione aqui a URL pública gerada pelo Vercel após a publicação._

## Sobre o projeto

Shinobi Storm é um jogo de luta 2D com seleção de personagens, arenas, técnicas especiais e modos de combate local. O projeto foi desenvolvido para estudo e demonstração de habilidades em desenvolvimento web e lógica de jogos.

## Recursos implementados

- 12 personagens cadastrados e selecionáveis.
- 4 arenas.
- Combate em Canvas.
- Modos de combate local e contra CPU, conforme opções implementadas no jogo.
- Técnicas especiais, chakra, movimentação, salto e dash.
- Interface responsiva.

## Tecnologias

- HTML5
- CSS3
- JavaScript (ES Modules)
- Canvas API
- Node.js (somente para servidor local de desenvolvimento)

## Como jogar online

Acesse o link de demonstração no início deste README. O jogo é servido como site estático: o recrutador só precisa abrir o link no navegador. Não precisa instalar Node.js nem executar comandos.

## Executar localmente (desenvolvimento)

Requisito: Node.js 18 ou superior.

1. Abra esta pasta no VS Code.
2. No terminal integrado, execute `npm.cmd run dev` no Windows (ou `npm run dev` em macOS/Linux).
3. Abra `http://localhost:4173`.

Não abra `index.html` diretamente pelo explorador de arquivos: o projeto usa módulos JavaScript e precisa de um servidor HTTP local.

## Publicar no Vercel

1. Envie esta pasta para um repositório GitHub.
2. Entre em [Vercel](https://vercel.com/) e escolha **Add New → Project**.
3. Conecte sua conta GitHub e importe o repositório `shinobi-storm`.
4. Como o projeto é HTML/CSS/JS puro, configure **Framework Preset: Other**, **Build Command: vazio** e **Output Directory: `.`** (raiz do projeto).
5. Clique em **Deploy**.
6. Após a publicação, copie a URL `.vercel.app` gerada e substitua o placeholder de demonstração no topo deste README.

A cada push na branch de produção conectada, o Vercel publica automaticamente a atualização. Também cria deployments de preview para outras branches. Consulte a documentação oficial: https://vercel.com/docs/git

## Verificações

- `npm run check` — valida sintaxe dos módulos listados no script.
- `npm test` — executa os testes automatizados incluídos no projeto.

Execute esses comandos localmente antes de publicar alterações.

## Controles

Consulte a seção **Controles de Combate** na própria página do jogo para ver as teclas de cada jogador.

## Aviso

Projeto pessoal de fã, não oficial, criado para fins educacionais e de portfólio. Naruto e seus personagens são propriedade de seus respectivos detentores de direitos. Este projeto não possui afiliação, patrocínio ou aprovação oficial.
