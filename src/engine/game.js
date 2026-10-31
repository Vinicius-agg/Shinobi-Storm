import { CHARACTER_BY_ID } from '../data/characters.js';
import { STAGE_BY_ID } from '../data/stages.js';
import { Fighter } from './fighter.js';
import { clamp, distance, randomBetween } from './math.js';

const ARENA_WIDTH = 960;
const GRAVITY = 1580;
const JUMP_SPEED = 650;
const JUTSU_COST = 27;
const ROUND_SECONDS = 99;

export class Game {
  constructor(input, renderer) {
    this.input = input;
    this.renderer = renderer;
    this.state = 'idle';
    this.mode = 'cpu';
    this.stage = STAGE_BY_ID.leaf;
    this.preview = { p1: CHARACTER_BY_ID.naruto, p2: CHARACTER_BY_ID.sasuke };
    this.p1 = null;
    this.p2 = null;
    this.projectiles = [];
    this.particles = [];
    this.shake = 0;
    this.round = 1;
    this.roundTimer = ROUND_SECONDS;
    this.transitionTimer = 0;
    this.fightAnnounce = 0;
    this.roundsWon = { p1: 0, p2: 0 };
    this.roundWinner = null;
    this.matchWinner = null;
    this.aiTimer = 0;
    this.aiAction = {};
    this.lastTime = 0;
    this.onStatus = null;
    this.ambientAccumulator = 0;
    this.spawnAmbient();
    this.preparePreview();
    this.emit('PRONTO PARA LUTAR', 'Escolha seus shinobi e entre na arena.', 'INICIAR COMBATE');
  }

  setPreview({ p1Id, p2Id, stageId, mode }) {
    this.preview = {
      p1: CHARACTER_BY_ID[p1Id] || CHARACTER_BY_ID.naruto,
      p2: CHARACTER_BY_ID[p2Id] || CHARACTER_BY_ID.sasuke,
    };
    this.previewStage = STAGE_BY_ID[stageId] || STAGE_BY_ID.leaf;
    this.previewMode = mode || 'cpu';
    if (this.state === 'idle' || this.state === 'matchEnd') {
      this.stage = this.previewStage;
      this.mode = this.previewMode;
      this.preparePreview();
      if (this.state === 'matchEnd') this.state = 'idle';
      this.emit('PRONTO PARA LUTAR', 'Escolha seus shinobi e entre na arena.', 'INICIAR COMBATE');
    }
  }

  preparePreview() {
    const floor = this.stage.floorY;
    this.p1 = new Fighter(this.preview.p1, 215, floor, 1);
    this.p2 = new Fighter(this.preview.p2, 745, floor, -1);
    this.p1.chakra = this.p1.maxChakra;
    this.p2.chakra = this.p2.maxChakra;
    this.projectiles = [];
  }

  startMatch({ p1Id, p2Id, stageId, mode }) {
    this.preview = {
      p1: CHARACTER_BY_ID[p1Id] || CHARACTER_BY_ID.naruto,
      p2: CHARACTER_BY_ID[p2Id] || CHARACTER_BY_ID.sasuke,
    };
    this.stage = STAGE_BY_ID[stageId] || STAGE_BY_ID.leaf;
    this.mode = mode === 'local' ? 'local' : 'cpu';
    this.previewStage = this.stage;
    this.previewMode = this.mode;
    this.round = 1;
    this.roundsWon = { p1: 0, p2: 0 };
    this.roundWinner = null;
    this.matchWinner = null;
    this.roundTimer = ROUND_SECONDS;
    this.transitionTimer = 0;
    this.fightAnnounce = .75;
    this.projectiles = [];
    this.particles = this.particles.filter((particle) => particle.kind === 'ambient');
    this.shake = 0;
    this.aiTimer = .12;
    this.aiAction = {};
    this.state = 'fight';
    this.resetRoundFighters();
    this.spawnRing(ARENA_WIDTH / 2, this.stage.floorY - 35, this.stage.accent, 22);
    this.emit('COMBATE EM ANDAMENTO', `ROUND 1 — ${this.preview.p1.shortName} VS. ${this.preview.p2.shortName}.`, 'NOVA LUTA');
  }

  resetRoundFighters() {
    this.p1.reset(210, 1, this.stage.floorY);
    this.p2.reset(750, -1, this.stage.floorY);
    this.p1.character = this.preview.p1;
    this.p2.character = this.preview.p2;
    this.p1.chakra = 58;
    this.p2.chakra = 58;
    this.projectiles = [];
    this.roundTimer = ROUND_SECONDS;
    this.fightAnnounce = .75;
  }

