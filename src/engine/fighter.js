export class Fighter {
  constructor(character, x, floorY, facing = 1) {
    this.character = character;
    this.x = x;
    this.floorY = floorY;
    this.y = floorY;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.width = 48;
    this.height = 84;
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.maxChakra = 100;
    this.chakra = 58;
    this.attackCooldown = 0;
    this.attackTimer = 0;
    this.attackHasHit = false;
    this.jutsuCooldown = 0;
    this.dashCooldown = 0;
    this.dashTimer = 0;
    this.stunTimer = 0;
    this.invulnerability = 0;
    this.hitFlash = 0;
    this.animationTime = Math.random() * 3;
    this.combo = 0;
    this.comboTimer = 0;
  }

  get grounded() { return this.y >= this.floorY - 0.1; }

  reset(x, facing, floorY) {
    this.x = x;
    this.y = floorY;
    this.floorY = floorY;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.hp = this.maxHp;
    this.chakra = 58;
    this.attackCooldown = 0;
    this.attackTimer = 0;
    this.attackHasHit = false;
    this.jutsuCooldown = 0;
    this.dashCooldown = 0;
    this.dashTimer = 0;
    this.stunTimer = 0;
    this.invulnerability = 0;
    this.hitFlash = 0;
    this.combo = 0;
    this.comboTimer = 0;
  }

  tickTimers(dt) {
    for (const key of ['attackCooldown', 'attackTimer', 'jutsuCooldown', 'dashCooldown', 'dashTimer', 'stunTimer', 'invulnerability', 'hitFlash', 'comboTimer']) {
      this[key] = Math.max(0, this[key] - dt);
    }
    if (this.comboTimer <= 0) this.combo = 0;
    this.animationTime += dt;
  }

  startAttack() {
    if (this.attackCooldown > 0 || this.stunTimer > 0 || this.dashTimer > 0) return false;
    this.attackCooldown = 0.34;
    this.attackTimer = 0.19;
    this.attackHasHit = false;
    return true;
  }

  takeDamage(amount, knockback, sourceX) {
    if (this.invulnerability > 0 || this.hp <= 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.stunTimer = Math.max(this.stunTimer, 0.24);
    this.invulnerability = 0.13;
    this.hitFlash = 0.15;
    this.vx = this.x < sourceX ? -knockback : knockback;
    this.vy = Math.min(this.vy, -105);
    this.combo = 0;
    this.comboTimer = 0;
    return true;
  }
}
