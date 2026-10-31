import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, CHARACTER_BY_ID } from '../src/data/characters.js';
import { STAGES, STAGE_BY_ID } from '../src/data/stages.js';
import { Game } from '../src/engine/game.js';

function createInput() {
  const down = new Set();
  const pressed = new Set();
  return {
    down, pressed,
    isDown: (key) => down.has(key),
    wasPressed: (key) => pressed.has(key),
  };
}
const fakeRenderer = { draw() {} };

test('roster contém 12 personagens com identificadores únicos', () => {
  assert.equal(CHARACTERS.length, 12);
  assert.equal(new Set(CHARACTERS.map((character) => character.id)).size, CHARACTERS.length);
  for (const character of CHARACTERS) {
    assert.ok(character.name);
    assert.ok(character.technique);
    assert.ok(character.speed > 0 && character.speed <= 6.2);
    assert.ok(character.power > 0 && character.power <= 10);
    assert.ok(CHARACTER_BY_ID[character.id]);
  }
});

test('quatro arenas têm altura de chão válida e IDs únicos', () => {
  assert.equal(STAGES.length, 4);
  assert.equal(new Set(STAGES.map((stage) => stage.id)).size, STAGES.length);
  for (const stage of STAGES) {
    assert.ok(stage.floorY > 390 && stage.floorY < 470);
    assert.ok(stage.skyTop.startsWith('#'));
    assert.ok(STAGE_BY_ID[stage.id]);
  }
});

test('Game inicia uma série com placar zerado e personagens escolhidos', () => {
  const game = new Game(createInput(), fakeRenderer);
  game.startMatch({ p1Id: 'sakura', p2Id: 'gaara', stageId: 'valley', mode: 'local' });
  assert.equal(game.state, 'fight');
  assert.equal(game.mode, 'local');
  assert.equal(game.stage.id, 'valley');
  assert.equal(game.p1.character.id, 'sakura');
  assert.equal(game.p2.character.id, 'gaara');
  assert.deepEqual(game.roundsWon, { p1: 0, p2: 0 });
  assert.equal(game.roundTimer, 99);
});

test('resetToIdle termina a partida e preserva o preview da seleção', () => {
  const game = new Game(createInput(), fakeRenderer);
  game.startMatch({ p1Id: 'hinata', p2Id: 'itachi', stageId: 'sand', mode: 'cpu' });
  game.resetToIdle();
  assert.equal(game.state, 'idle');
  assert.equal(game.p1.character.id, 'hinata');
  assert.equal(game.p2.character.id, 'itachi');
  assert.equal(game.stage.id, 'sand');
});


test('movimento e salto respondem aos controles do jogador 1', () => {
  const input = createInput();
  const game = new Game(input, fakeRenderer);
  game.startMatch({ p1Id: 'naruto', p2Id: 'sasuke', stageId: 'leaf', mode: 'local' });
  const startX = game.p1.x;
  input.down.add('d');
  game.update(1 / 60);
  assert.ok(game.p1.x > startX);
  input.down.clear();
  input.pressed.add('w');
  const startY = game.p1.y;
  game.update(1 / 60);
  assert.ok(game.p1.y < startY, 'a tecla de pulo deve levantar o lutador');
});

test('jutsu gasta chakra e cria projétil para técnicas de longo alcance', () => {
  const input = createInput();
  const game = new Game(input, fakeRenderer);
  game.startMatch({ p1Id: 'sasuke', p2Id: 'naruto', stageId: 'leaf', mode: 'local' });
  game.p1.chakra = 70;
  input.pressed.add('g');
  game.update(1 / 60);
  assert.equal(game.p1.chakra, 70 - 27);
  assert.equal(game.projectiles.length, 1);
  assert.equal(game.projectiles[0].type, 'bolt');
});

test('ataque corpo a corpo reduz a vida do oponente quando alcança', () => {
  const input = createInput();
  const game = new Game(input, fakeRenderer);
  game.startMatch({ p1Id: 'naruto', p2Id: 'sasuke', stageId: 'leaf', mode: 'local' });
  game.p1.x = 400;
  game.p2.x = 465;
  const hp = game.p2.hp;
  input.down.add('f');
  game.update(1 / 60);
  assert.ok(game.p2.hp < hp, 'o ataque deve causar dano dentro do alcance');
});