  resetToIdle() {
    this.state = 'idle';
    this.round = 1;
    this.roundsWon = { p1: 0, p2: 0 };
    this.roundWinner = null;
    this.matchWinner = null;
    this.transitionTimer = 0;
    this.fightAnnounce = 0;
    this.shake = 0;
    this.projectiles = [];
    this.particles = this.particles.filter((particle) => particle.kind === 'ambient');
    this.stage = this.previewStage || STAGE_BY_ID.leaf;
    this.mode = this.previewMode || 'cpu';
    this.preparePreview();
    this.emit('PRONTO PARA LUTAR', 'Configuração reiniciada. Escolha os shinobi e comece novamente.', 'INICIAR COMBATE');
  }

  emit(status, announcement, buttonLabel) {
    this.onStatus?.({ status, announcement, buttonLabel });
  }

  spawnAmbient() {
    this.particles = [];
    for (let i = 0; i < 46; i += 1) {
      this.particles.push({
        kind: 'ambient', x: randomBetween(0, ARENA_WIDTH), y: randomBetween(45, 520),
        vx: randomBetween(-7, 7), vy: randomBetween(-13, -2), size: randomBetween(1, 3),
        alpha: randomBetween(.08, .34), color: this.stage?.accent || '#ff9a56', seed: Math.random() * 10,
      });
    }
  }

