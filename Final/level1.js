class Level1 extends Phaser.Scene {
  constructor() {
    super('Level1');
  }

  preload() {
    this.load.image('background', 'images/background.png');
    this.load.spritesheet('player', 'images/playerTrump.png', {
      frameWidth: 256,
      frameHeight: 512
    });
    this.load.image('bullet', 'images/bullet.png');
    this.load.audio('laser', 'audio/laser.mp3');
    this.load.audio('hit', 'audio/hit.mp3');
    this.load.audio('bgmusic', 'audio/bgmusic.mp3'); // ✅ preload background music
  }

  create() {
    const { width, height } = this.scale;

    this.background = this.add.image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);
    this.scale.on('resize', this.resize, this);

    this.isGameStarted = false;
    this.wordIndex = 0;

    this.words = [
      "Russia Russia Russia",
      "Maryland Man",
      "Going to take Social Security",
      "Constitutional Crisis"
    ];

    this.truths = [
      "The Russia collusion narrative was a heavily politicized narrative created by the left to try and undermine the office of the President of the United States. After several years and millions of taxpayer dollars wasted, all claims were proven to be outright lies.",
      "‘Maryland Man’ was an El Salvadorian gang member and part of a designated FTO, who had legal and lawful deportation orders. He was not denied due process — in fact, two federal judges signed the orders. Facts over feelings.",
      "No plan exists or has ever existed to eliminate Social Security; fear mongering distorts the truth and creates panic.",
      "The real constitution crisis is the UNELECTED judicial branch trying to overstep the power of the ELECTED Administrative branch the Constitution lays out clear separation of powers."
    ];

    this.titleText = this.add.text(width / 2, height * 0.12, 'SHOOT DOWN THE LIES', {
      fontSize: '48px',
      fontFamily: 'Black Ops One',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    const boxWidth = 540;
    const boxHeight = 300;

    this.instructionBox = this.add.graphics();
    this.instructionBox.fillStyle(0x000000, 0.7);
    this.instructionBox.fillRoundedRect(width / 2 - boxWidth / 2, height * 0.5 - boxHeight / 2, boxWidth, boxHeight, 20);
    this.instructionBox.lineStyle(3, 0xffd700, 1);
    this.instructionBox.strokeRoundedRect(width / 2 - boxWidth / 2, height * 0.5 - boxHeight / 2, boxWidth, boxHeight, 20);

    const missionBody =
      "[ CONTROLS ]\n" +
      "→ LEFT / RIGHT ARROW KEYS to move\n" +
      "⎵ SPACEBAR to shoot upward";

    this.instructionText = this.add.text(width / 2, height * 0.5, missionBody, {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      lineSpacing: 12,
      wordWrap: { width: 500 }
    }).setOrigin(0.5);

    this.mottoText = this.add.text(width / 2, height * 0.82, 'THE TRUTH MUST PREVAIL', {
      fontSize: '48px',
      fontFamily: 'Black Ops One',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.startButton = this.add.text(width / 2, height * 0.90, 'LEVEL 1', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#ff0000',
      fontFamily: 'Georgia, serif',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 3
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.startLevel());

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, runChildUpdate: true });
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    if (this.background) {
      this.background.setDisplaySize(width, height);
    }
  }

  startLevel() {
    this.isGameStarted = true;
    this.instructionText.destroy();
    this.instructionBox.destroy();
    this.startButton.destroy();
    this.titleText.destroy();
    this.mottoText.destroy();

    this.player = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 20, 'player');
    this.player.setOrigin(0.5, 1);
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.allowGravity = false;
    this.groundY = this.player.y;
    this.facing = 'idle';
    this.player.setDepth(1);

    this.anims.create({ key: 'walk-left', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'walk-right', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'idle', frames: [ { key: 'player', frame: 2 } ], frameRate: 1, repeat: -1 });

    this.player.anims.play('idle');
    this.spawnWord(this.words[this.wordIndex]);

    // ✅ Play background music when level starts
    this.bgmusic = this.sound.add('bgmusic', { loop: true, volume: 0.5 });
    this.bgmusic.play();
  }

  spawnWord(word) {
    if (this.wordContainer) this.wordContainer.destroy();

    this.wordContainer = this.add.container(0, 100);
    this.letters = [];

    const spacing = 40;
    const wordLetters = word.replace(/ /g, '').length;
    const totalWidth = spacing * wordLetters;
    let startX = Phaser.Math.Clamp(Phaser.Math.Between(0, this.scale.width - totalWidth), 20, this.scale.width - totalWidth - 20);
    this.wordContainer.x = startX;

    word.split('').forEach((c, i) => {
      if (c !== ' ') {
        const L = this.add.text(i * spacing, 0, c, {
          fontSize: '48px',
          fill: '#ff0000',
          fontFamily: 'Georgia, serif',
          stroke: '#000000',
          strokeThickness: 4
        }).setOrigin(0.5);
        this.wordContainer.add(L);
        this.letters.push(L);
      }
    });

    this.wordVX = Phaser.Math.Between(-100, 100);
    this.wordVY = Phaser.Math.Between(100, 150);
  }

  update() {
    if (!this.isGameStarted) return;

    const speed = 250;
    let moveLeft = this.cursors.left.isDown;
    let moveRight = this.cursors.right.isDown;
    if (moveLeft && moveRight) moveLeft = moveRight = false;

    this.player.setVelocityX(0);

    if (moveLeft) {
      this.player.setVelocityX(-speed);
      if (this.facing !== 'left') {
        this.player.anims.play('walk-left', true);
        this.facing = 'left';
      }
    } else if (moveRight) {
      this.player.setVelocityX(speed);
      if (this.facing !== 'right') {
        this.player.anims.play('walk-right', true);
        this.facing = 'right';
      }
    } else {
      if (this.facing !== 'idle') {
        this.player.anims.play('idle', true);
        this.facing = 'idle';
      }
    }

    this.player.y = this.groundY;

    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      this.fireBullet();
    }

    if (this.wordContainer) {
      this.wordContainer.x += this.wordVX / 60;
      this.wordContainer.y += this.wordVY / 60;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      this.letters.forEach(L => {
        if (L) {
          const lx = this.wordContainer.x + L.x;
          const ly = this.wordContainer.y + L.y;
          if (lx < minX) minX = lx;
          if (lx > maxX) maxX = lx;
          if (ly < minY) minY = ly;
          if (ly > maxY) maxY = ly;
        }
      });

      if (minX < 0 || maxX > this.scale.width) this.wordVX = -this.wordVX;
      if (minY < 0 || maxY > this.scale.height * 0.7) this.wordVY = -this.wordVY;
    }

    this.bullets.children.iterate(b => {
      if (!b.active) return;
      if (b.y < 0 || b.x < 0 || b.x > this.scale.width) {
        b.disableBody(true, true);
      } else {
        this.letters.forEach((L, i) => {
          if (L && Phaser.Geom.Intersects.RectangleToRectangle(b.getBounds(), L.getBounds())) {
            this.sound.play('hit');
            b.disableBody(true, true);
            this.createExplosion(L.x + this.wordContainer.x, L.y + this.wordContainer.y);
            L.destroy();
            this.letters[i] = null;
          }
        });
      }
    });

    this.letters = this.letters.filter(l => l);

    if (this.letters.length === 0 && this.wordContainer) {
      this.wordContainer.destroy();
      this.showLieTruthPopup(this.wordIndex);
      this.wordIndex++;
    }
  }

  fireBullet() {
    let b = this.bullets.get();
    if (!b) {
      b = this.physics.add.image(this.player.x, this.player.y - 50, 'bullet');
      this.bullets.add(b);
    } else {
      b.setTexture('bullet');
      b.setPosition(this.player.x, this.player.y - 50);
      b.setActive(true).setVisible(true);
      b.body.enable = true;
    }
    b.body.allowGravity = false;
    b.setScale(0.1);
    b.setAngle(270);
    b.setVelocity(0, -500);
    this.sound.play('laser');
  }

  createExplosion(x, y) {
    const c = this.add.circle(x, y, 20, 0xffff00);
    this.time.delayedCall(200, () => c.destroy());
  }

  showLieTruthPopup(index) {
    this.isGameStarted = false;
    const { width, height } = this.scale;

    const box = this.add.graphics();
    box.fillStyle(0x000000, 0.9);
    box.fillRoundedRect(width / 2 - 300, height / 2 - 200, 600, 300, 20);
    box.lineStyle(4, 0xff0000, 1);
    box.strokeRoundedRect(width / 2 - 300, height / 2 - 200, 600, 300, 20);

    const lieText = this.add.text(width / 2, height / 2 - 100, `❌ "${this.words[index]}"`, {
      fontSize: '24px',
      fill: '#ff4444',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: 540 }
    }).setOrigin(0.5);

    const truthText = this.add.text(width / 2, height / 2, `✅ ${this.truths[index]}`, {
      fontSize: '22px',
      fill: '#44ff44',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: 540 }
    }).setOrigin(0.5);

    const nextButton = this.add.text(width / 2, height / 2 + 110, 'FIGHT THE NEXT LIE', {
      fontSize: '24px',
      backgroundColor: '#ff0000',
      fill: '#ffffff',
      fontFamily: 'Georgia, serif',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 3
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      box.destroy();
      lieText.destroy();
      truthText.destroy();
      nextButton.destroy();

      if (this.wordIndex < this.words.length) {
        this.spawnWord(this.words[this.wordIndex]);
        this.isGameStarted = true;
      } else {
        this.showLevelCompleteScreen();
      }
    });
  }

  showLevelCompleteScreen() {
    this.isGameStarted = false;

    // ✅ Stop background music at end of level
    if (this.bgmusic && this.bgmusic.isPlaying) {
      this.bgmusic.stop();
    }

    this.levelCompleteText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'MISSION COMPLETE!', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.continueButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, 'CONTINUE', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#0000ff',
      fontFamily: 'Georgia, serif',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 4
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.scene.start('Level2'));
  }
}

window.Level1 = Level1;
