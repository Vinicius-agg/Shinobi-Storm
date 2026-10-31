import { clamp, randomBetween } from './math.js';

const W = 960;
const H = 540;

function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundedRect(ctx, x, y, width, height, radius = 4) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Seu navegador não conseguiu inicializar o Canvas 2D.');
    this.ctx.imageSmoothingEnabled = true;
    this.lastFrame = 0;
  }

  draw(game, now = 0) {
    const ctx = this.ctx;
    ctx.save();
    if (game.shake > 0) ctx.translate(randomBetween(-game.shake, game.shake), randomBetween(-game.shake / 2, game.shake / 2));
    this.drawBackground(game.stage, now, game.particles);
    this.drawFloor(game.stage);
    this.drawProjectiles(game.projectiles, now);
    for (const fighter of [game.p1, game.p2]) if (fighter) this.drawFighter(fighter, now);
    this.drawParticles(game.particles);
    this.drawHud(game, now);
    this.drawOverlay(game, now);
    ctx.restore();
  }

  drawBackground(stage, now, particles) {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, stage.skyTop);
    gradient.addColorStop(0.66, stage.skyBottom);
    gradient.addColorStop(1, stage.ground);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Brilho suave perto da linha do horizonte.
    const glow = ctx.createRadialGradient(W * 0.5, 255, 5, W * 0.5, 255, 370);
    glow.addColorStop(0, hexToRgba(stage.accent, 0.22));
    glow.addColorStop(1, hexToRgba(stage.accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 60, W, 390);

    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = stage.accent;
    ctx.beginPath();
    ctx.arc(754, 116, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(754, 116, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.drawClouds(stage, now);
    if (stage.motif === 'village') this.drawVillage(stage, now);
    else if (stage.motif === 'valley') this.drawValley(stage, now);
    else if (stage.motif === 'forest') this.drawForest(stage, now);
    else this.drawSandDunes(stage, now);

    // Vinheta lateral dá mais contraste ao centro da arena.
    const vignette = ctx.createLinearGradient(0, 0, W, 0);
    vignette.addColorStop(0, 'rgba(5,8,18,.5)');
    vignette.addColorStop(0.18, 'rgba(5,8,18,0)');
    vignette.addColorStop(0.82, 'rgba(5,8,18,0)');
    vignette.addColorStop(1, 'rgba(5,8,18,.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    for (const particle of particles) {
      if (particle.kind === 'ambient' && particle.alpha > 0) {
        ctx.globalAlpha = particle.alpha * 0.58;
        ctx.fillStyle = particle.color || stage.accent;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  drawClouds(stage, now) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = stage.accent;
    for (let i = 0; i < 5; i += 1) {
      const x = ((i * 245 + now * 7) % (W + 220)) - 110;
      const y = 70 + (i % 3) * 34;
      ctx.beginPath();
      ctx.ellipse(x, y, 77, 11, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 24, y - 4, 40, 16, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 26, y + 2, 34, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawVillage(stage, now) {
    const ctx = this.ctx;
    ctx.fillStyle = stage.far;
    ctx.beginPath(); ctx.moveTo(0, 327);
    for (let x = 0; x <= W; x += 60) ctx.lineTo(x, 295 + Math.sin(x * 0.024) * 13 + Math.cos(x * 0.012) * 9);
    ctx.lineTo(W, 420); ctx.lineTo(0, 420); ctx.closePath(); ctx.fill();

    // Casas e telhados geométricos ao longe.
    for (let i = 0; i < 13; i += 1) {
      const x = i * 79 - 12;
      const base = 405 + Math.sin(i * 3.2) * 9;
      const height = 42 + (i % 4) * 11;
      ctx.fillStyle = i % 2 ? '#223048' : '#30405a';
      ctx.fillRect(x, base - height, 58, height);
      ctx.beginPath(); ctx.moveTo(x - 7, base - height); ctx.lineTo(x + 29, base - height - 16); ctx.lineTo(x + 65, base - height); ctx.closePath(); ctx.fill();
      ctx.fillStyle = hexToRgba(stage.accent, 0.2);
      for (let w = 0; w < 2; w += 1) for (let h = 0; h < 2; h += 1) ctx.fillRect(x + 10 + w * 22, base - height + 11 + h * 14, 7, 7);
    }
    // Portão estilizado da vila.
    ctx.fillStyle = '#151f34';
    ctx.fillRect(414, 270, 132, 143);
    ctx.fillStyle = '#536078';
    ctx.fillRect(426, 280, 12, 137); ctx.fillRect(522, 280, 12, 137);
    ctx.fillRect(408, 270, 144, 10); ctx.fillRect(438, 251, 84, 20);
    ctx.fillStyle = '#bd6e55'; ctx.fillRect(447, 291, 66, 118);
    ctx.fillStyle = '#e7a178'; ctx.fillRect(454, 298, 52, 5);
    ctx.fillStyle = '#1b293e'; ctx.fillRect(464, 322, 24, 88);
    ctx.fillStyle = hexToRgba(stage.accent, .45);
    for (let i = 0; i < 3; i += 1) ctx.fillRect(453 + i * 18, 306, 5, 5);
  }

  drawValley(stage, now) {
    const ctx = this.ctx;
    ctx.fillStyle = stage.far;
    ctx.beginPath(); ctx.moveTo(0, 383); ctx.lineTo(0, 260); ctx.lineTo(80, 226); ctx.lineTo(144, 260); ctx.lineTo(212, 188); ctx.lineTo(278, 258); ctx.lineTo(344, 226); ctx.lineTo(410, 290); ctx.lineTo(485, 245); ctx.lineTo(548, 300); ctx.lineTo(625, 210); ctx.lineTo(701, 266); ctx.lineTo(772, 200); ctx.lineTo(850, 250); ctx.lineTo(960, 218); ctx.lineTo(960, 410); ctx.closePath(); ctx.fill();
    ctx.fillStyle = stage.mid;
    ctx.beginPath(); ctx.moveTo(0, 375); ctx.lineTo(0, 320); ctx.lineTo(109, 285); ctx.lineTo(184, 324); ctx.lineTo(270, 274); ctx.lineTo(355, 326); ctx.lineTo(430, 291); ctx.lineTo(516, 335); ctx.lineTo(602, 286); ctx.lineTo(688, 332); ctx.lineTo(791, 281); ctx.lineTo(873, 330); ctx.lineTo(960, 297); ctx.lineTo(960, 422); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .7;
    ctx.fillStyle = '#84d4d4';
    for (const x of [190, 610, 810]) {
      ctx.fillRect(x, 288, 5, 102);
      ctx.globalAlpha = .15;
      ctx.fillRect(x - 8, 288, 22, 115);
      ctx.globalAlpha = .7;
    }
    ctx.globalAlpha = 1;
    // Silhuetas de estátuas distantes, como marcos do vale.
    this.drawStatue(95, 356, '#172f43', -1);
    this.drawStatue(855, 356, '#172f43', 1);
  }

  drawStatue(x, y, color, direction) {
    const ctx = this.ctx;
    ctx.save(); ctx.translate(x, y); ctx.scale(direction, 1); ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-14, -72); ctx.lineTo(0, -86); ctx.lineTo(16, -70); ctx.lineTo(23, 0); ctx.closePath(); ctx.fill();
    ctx.fillRect(-10, -111, 20, 34); ctx.beginPath(); ctx.moveTo(-10, -103); ctx.lineTo(-26, -119); ctx.lineTo(-17, -85); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -104); ctx.lineTo(26, -121); ctx.lineTo(18, -85); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  drawForest(stage, now) {
    const ctx = this.ctx;
    ctx.fillStyle = stage.far;
    for (let i = 0; i < 12; i += 1) {
      const x = i * 95 - 15;
      const h = 145 + (i % 4) * 24;
      ctx.fillRect(x, 425 - h, 22 + (i % 3) * 7, h);
      ctx.beginPath(); ctx.moveTo(x - 51, 425 - h + 34); ctx.lineTo(x + 15, 425 - h - 52); ctx.lineTo(x + 70, 425 - h + 34); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = stage.mid;
    for (let i = 0; i < 9; i += 1) {
      const x = i * 125 - 40;
      const h = 123 + (i % 3) * 33;
      ctx.fillRect(x, 430 - h, 37, h);
      ctx.beginPath(); ctx.moveTo(x - 65, 430 - h + 53); ctx.lineTo(x + 18, 430 - h - 40); ctx.lineTo(x + 95, 430 - h + 53); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = hexToRgba(stage.accent, .17);
    for (let i = 0; i < 7; i += 1) {
      const x = 50 + i * 141;
      ctx.beginPath(); ctx.ellipse(x, 389 + (i % 2) * 12, 44, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawSandDunes(stage, now) {
    const ctx = this.ctx;
    ctx.fillStyle = stage.far;
    ctx.beginPath(); ctx.moveTo(0, 382); ctx.lineTo(0, 315); ctx.bezierCurveTo(115, 240, 200, 322, 305, 282); ctx.bezierCurveTo(408, 245, 472, 302, 564, 275); ctx.bezierCurveTo(684, 237, 775, 320, 960, 262); ctx.lineTo(960, 420); ctx.closePath(); ctx.fill();
    ctx.fillStyle = stage.mid;
    ctx.beginPath(); ctx.moveTo(0, 400); ctx.bezierCurveTo(140, 330, 231, 382, 364, 325); ctx.bezierCurveTo(500, 272, 619, 356, 760, 322); ctx.bezierCurveTo(841, 300, 902, 333, 960, 310); ctx.lineTo(960, 430); ctx.lineTo(0, 430); ctx.closePath(); ctx.fill();
    // Rochas e ruínas distantes.
    for (const x of [102, 224, 742, 856]) {
      ctx.fillStyle = '#7c514b';
      ctx.beginPath(); ctx.moveTo(x - 20, 404); ctx.lineTo(x - 11, 370); ctx.lineTo(x + 2, 381); ctx.lineTo(x + 18, 350); ctx.lineTo(x + 28, 404); ctx.closePath(); ctx.fill();
    }
  }

  drawFloor(stage) {
    const ctx = this.ctx;
    const y = stage.floorY;
    const ground = ctx.createLinearGradient(0, y, 0, H);
    ground.addColorStop(0, stage.groundEdge);
    ground.addColorStop(.025, stage.ground);
    ground.addColorStop(1, '#080e19');
    ctx.fillStyle = ground;
    ctx.fillRect(0, y, W, H - y);
    ctx.fillStyle = hexToRgba(stage.accent, .6);
    ctx.fillRect(0, y, W, 2);
    ctx.globalAlpha = .14;
    ctx.strokeStyle = stage.accent;
    ctx.lineWidth = 1;
    for (let x = -60; x < W + 60; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.lineTo(x - 70, H); ctx.stroke();
    }
    ctx.globalAlpha = .22;
    for (let x = 0; x < W; x += 9) {
      const randY = y + 13 + ((x * 31) % 35);
      ctx.fillStyle = x % 2 ? '#fff' : stage.accent;
      ctx.fillRect(x, randY, 1, 1);
    }
    ctx.globalAlpha = 1;
    // Marcas de zona de combate.
    ctx.strokeStyle = hexToRgba(stage.accent, .18); ctx.setLineDash([5, 8]);
    ctx.beginPath(); ctx.moveTo(60, y + 28); ctx.lineTo(W - 60, y + 28); ctx.stroke(); ctx.setLineDash([]);
  }

  drawFighter(fighter, now) {
    const ctx = this.ctx;
    const char = fighter.character;
    const bob = fighter.grounded ? Math.sin(fighter.animationTime * 8) * 1.3 : 0;
    const run = Math.abs(fighter.vx) > 40 && fighter.grounded ? Math.sin(fighter.animationTime * 18) * 8 : 0;
    const attackProgress = fighter.attackTimer > 0 ? 1 - fighter.attackTimer / 0.19 : 0;
    const alpha = fighter.invulnerability > 0 && Math.floor(now * 28) % 2 === 0 ? .52 : 1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(fighter.x, fighter.y + bob);
    ctx.scale(fighter.facing, 1);

    // Sombra dinâmica abaixo dos pés.
    ctx.save(); ctx.translate(0, 2); ctx.scale(clamp(1 - (fighter.floorY - fighter.y) / 180, .4, 1), 1);
    const shadow = ctx.createRadialGradient(0, 0, 2, 0, 0, 44);
    shadow.addColorStop(0, 'rgba(0,0,0,.48)'); shadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadow; ctx.beginPath(); ctx.ellipse(0, 0, 46, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    if (fighter.chakra > 70 || fighter.dashTimer > 0) {
      ctx.globalAlpha = alpha * (fighter.dashTimer > 0 ? .46 : .16);
      const aura = ctx.createRadialGradient(0, -43, 6, 0, -43, 54);
      aura.addColorStop(0, hexToRgba(char.accent, .6)); aura.addColorStop(1, hexToRgba(char.accent, 0));
      ctx.fillStyle = aura; ctx.beginPath(); ctx.ellipse(0, -46, 51, 63, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = alpha;
    }

    // Pernas e sandálias.
    ctx.strokeStyle = '#111723'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-9, -27); ctx.lineTo(-13 + run, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -27); ctx.lineTo(13 - run, -6); ctx.stroke();
    ctx.strokeStyle = '#303c51'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-13 + run, -6); ctx.lineTo(-6 + run, -4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(13 - run, -6); ctx.lineTo(20 - run, -4); ctx.stroke();

    // Roupa base e faixa na cintura.
    ctx.fillStyle = char.color;
    ctx.beginPath(); ctx.moveTo(-19, -58); ctx.quadraticCurveTo(-21, -49, -18, -26); ctx.lineTo(18, -26); ctx.quadraticCurveTo(21, -47, 19, -58); ctx.closePath(); ctx.fill();
    ctx.fillStyle = hexToRgba('#070b13', .5); ctx.fillRect(-19, -34, 38, 5);
    ctx.fillStyle = char.accent; ctx.fillRect(-17, -35, 34, 2);
    ctx.fillStyle = char.color;
    ctx.beginPath(); ctx.moveTo(-17, -55); ctx.lineTo(-28, -38); ctx.lineTo(-22, -32); ctx.lineTo(-10, -48); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(17, -55); ctx.lineTo(29, -39); ctx.lineTo(23, -32); ctx.lineTo(11, -49); ctx.closePath(); ctx.fill();

    // Mão avançada e brilho de ataque.
    const armY = fighter.attackTimer > 0 ? -51 + Math.sin(attackProgress * Math.PI) * 5 : -48;
    ctx.strokeStyle = char.skin; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(15, -52); ctx.lineTo(fighter.attackTimer > 0 ? 34 : 26, armY); ctx.stroke();
    ctx.fillStyle = char.skin; ctx.beginPath(); ctx.arc(fighter.attackTimer > 0 ? 35 : 27, armY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hexToRgba(char.accent, .9); ctx.lineWidth = 2;
    if (fighter.attackTimer > 0) {
      ctx.beginPath(); ctx.arc(39, -50, 17 + attackProgress * 10, -0.7, 0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(24, -67); ctx.lineTo(47, -53); ctx.lineTo(27, -44); ctx.stroke();
    }

    // Pescoço e cabeça.
    ctx.fillStyle = char.skin; ctx.fillRect(-5, -65, 10, 12);
    ctx.fillStyle = char.skin; ctx.beginPath(); ctx.ellipse(0, -71, 15.5, 18, 0, 0, Math.PI * 2); ctx.fill();
    // Cabelo/contorno com pequenas pontas variando pelo lutador.
    ctx.fillStyle = char.hair;
    ctx.beginPath(); ctx.moveTo(-16, -73); ctx.lineTo(-19, -88); ctx.lineTo(-8, -82); ctx.lineTo(-4, -96); ctx.lineTo(4, -84); ctx.lineTo(15, -90); ctx.lineTo(15, -75); ctx.lineTo(9, -64); ctx.lineTo(-12, -64); ctx.closePath(); ctx.fill();
    // Bandana e placa frontal.
    ctx.fillStyle = char.headband; ctx.fillRect(-16, -78, 32, 6);
    ctx.fillStyle = '#b8c5d7'; ctx.fillRect(-5, -79, 10, 7);
    ctx.strokeStyle = '#687a94'; ctx.lineWidth = 1; ctx.strokeRect(-4, -78, 8, 5);
    // Olhos voltados para o adversário.
    ctx.fillStyle = '#1b2535'; ctx.fillRect(3, -71, 6, 2.5); ctx.fillRect(-10, -71, 6, 2.5);
    ctx.fillStyle = '#fff'; ctx.fillRect(5, -71, 2, 1);
    // Marca de bochecha simples para diferenciar o estilo.
    if (['naruto', 'gaara', 'lee'].includes(char.id)) {
      ctx.strokeStyle = hexToRgba(char.accent, .8); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-13, -65); ctx.lineTo(-7, -63); ctx.moveTo(7, -63); ctx.lineTo(13, -65); ctx.stroke();
    }
    // Lenço/capa para alguns lutadores.
    if (['kakashi', 'itachi', 'minato', 'madara'].includes(char.id)) {
      ctx.fillStyle = hexToRgba(char.accent, .78);
      ctx.beginPath(); ctx.moveTo(-16, -55); ctx.lineTo(-25, -27); ctx.lineTo(-17, -21); ctx.lineTo(-8, -41); ctx.closePath(); ctx.fill();
    }
    if (fighter.hitFlash > 0) {
      ctx.globalAlpha = alpha * .5;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, -50, 31, 43, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // Rastro do dash.
    if (fighter.dashTimer > 0) {
      ctx.save(); ctx.globalAlpha = fighter.dashTimer * 3.5;
      ctx.strokeStyle = char.accent; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i += 1) {
        const offset = (i + 1) * 13;
        ctx.beginPath(); ctx.moveTo(fighter.x - fighter.facing * offset, fighter.y - 42 + i * 9); ctx.lineTo(fighter.x - fighter.facing * (offset + 18), fighter.y - 42 + i * 9); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawProjectiles(projectiles, now) {
    const ctx = this.ctx;
    for (const projectile of projectiles) {
      ctx.save(); ctx.translate(projectile.x, projectile.y);
      const pulse = 0.85 + Math.sin(now * 22 + projectile.x * .03) * .15;
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, projectile.radius * 2.8);
      glow.addColorStop(0, hexToRgba(projectile.color, .85)); glow.addColorStop(.5, hexToRgba(projectile.color, .28)); glow.addColorStop(1, hexToRgba(projectile.color, 0));
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, projectile.radius * 2.8, 0, Math.PI * 2); ctx.fill();
      if (projectile.type === 'bolt') {
        ctx.strokeStyle = projectile.color; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-projectile.facing * 26, -4); ctx.lineTo(-projectile.facing * 10, 2); ctx.lineTo(0, -8); ctx.lineTo(projectile.facing * 11, 2); ctx.lineTo(projectile.facing * 26, -3); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-projectile.facing * 16, -4); ctx.lineTo(projectile.facing * 18, -1); ctx.stroke();
      } else {
        ctx.fillStyle = projectile.color; ctx.beginPath(); ctx.arc(0, 0, projectile.radius * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = .82; ctx.beginPath(); ctx.arc(-projectile.facing * 4, -4, projectile.radius * .35, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
  }

  drawParticles(particles) {
    const ctx = this.ctx;
    for (const particle of particles) {
      if (particle.kind === 'ambient') continue;
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.fillStyle = particle.color;
      if (particle.shape === 'line') {
        ctx.save(); ctx.translate(particle.x, particle.y); ctx.rotate(particle.rotation || 0);
        ctx.fillRect(-particle.size * 2, -1, particle.size * 4, 2); ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(particle.x, particle.y, Math.max(1, particle.size * (particle.life / particle.maxLife)), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawHud(game, now) {
    const ctx = this.ctx;
    const left = game.p1; const right = game.p2;
    if (!left || !right) return;
    ctx.save();
    // Plaquetas dos nomes.
    roundedRect(ctx, 26, 20, 280, 71, 5); ctx.fillStyle = 'rgba(8,13,25,.76)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.11)'; ctx.stroke();
    roundedRect(ctx, W - 306, 20, 280, 71, 5); ctx.fillStyle = 'rgba(8,13,25,.76)'; ctx.fill(); ctx.stroke();
    ctx.font = '800 10px Inter, sans-serif'; ctx.fillStyle = left.character.accent; ctx.textAlign = 'left'; ctx.fillText('PLAYER 1', 40, 39);
    ctx.font = '700 18px "Barlow Condensed", sans-serif'; ctx.fillStyle = '#f1f5ff'; ctx.fillText(left.character.shortName.toUpperCase(), 40, 59);
    ctx.font = '700 10px Inter, sans-serif'; ctx.fillStyle = right.character.accent; ctx.textAlign = 'right'; ctx.fillText(game.mode === 'cpu' ? 'CPU RIVAL' : 'PLAYER 2', W - 40, 39);
    ctx.font = '700 18px "Barlow Condensed", sans-serif'; ctx.fillStyle = '#f1f5ff'; ctx.fillText(right.character.shortName.toUpperCase(), W - 40, 59);

    // Barras de vida.
    const barWidth = 248; const barY = 66; const barH = 9;
    ctx.fillStyle = '#2b3042'; roundedRect(ctx, 40, barY, barWidth, barH, 4); ctx.fill();
    const p1Width = barWidth * left.hp / left.maxHp;
    const p1Grad = ctx.createLinearGradient(40, 0, 40 + barWidth, 0); p1Grad.addColorStop(0, '#ed573d'); p1Grad.addColorStop(1, '#ffb35d');
    ctx.fillStyle = p1Grad; roundedRect(ctx, 40, barY, p1Width, barH, 4); ctx.fill();
    const rightX = W - 40 - barWidth;
    ctx.fillStyle = '#2b3042'; roundedRect(ctx, rightX, barY, barWidth, barH, 4); ctx.fill();
    const p2Width = barWidth * right.hp / right.maxHp;
    const p2Grad = ctx.createLinearGradient(rightX, 0, rightX + barWidth, 0); p2Grad.addColorStop(0, '#8deef0'); p2Grad.addColorStop(1, '#408be1');
    ctx.fillStyle = p2Grad; roundedRect(ctx, rightX + barWidth - p2Width, barY, p2Width, barH, 4); ctx.fill();

    // Chakra bars e contadores de rounds.
    ctx.fillStyle = '#26334a'; roundedRect(ctx, 40, 80, barWidth, 4, 2); ctx.fill();
    ctx.fillStyle = left.character.accent; roundedRect(ctx, 40, 80, barWidth * left.chakra / left.maxChakra, 4, 2); ctx.fill();
    ctx.fillStyle = '#26334a'; roundedRect(ctx, rightX, 80, barWidth, 4, 2); ctx.fill();
    ctx.fillStyle = right.character.accent; roundedRect(ctx, rightX + barWidth - barWidth * right.chakra / right.maxChakra, 80, barWidth * right.chakra / right.maxChakra, 4, 2); ctx.fill();

    // Placar central.
    roundedRect(ctx, 426, 20, 108, 65, 5); ctx.fillStyle = 'rgba(8,13,25,.88)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.font = '800 8px Inter, sans-serif'; ctx.fillStyle = '#899ab8'; ctx.fillText(`ROUND ${Math.min(game.round, 3)}`, W / 2, 35);
    const secs = Math.max(0, Math.ceil(game.roundTimer));
    ctx.font = '900 29px "Barlow Condensed", sans-serif'; ctx.fillStyle = secs <= 15 ? '#ff7652' : '#f0f5ff'; ctx.fillText(`${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`, W / 2, 62);
    ctx.font = '700 9px Inter, sans-serif'; ctx.fillStyle = '#adb9ce'; ctx.fillText(`${game.roundsWon.p1}  ·  ${game.roundsWon.p2}`, W / 2, 77);

    // Micro feedback para cooldown e jutsu.
    ctx.textAlign = 'left'; ctx.font = '700 8px Inter, sans-serif'; ctx.fillStyle = '#e6b6a0';
    if (left.chakra < 25) ctx.fillText('CHAKRA BAIXO', 40, 104);
    ctx.textAlign = 'right'; ctx.fillStyle = '#a5d8e5';
    if (right.chakra < 25) ctx.fillText('CHAKRA BAIXO', W - 40, 104);
    ctx.restore();
  }

  drawOverlay(game, now) {
    const ctx = this.ctx;
    if (game.state === 'fight') {
      if (game.fightAnnounce > 0) {
        const alpha = clamp(game.fightAnnounce / .65, 0, 1);
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(5,10,20,.28)'; ctx.fillRect(0, 192, W, 124);
        ctx.textAlign = 'center'; ctx.font = '900 52px "Barlow Condensed", sans-serif'; ctx.fillStyle = '#ffffff'; ctx.fillText('FIGHT!', W / 2, 263);
        ctx.strokeStyle = game.stage.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(365, 278); ctx.lineTo(595, 278); ctx.stroke();
        ctx.restore();
      }
      return;
    }

    ctx.save();
    ctx.fillStyle = 'rgba(4,8,17,.63)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    if (game.state === 'idle') {
      ctx.font = '900 63px "Barlow Condensed", sans-serif'; ctx.fillStyle = '#f3f6ff'; ctx.fillText('SHINOBI', W / 2, 220);
      ctx.fillStyle = game.stage.accent; ctx.fillText('STORM', W / 2, 276);
      ctx.font = '800 12px Inter, sans-serif'; ctx.fillStyle = '#b8c7e0'; ctx.fillText('ESCOLHA SEU CAMINHO. DOMINE A ARENA.', W / 2, 310);
      ctx.font = '600 11px Inter, sans-serif'; ctx.fillStyle = '#9caecb'; ctx.fillText('Clique em INICIAR COMBATE para começar', W / 2, 342);
      ctx.fillStyle = game.p1.character.accent; ctx.fillRect(W / 2 - 95, 365, 190, 2);
      ctx.font = '700 10px Inter, sans-serif'; ctx.fillStyle = '#c3cee2'; ctx.fillText('MELHOR DE 3 ROUNDS  /  12 SHINOBI  /  4 ARENAS', W / 2, 389);
    } else if (game.state === 'roundEnd') {
      ctx.font = '800 14px Inter, sans-serif'; ctx.fillStyle = game.roundWinner === 'draw' ? '#ffd18b' : game.roundWinner === 'p1' ? game.p1.character.accent : game.p2.character.accent;
      ctx.fillText(game.roundWinner === 'draw' ? 'ROUND EMPATADO' : `${game.roundWinner === 'p1' ? game.p1.character.shortName : game.p2.character.shortName} VENCE O ROUND`, W / 2, 230);
      ctx.font = '900 50px "Barlow Condensed", sans-serif'; ctx.fillStyle = '#f5f7ff'; ctx.fillText(`ROUND ${game.round}`, W / 2, 280);
      ctx.font = '600 12px Inter, sans-serif'; ctx.fillStyle = '#b0bfd9'; ctx.fillText('Prepare-se para a próxima rodada...', W / 2, 312);
      ctx.font = '800 18px "Barlow Condensed", sans-serif'; ctx.fillStyle = game.stage.accent; ctx.fillText(`${Math.ceil(game.transitionTimer)}`, W / 2, 352);
    } else if (game.state === 'matchEnd') {
      const winner = game.matchWinner === 'p1' ? game.p1 : game.p2;
      ctx.font = '800 12px Inter, sans-serif'; ctx.fillStyle = game.matchWinner === 'draw' ? '#ffd18b' : winner.character.accent;
      ctx.fillText(game.matchWinner === 'draw' ? 'EMPATE NA ARENA' : 'VITÓRIA SHINOBI', W / 2, 205);
      ctx.font = '900 52px "Barlow Condensed", sans-serif'; ctx.fillStyle = '#fff';
      ctx.fillText(game.matchWinner === 'draw' ? 'LUTA ÉPICA' : winner.character.shortName.toUpperCase(), W / 2, 265);
      ctx.font = '700 13px Inter, sans-serif'; ctx.fillStyle = '#b7c4da'; ctx.fillText(`PLACAR FINAL  ${game.roundsWon.p1}  —  ${game.roundsWon.p2}`, W / 2, 301);
      ctx.font = '600 11px Inter, sans-serif'; ctx.fillStyle = '#8fa2c3'; ctx.fillText('Clique em REMATCH para uma nova disputa', W / 2, 339);
      ctx.fillStyle = game.stage.accent; ctx.fillRect(W / 2 - 72, 358, 144, 2);
    }
    ctx.restore();
  }
}