  spawnParticles(x, y, color, count = 12, speed = 170) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = randomBetween(speed * .25, speed);
      const life = randomBetween(.2, .55);
      this.particles.push({
        kind: 'spark', shape: Math.random() > .55 ? 'line' : 'dot', x, y,
        vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity,
        size: randomBetween(1.5, 4.5), color, life, maxLife: life,
        rotation: angle,
      });
    }
  }

  spawnRing(x, y, color, count = 14) {
    this.spawnParticles(x, y, color, count, 210);
  }

  updateAmbient(dt) {
    for (const particle of this.particles) {
      if (particle.kind === 'ambient') {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.seed += dt;
        particle.alpha = .12 + (Math.sin(particle.seed * 2) + 1) * .09;
        if (particle.x < -5) particle.x = ARENA_WIDTH + 5;
        if (particle.x > ARENA_WIDTH + 5) particle.x = -5;
        if (particle.y < 28) particle.y = 520;
      } else {
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= Math.max(0, 1 - dt * 2.1);
        particle.vy += 280 * dt;
      }
    }
    this.particles = this.particles.filter((particle) => particle.kind === 'ambient' || particle.life > 0);
    this.shake = Math.max(0, this.shake - dt * 15);
  }

  update(dt) {
    const step = clamp(dt, 0, .033);
    this.updateAmbient(step);
    if (this.state === 'idle' || this.state === 'matchEnd') {
      for (const fighter of [this.p1, this.p2]) if (fighter) fighter.animationTime += step;
      return;
    }
    if (this.state === 'roundEnd') {
      this.transitionTimer -= step;
      if (this.transitionTimer <= 0) {
        if (this.roundsWon.p1 >= 2 || this.roundsWon.p2 >= 2) {
          this.state = 'matchEnd';
          this.matchWinner = this.roundsWon.p1 === this.roundsWon.p2 ? 'draw' : this.roundsWon.p1 > this.roundsWon.p2 ? 'p1' : 'p2';
          const winnerName = this.matchWinner === 'draw' ? 'Empate' : this.matchWinner === 'p1' ? this.p1.character.shortName : this.p2.character.shortName;
          this.emit('COMBATE ENCERRADO', `${winnerName} venceu a série por ${this.roundsWon.p1}–${this.roundsWon.p2}.`, 'REMATCH');
        } else {
          this.round += 1;
          this.resetRoundFighters();
          this.state = 'fight';
          this.emit('ROUND EM ANDAMENTO', `ROUND ${this.round} — melhor de três.`, 'NOVA LUTA');
        }
      }
      return;
    }

    this.roundTimer = Math.max(0, this.roundTimer - step);
    this.fightAnnounce = Math.max(0, this.fightAnnounce - step);

    const p1Actions = this.readPlayerOneActions();
    const p2Actions = this.mode === 'cpu' ? this.readCpuActions(step) : this.readPlayerTwoActions();
    this.updateFighter(this.p1, this.p2, p1Actions, step, 'p1');
    this.updateFighter(this.p2, this.p1, p2Actions, step, 'p2');
    this.resolveFighterSpacing();
    this.resolveMelee(this.p1, this.p2, 'p1');
    this.resolveMelee(this.p2, this.p1, 'p2');
    this.updateProjectiles(step);

    if (this.p1.hp <= 0 || this.p2.hp <= 0) {
      this.finishRound(this.p1.hp === this.p2.hp ? 'draw' : this.p1.hp <= 0 ? 'p2' : 'p1');
    } else if (this.roundTimer <= 0) {
      this.finishRound(this.p1.hp === this.p2.hp ? 'draw' : this.p1.hp > this.p2.hp ? 'p1' : 'p2');
    }
  }

  readPlayerOneActions() {
    const input = this.input;
    return {
      left: input.isDown('a'), right: input.isDown('d'), jump: input.wasPressed('w'),
      attack: input.isDown('f'), jutsu: input.wasPressed('g'), dash: input.wasPressed('h'),
    };
  }

  readPlayerTwoActions() {
    const input = this.input;
    return {
      left: input.isDown('arrowleft'), right: input.isDown('arrowright'), jump: input.wasPressed('arrowup'),
      attack: input.isDown('j'), jutsu: input.wasPressed('k'), dash: input.wasPressed('l'),
    };
  }

  readCpuActions(dt) {
    this.aiTimer -= dt;
    if (this.aiTimer <= 0) {
      this.aiTimer = randomBetween(.13, .27);
      const rival = this.p1;
      const cpu = this.p2;
      const gap = distance(cpu.x, rival.x);
      const weaker = cpu.hp < rival.hp - 14;
      const decision = { left: false, right: false, jump: false, attack: false, jutsu: false, dash: false };
      if (gap > 100) {
        if (cpu.x > rival.x) decision.left = true;
        else decision.right = true;
      } else if (gap < 54 && weaker && Math.random() < .25) {
        if (cpu.x > rival.x) decision.right = true;
        else decision.left = true;
      }
      decision.attack = gap < 94 && Math.random() > .08;
      decision.jutsu = gap > 104 && gap < 365 && cpu.chakra >= JUTSU_COST && cpu.jutsuCooldown <= .02 && Math.random() < .75;
      decision.dash = gap > 240 && gap < 430 && cpu.dashCooldown <= .02 && Math.random() < .16;
      decision.jump = Math.random() < .07 && cpu.grounded;
      this.aiAction = decision;
    }
    return this.aiAction;
  }

  updateFighter(fighter, opponent, actions, dt, side) {
    fighter.tickTimers(dt);
    fighter.facing = opponent.x >= fighter.x ? 1 : -1;

    const move = Number(Boolean(actions.right)) - Number(Boolean(actions.left));
    if (actions.dash && fighter.dashCooldown <= 0 && fighter.stunTimer <= 0) {
      fighter.dashTimer = .16;
      fighter.dashCooldown = .86;
      fighter.invulnerability = Math.max(fighter.invulnerability, .12);
      fighter.dashDirection = move || fighter.facing;
      fighter.vx = fighter.dashDirection * 690;
      this.spawnParticles(fighter.x - fighter.dashDirection * 10, fighter.y - 38, fighter.character.accent, 7, 110);
    }

    if (fighter.stunTimer <= 0) {
      if (actions.jump && fighter.grounded && fighter.dashTimer <= 0) {
        fighter.vy = -JUMP_SPEED;
        this.spawnParticles(fighter.x, fighter.floorY - 4, '#b4c5d9', 4, 70);
      }
      if (fighter.dashTimer > 0) {
        fighter.vx = (fighter.dashDirection || fighter.facing) * 690;
      } else if (move !== 0) {
        fighter.vx = move * fighter.character.speed * 55;
      } else {
        fighter.vx *= Math.max(0, 1 - dt * 10);
      }

      if (actions.attack) fighter.startAttack();
      if (actions.jutsu && fighter.chakra >= JUTSU_COST && fighter.jutsuCooldown <= 0) this.castJutsu(fighter, opponent, side);
    } else {
      fighter.vx *= Math.max(0, 1 - dt * 2.5);
    }

    fighter.x += fighter.vx * dt;
    fighter.vy += GRAVITY * dt;
    fighter.y += fighter.vy * dt;
    fighter.x = clamp(fighter.x, 34, ARENA_WIDTH - 34);
    if (fighter.y > fighter.floorY) {
      fighter.y = fighter.floorY;
      fighter.vy = 0;
    }
  }

  resolveFighterSpacing() {
    const minGap = 49;
    const delta = this.p2.x - this.p1.x;
    const gap = Math.abs(delta);
    if (gap < minGap && Math.abs(this.p1.y - this.p2.y) < 53) {
      const overlap = (minGap - gap) / 2;
      const dir = delta >= 0 ? 1 : -1;
      this.p1.x = clamp(this.p1.x - dir * overlap, 30, ARENA_WIDTH - 30);
      this.p2.x = clamp(this.p2.x + dir * overlap, 30, ARENA_WIDTH - 30);
    }
  }

  resolveMelee(attacker, defender, side) {
    if (attacker.attackTimer <= 0 || attacker.attackHasHit || defender.hp <= 0) return;
    const dx = defender.x - attacker.x;
    const dy = Math.abs((defender.y - defender.height * .55) - (attacker.y - attacker.height * .55));
    const inFront = dx * attacker.facing >= -7;
    if (inFront && Math.abs(dx) < 82 && dy < 65) {
      const damage = 6.5 + attacker.character.power * .72 + Math.random() * 1.7;
      if (defender.takeDamage(damage, 235, attacker.x)) {
        attacker.attackHasHit = true;
        attacker.chakra = clamp(attacker.chakra + 9, 0, attacker.maxChakra);
        attacker.combo += 1;
        attacker.comboTimer = 1.05;
        this.shake = Math.max(this.shake, 3.2);
        this.spawnParticles(defender.x - defender.facing * 11, defender.y - 52, attacker.character.accent, 9, 155);
        if (attacker.combo >= 2) this.emit('COMBO!', `${attacker.character.shortName} conectou ${attacker.combo} ataques!`, 'NOVA LUTA');
      }
    }
  }

  castJutsu(fighter, opponent, side) {
    fighter.chakra = Math.max(0, fighter.chakra - JUTSU_COST);
    fighter.jutsuCooldown = 1.05;
    fighter.attackTimer = 0;
    fighter.vx += fighter.facing * 20;
    const char = fighter.character;
    this.spawnParticles(fighter.x + fighter.facing * 25, fighter.y - 52, char.accent, 12, 125);
    if (char.techniqueType === 'burst') {
      this.shake = Math.max(this.shake, 4.2);
      this.spawnRing(fighter.x + fighter.facing * 48, fighter.y - 46, char.accent, 21);
      const gap = distance(fighter.x, opponent.x);
      const verticalGap = Math.abs(fighter.y - opponent.y);
      if (gap < 180 && verticalGap < 100) {
        if (opponent.takeDamage(char.techDamage, 310, fighter.x)) {
          opponent.combo = 0;
          this.spawnParticles(opponent.x, opponent.y - 46, char.accent, 16, 210);
        }
      }
      this.emit('JUTSU ATIVADO', `${char.shortName}: ${char.technique}!`, 'NOVA LUTA');
      return;
    }
    this.projectiles.push({
      owner: side, x: fighter.x + fighter.facing * 37, y: fighter.y - 48,
      vx: fighter.facing * char.projectileSpeed, vy: 0, facing: fighter.facing,
      radius: char.techniqueType === 'bolt' ? 12 : 16, color: char.accent,
      damage: char.techDamage, type: char.techniqueType, life: 1.85,
    });
    this.emit('JUTSU LANÇADO', `${char.shortName}: ${char.technique}!`, 'NOVA LUTA');
  }

  updateProjectiles(dt) {
    for (const projectile of this.projectiles) {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      const target = projectile.owner === 'p1' ? this.p2 : this.p1;
      if (target && Math.abs(target.x - projectile.x) < projectile.radius + 20 && Math.abs((target.y - 49) - projectile.y) < 38) {
        if (target.takeDamage(projectile.damage, 265, projectile.x - projectile.vx * .02)) {
          this.shake = Math.max(this.shake, 5.1);
          this.spawnParticles(projectile.x, projectile.y, projectile.color, 18, 230);
        }
        projectile.life = 0;
      }
      if (projectile.x < -70 || projectile.x > ARENA_WIDTH + 70) projectile.life = 0;
    }
    this.projectiles = this.projectiles.filter((projectile) => projectile.life > 0);
  }

  finishRound(winner) {
    if (this.state !== 'fight') return;
    this.state = 'roundEnd';
    this.roundWinner = winner;
    this.transitionTimer = 2.35;
    if (winner === 'p1') this.roundsWon.p1 += 1;
    else if (winner === 'p2') this.roundsWon.p2 += 1;
    this.projectiles = [];
    this.spawnRing(ARENA_WIDTH / 2, this.stage.floorY - 52, winner === 'p1' ? this.p1.character.accent : this.p2.character.accent, 28);
    const roundText = winner === 'draw' ? 'Round empatado.' : `${winner === 'p1' ? this.p1.character.shortName : this.p2.character.shortName} venceu o round.`;
    this.emit('FIM DE ROUND', `${roundText} Placar ${this.roundsWon.p1}–${this.roundsWon.p2}.`, 'NOVA LUTA');
  }

  render(now) {
    this.renderer.draw(this, now);
  }
}
