const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'gameContainer',
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 300 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

const game = new Phaser.Game(config);

let player, platforms, cursors, spacebar, stars, spikes;
let scoreText, levelText, gameOver = false;
let gameOverText, restartButton;
let score;
let level;

function preload() {
  this.load.image('background', 'images/background.png');
  this.load.image('platform', 'images/platform.png');
  this.load.image('star', 'images/star.png');
  this.load.image('spike', 'images/spike.png');
  this.load.spritesheet('player', 'images/player.png', {
      frameWidth: 32,
      frameHeight: 48
  });
}

function create() {
  score = 0;
  level = 1;
  gameOver = false;

  this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(800, 600);

  cursors = this.input.keyboard.createCursorKeys();
  spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
  });
  this.anims.create({
      key: 'turn',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 20
  });
  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
  });

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#ffffff' });
  levelText = this.add.text(16, 40, 'Level: 1', { fontSize: '20px', fill: '#ffffff' });

  spawnPlatforms.call(this);
  spawnStars.call(this);
  spawnSpikes.call(this);
}

function update() {
  if (gameOver) return;

  if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play('left', true);
  } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play('right', true);
  } else {
      player.setVelocityX(0);
      player.anims.play('turn');
  }

  if (spacebar.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0) {
      if (level < 3) {
          level++;
          levelText.setText('Level: ' + level);
          showLevelMessage.call(this, 'Level Complete!', () => {
              spawnPlatforms.call(this);
              spawnStars.call(this);
              spawnSpikes.call(this);
              player.setPosition(100, 450);
              player.setVelocity(0);
          });
      } else {
          showLevelMessage.call(this, 'YOU WIN! Refresh to Restart');
          gameOver = true;
      }
  }
}

function hitSpike(player, spike) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');
  gameOver = true;

  gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '40px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
  }).setOrigin(0.5);

  restartButton = this.add.text(400, 320, 'RESTART', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#00aa00',
      padding: { x: 15, y: 10 }
  }).setOrigin(0.5).setInteractive();

  restartButton.on('pointerdown', () => {
      this.scene.restart();
  });
}

function spawnPlatforms() {
  if (platforms) platforms.clear(true, true);
  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, 'platform').setScale(2).refreshBody();

  let positions = [];

  while (positions.length < 3) {
      let x = Phaser.Math.Between(100, 700);
      let y = Phaser.Math.Between(150, 500);
      let overlap = positions.some(pos => Math.abs(pos.x - x) < 100 && Math.abs(pos.y - y) < 50);
      if (!overlap) {
          platforms.create(x, y, 'platform');
          positions.push({ x, y });
      }
  }

  this.physics.add.collider(player, platforms);
  if (stars) this.physics.add.collider(stars, platforms);
  if (spikes) this.physics.add.collider(spikes, platforms);
}

function spawnStars() {
  if (stars) stars.clear(true, true);

  stars = this.physics.add.group({
      key: 'star',
      repeat: 5 + level * 2,
      setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (star) {
      star.setBounce(0.6);
      star.setCollideWorldBounds(true);
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
}

function spawnSpikes() {
  if (spikes) spikes.clear(true, true);
  spikes = this.physics.add.group();

  const spikeCount = 2 + level;
  const protectedZones = [{ x: 0, width: 200 }];

  platforms.getChildren().forEach(p => {
      protectedZones.push({ x: p.x - 40, width: 80 });
  });

  const placed = [];

  for (let i = 0; i < spikeCount; i++) {
      let x, y, attempts = 0;
      let overlaps = false;

      do {
          x = Phaser.Math.Between(50, 750);
          y = Phaser.Math.Between(100, 550);
          attempts++;

          overlaps = protectedZones.some(zone => Math.abs(x - zone.x) < zone.width / 2) ||
                     placed.some(pos => Math.abs(x - pos.x) < 60 && Math.abs(y - pos.y) < 50);
      } while (overlaps && attempts < 20);

      const spike = spikes.create(x, y, 'spike');
      spike.setScale(0.2);
      spike.setSize(spike.width * 0.2, spike.height * 0.2);
      spike.setOrigin(0.5, 1);
      placed.push({ x, y });
  }

  this.physics.add.collider(spikes, platforms);
  this.physics.add.overlap(player, spikes, hitSpike, null, this);
}

function showLevelMessage(message, callback) {
  const banner = this.add.text(400, 300, message, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
  }).setOrigin(0.5);

  this.physics.pause();
  gameOver = true;

  this.time.delayedCall(2000, () => {
      banner.destroy();
      this.physics.resume();
      gameOver = false;
      if (callback) callback();
  });
}
