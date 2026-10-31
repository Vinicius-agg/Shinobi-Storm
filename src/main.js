import { CHARACTERS, CHARACTER_BY_ID } from './data/characters.js';
import { STAGES } from './data/stages.js';
import { Game } from './engine/game.js';
import { InputController } from './engine/input.js';
import { Renderer } from './engine/renderer.js';

const $ = (selector) => document.querySelector(selector);
const canvas = $('#game-canvas');
const rosterGrid = $('#roster-grid');
const modeSelect = $('#mode-select');
const stageSelect = $('#stage-select');
const targetLabel = $('#selection-target-label');
const previewPortrait = $('#preview-portrait');
const previewVillage = $('#preview-village');
const previewName = $('#preview-name');
const previewTechnique = $('#preview-technique');
const startButton = $('#start-button');
const resetButton = $('#reset-button');
const gameStatus = $('#game-status');
const announcement = $('#announcement');

const selection = { p1: 'naruto', p2: 'sasuke', target: 'p1' };
const input = new InputController(window);
const renderer = new Renderer(canvas);
const game = new Game(input, renderer);

function createRoster() {
  const fragment = document.createDocumentFragment();
  for (const character of CHARACTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'roster-card';
    button.dataset.character = character.id;
    button.style.setProperty('--char-color', character.color);
    button.style.setProperty('--char-accent', character.accent);
    button.style.setProperty('--skin-color', character.skin);
    button.style.setProperty('--hair-color', character.hair);
    button.setAttribute('aria-label', `Selecionar ${character.name}`);
    button.innerHTML = `<span class="roster-avatar" aria-hidden="true"><span>${character.shortName.slice(0, 2).toUpperCase()}</span></span><span class="roster-name">${character.shortName}</span><span class="roster-marker" aria-hidden="true"></span>`;
    button.addEventListener('click', () => {
      selection[selection.target] = character.id;
      updateSelection();
      const targetName = selection.target === 'p1' ? 'Jogador 1' : modeSelect.value === 'cpu' ? 'Rival CPU' : 'Jogador 2';
      announcement.textContent = `${character.shortName} selecionado para ${targetName}.`;
    });
    fragment.appendChild(button);
  }
  rosterGrid.replaceChildren(fragment);
  $('#roster-count').textContent = `${CHARACTERS.length} LUTADORES`;
}

function updateRosterCards() {
  for (const button of rosterGrid.querySelectorAll('.roster-card')) {
    const id = button.dataset.character;
    const p1 = selection.p1 === id;
    const p2 = selection.p2 === id;
    button.classList.toggle('is-selected-p1', p1);
    button.classList.toggle('is-selected-p2', p2);
    button.querySelector('.roster-marker').textContent = p1 && p2 ? '1·2' : p1 ? 'P1' : p2 ? 'P2' : '';
    const selectedText = [p1 ? 'selecionado para jogador 1' : '', p2 ? `selecionado para ${modeSelect.value === 'cpu' ? 'rival CPU' : 'jogador 2'}` : ''].filter(Boolean).join(' e ');
    button.setAttribute('aria-pressed', String(p1 || p2));
    button.setAttribute('title', `${CHARACTER_BY_ID[id].name}${selectedText ? ` — ${selectedText}` : ''}`);
  }
}

function updatePreview() {
  const char = CHARACTER_BY_ID[selection[selection.target]];
  const isP1 = selection.target === 'p1';
  targetLabel.textContent = isP1 ? 'JOGADOR 1' : modeSelect.value === 'cpu' ? 'RIVAL CPU' : 'JOGADOR 2';
  previewPortrait.style.setProperty('--portrait-color', char.color);
  previewPortrait.style.setProperty('--portrait-accent', char.accent);
  previewPortrait.querySelector('.portrait-glyph').textContent = char.shortName.slice(0, 1);
  previewVillage.textContent = char.village;
  previewName.textContent = char.name;
  previewTechnique.textContent = char.technique;
  const stats = [
    ['speed', Math.round(char.speed / 6.2 * 100)],
    ['power', Math.round(char.power / 10 * 100)],
    ['chakra', Math.round(char.chakra / 105 * 100)],
  ];
  for (const [name, value] of stats) {
    $(`#stat-${name}`).style.width = `${value}%`;
    $(`#stat-${name}-value`).textContent = String(value);
  }
}

function updateSelection() {
  for (const button of document.querySelectorAll('.target-button')) {
    const active = button.dataset.target === selection.target;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  $('#p1-target-name').textContent = CHARACTER_BY_ID[selection.p1].shortName;
  $('#p2-target-name').textContent = CHARACTER_BY_ID[selection.p2].shortName;
  updatePreview();
  updateRosterCards();
  game.setPreview({ p1Id: selection.p1, p2Id: selection.p2, stageId: stageSelect.value, mode: modeSelect.value });
}

for (const button of document.querySelectorAll('.target-button')) {
  button.addEventListener('click', () => {
    selection.target = button.dataset.target;
    updateSelection();
  });
}

modeSelect.addEventListener('change', () => {
  updateSelection();
  if (modeSelect.value === 'cpu') {
    announcement.textContent = 'Modo solo: o rival CPU controlará o segundo lutador.';
  } else {
    announcement.textContent = 'Duelo local: dois jogadores no mesmo teclado.';
  }
});

stageSelect.addEventListener('change', () => {
  const stage = STAGES.find((item) => item.id === stageSelect.value);
  updateSelection();
  announcement.textContent = `Arena selecionada: ${stage?.name || 'Vila da Folha'}.`;
});

startButton.addEventListener('click', () => {
  game.startMatch({ p1Id: selection.p1, p2Id: selection.p2, stageId: stageSelect.value, mode: modeSelect.value });
  canvas.focus({ preventScroll: true });
});

resetButton.addEventListener('click', () => {
  game.resetToIdle();
  canvas.focus({ preventScroll: true });
});

game.onStatus = ({ status, announcement: message, buttonLabel }) => {
  gameStatus.textContent = status;
  announcement.textContent = message;
  startButton.innerHTML = `<span class="button-symbol">▶</span> ${buttonLabel}`;
  const isFight = status.includes('ANDAMENTO');
  startButton.classList.toggle('is-fighting', isFight);
};

createRoster();
updateSelection();

let previousTime = 0;
function frame(timestamp) {
  const now = timestamp / 1000;
  const dt = previousTime ? Math.min((timestamp - previousTime) / 1000, .033) : 0;
  previousTime = timestamp;
  game.update(dt);
  game.render(now);
  input.endFrame();
  window.requestAnimationFrame(frame);
}
window.requestAnimationFrame(frame);

// Acessibilidade: pausar o movimento ao esconder a aba e não deixar teclas presas.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) input.onBlur();
});
