class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    this.load.image('flag', 'images/flag.jpg');
    this.load.audio('introMusic', 'audio/intro.mp3');
    this.load.audio('type', 'audio/type.wav');
  }

  create() {
    this.scene.start('TitleScene');
  }
}

class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    this.scale.on('resize', this.resize, this);
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#add8e6');

    const fontSize = Math.floor(height * 0.4);
    this.titleText = this.add.text(width / 2, height / 2, '47', {
      fontSize: `${fontSize}px`,
      fontFamily: 'Black Ops One',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 12,
      shadow: {
        offsetX: 10,
        offsetY: 15,
        color: '#000000',
        blur: 10,
        fill: true
      }
    }).setOrigin(0.5);

    this.createLoadButton();
  }

  createLoadButton() {
    const { width, height } = this.scale;
    const buttonY = height * 0.85;
    const buttonWidth = 280;
    const buttonHeight = 60;

    this.buttonShadow = this.add.graphics();
    this.buttonShadow.fillStyle(0x000000, 0.4);
    this.buttonShadow.fillRoundedRect(width / 2 - buttonWidth / 2 + 3, buttonY - buttonHeight / 2 + 3, buttonWidth, buttonHeight, 12);

    this.buttonBG = this.add.graphics();
    this.buttonBG.fillStyle(0xff0000, 1);
    this.buttonBG.fillRoundedRect(width / 2 - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 12);

    this.buttonText = this.add.text(width / 2, buttonY, 'LOAD GAME', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.buttonText.on('pointerdown', () => {
      this.scene.start('Boot');
    });
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    if (this.titleText) {
      this.titleText.setPosition(width / 2, height / 2);
    }

    if (this.buttonText) {
      const buttonY = height * 0.85;
      const buttonWidth = 280;
      const buttonHeight = 60;
      this.buttonText.setPosition(width / 2, buttonY);
      this.buttonShadow.clear();
      this.buttonBG.clear();
      this.buttonShadow.fillStyle(0x000000, 0.4);
      this.buttonShadow.fillRoundedRect(width / 2 - buttonWidth / 2 + 3, buttonY - buttonHeight / 2 + 3, buttonWidth, buttonHeight, 12);
      this.buttonBG.fillStyle(0xff0000, 1);
      this.buttonBG.fillRoundedRect(width / 2 - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 12);
    }
  }
}

class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
    this.disclaimerTextObject = null;
    this.introMusic = null;
  }

  create() {
    this.scale.on('resize', this.resize, this);
    this.cameras.main.setBackgroundColor('#000');
    this.showDisclaimer();
  }

  showDisclaimer() {
    const { width, height } = this.scale;

    const fullText =
      "⚠️ DISCLAIMER ⚠️\n\n" +
      "This is a work of political satire.\n\n" +
      "If you are easily offended or overly sensitive,\n" +
      "you may wish to turn back now.\n\n";

    let currentText = '';
    this.disclaimerTextObject = this.add.text(width / 2, height / 2 - 100, '', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Georgia, serif',
      align: 'center',
      lineSpacing: 10,
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    const typeSound = this.sound.add('type');
    let charIndex = 0;

    const typingEvent = this.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        const c = fullText[charIndex];
        currentText += c;
        this.disclaimerTextObject.setText(currentText);
        if (c !== ' ' && c !== '\n') {
          typeSound.play({ volume: 0.5 });
        }
        charIndex++;
        if (charIndex >= fullText.length) {
          typingEvent.remove();
          typeSound.stop();
          this.showDisclaimerButton();
        }
      },
      callbackScope: this
    });
  }

  showDisclaimerButton() {
    const { width, height } = this.scale;
    const buttonWidth = 300;
    const buttonHeight = 70;
    const buttonY = height / 2 + 100;

    const buttonShadow = this.add.graphics();
    buttonShadow.fillStyle(0x000000, 0.4);
    buttonShadow.fillRoundedRect(width / 2 - buttonWidth / 2 + 4, buttonY - buttonHeight / 2 + 4, buttonWidth, buttonHeight, 15);

    const buttonBG = this.add.graphics();
    buttonBG.fillStyle(0xff0000, 1);
    buttonBG.fillRoundedRect(width / 2 - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 15);

    const buttonText = this.add.text(width / 2, buttonY, 'CLICK TO BEGIN', {
      fontSize: '26px',
      fill: '#ffffff',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    buttonText.on('pointerdown', () => {
      buttonBG.destroy();
      buttonShadow.destroy();
      buttonText.destroy();
      this.disclaimerTextObject.destroy();
      this.showIntro();
    });
  }

  showIntro() {
    const { width, height } = this.scale;

    this.background = this.add.image(width / 2, height / 2, 'flag')
      .setDisplaySize(width, height)
      .setAlpha(0.3);

    this.introMusic = this.sound.add('introMusic', { loop: true, volume: 0.8 });
    this.introMusic.play();

    const story =
      "⚠️ URGENT MISSION BRIEF ⚠️\n\n" +
      "Freedom is under siege — not by tanks, but by ideology twisted into weapons.\n\n" +
      "The radical liberal elite, cloaked in virtue and censorship,\n" +
      "have hijacked media, infiltrated schools, and radicalized followers.\n\n" +
      "They call it 'progress' — but it looks like extremism and terrorism.\n" +
      "They rewrite history, cancel dissent, and incite violence in the name of inclusion.\n\n" +
      "But you were elected by the people to end this madness.\n" +
      "They chose you because you don't bow. You don't break.\n\n" +
      "You are 47 — forged in truth, fueled by freedom, and ready to dismantle this corruption and lunacy.\n\n" +
      "This isn't left vs. right — it's good vs evil.\n\n" +
      "America's last hope stands now. That hope is YOU.\n\n";

    const scrollText = this.add.text(width / 2, height, story, {
      fontSize: '30px',
      fontFamily: 'Georgia, serif',
      fill: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: scrollText,
      y: -scrollText.height,
      duration: 45000,
      ease: 'Linear'
    });

    this.showStartButton();
  }

  showStartButton() {
    const { width, height } = this.scale;
    const buttonWidth = 300;
    const buttonHeight = 70;
    const buttonY = height - 100;

    const buttonShadow = this.add.graphics();
    buttonShadow.fillStyle(0x000000, 0.4);
    buttonShadow.fillRoundedRect(width / 2 - buttonWidth / 2 + 4, buttonY - buttonHeight / 2 + 4, buttonWidth, buttonHeight, 20);

    const buttonBG = this.add.graphics();
    buttonBG.fillStyle(0xff0000, 1);
    buttonBG.fillRoundedRect(width / 2 - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 20);

    const buttonText = this.add.text(width / 2, buttonY, 'START MISSION', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    buttonText.on('pointerdown', () => {
      if (this.introMusic) this.introMusic.stop();
      this.scene.start('Level1');
    });
  }

  resize(gameSize) {
    const { width, height } = gameSize;
    if (this.background) {
      this.background.setDisplaySize(width, height);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [Preloader, TitleScene, Boot, Level1, Level2]
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  if (game && game.scale) {
    game.scale.resize(window.innerWidth, window.innerHeight);
  }
});
