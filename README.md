# 🥷 Shinobi Storm

<p align="center">
  <strong>Entre na arena. Domine seu chakra. Lute pelo seu legado.</strong>
</p>

<p align="center">
  <a href="https://shinobi-storm.vercel.app/">
    <img src="https://img.shields.io/badge/JOGAR%20AGORA-Acessar%20demonstra%C3%A7%C3%A3o-e65b35?style=for-the-badge&logo=vercel&logoColor=white" alt="Jogar Shinobi Storm">
  </a>
  <a href="https://github.com/Vinicius-agg/Shinobi-Storm">
    <img src="https://img.shields.io/badge/Projeto-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Repositório no GitHub">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Canvas_API-2D2D2D?style=flat-square" alt="Canvas API">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
</p>

---

## 📌 Sobre o projeto

**Shinobi Storm** é um protótipo jogável de luta 2D desenvolvido para navegador, inspirado no universo shinobi. O jogador pode escolher personagens, selecionar arenas e enfrentar a CPU ou disputar partidas locais com duas pessoas.

O projeto faz parte do meu portfólio e representa minha prática em desenvolvimento web, JavaScript, organização de código e lógica de jogos.

## 🎮 Demonstração

Acesse a versão publicada e experimente o jogo diretamente no navegador:

**[https://shinobi-storm.vercel.app/](https://shinobi-storm.vercel.app/)**

Não é necessário instalar programas para jogar online.

## ✨ Funcionalidades

- **12 personagens** disponíveis para seleção.
- **4 arenas** com cenários distintos.
- **Dois modos de jogo:** jogador contra CPU e duelo local para duas pessoas.
- Sistema de combate renderizado com **Canvas API**.
- Movimentação, salto, dash e ataques.
- Técnicas especiais que utilizam chakra.
- Seleção de personagem com atributos individuais.
- Interface adaptável e painel de configuração da partida.

## 🕹️ Controles

| Ação | Jogador 1 | Jogador 2 |
|:--|:--:|:--:|
| Mover | A / D | ← / → |
| Pular | W | ↑ |
| Ataque | F | J |
| Jutsu | G | K |
| Dash | H | L |

> **Dica:** técnicas especiais consomem chakra. Use ataques básicos, movimentação e esquivas para administrar o combate.

## 🧰 Tecnologias utilizadas

| Tecnologia | Aplicação no projeto |
|:--|:--|
| HTML5 | Estrutura da interface e elementos do jogo |
| CSS3 | Layout, identidade visual e responsividade |
| JavaScript (ES Modules) | Lógica, estados e interação do jogo |
| Canvas API | Renderização da arena e dos lutadores |
| Node.js | Servidor local de desenvolvimento e scripts |

## 📁 Estrutura do projeto

```text
Shinobi-Storm/
├── index.html
├── styles.css
├── package.json
├── vercel.json
├── src/
│   ├── main.js
│   ├── data/
│   │   ├── characters.js
│   │   └── stages.js
│   └── engine/
│       ├── fighter.js
│       ├── game.js
│       ├── input.js
│       ├── math.js
│       └── renderer.js
├── scripts/
│   └── dev-server.mjs
└── tests/
    └── sanity.test.mjs
```

## 💻 Como executar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Git (opcional, para clonar o repositório).

### Instalação e execução

1. Clone o repositório:

   ```bash
   git clone https://github.com/Vinicius-agg/Shinobi-Storm.git
   ```

2. Entre na pasta do projeto:

   ```bash
   cd Shinobi-Storm
   ```

3. Inicie o servidor local:

   **Windows (PowerShell):**
   ```powershell
   npm.cmd run dev
   ```

   **macOS / Linux:**
   ```bash
   npm run dev
   ```

4. Abra no navegador:

   ```text
   http://localhost:4173
   ```

> O projeto utiliza módulos JavaScript. Para executar corretamente em desenvolvimento, abra pelo servidor local em vez de abrir o arquivo `index.html` diretamente.

## 🧪 Verificações

Os seguintes comandos estão disponíveis no projeto:

```bash
npm run check  # Verifica a sintaxe dos módulos JavaScript
npm test       # Executa os testes automatizados
```

No Windows PowerShell, se necessário, utilize `npm.cmd` no lugar de `npm`.

## 🗺️ Próximos passos

O projeto continuará evoluindo. Entre as melhorias planejadas estão:

- Expandir o elenco de personagens e suas habilidades.
- Criar novas arenas e variações de combate.
- Aprimorar animações, efeitos visuais e feedback dos golpes.
- Evoluir a inteligência artificial e o equilíbrio das partidas.
- Ampliar os testes e a qualidade geral do código.

## 👨‍💻 Desenvolvedor

**Vinicius Agra**

- GitHub: [@Vinicius-agg](https://github.com/Vinicius-agg)
- LinkedIn: [Vinicius Agra](https://www.linkedin.com/in/vinicius-agra-15126825b/)

---

## ⚖️ Aviso

Shinobi Storm é um projeto independente, desenvolvido para fins educacionais e de portfólio. É uma obra de fã, sem vínculo, patrocínio ou aprovação oficial dos detentores dos direitos de Naruto e de seus personagens. Todos os direitos relacionados a essas propriedades pertencem aos respectivos titulares.
