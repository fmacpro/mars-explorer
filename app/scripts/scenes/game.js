let level = { 
  w: 10000, 
  h: 10000, 
  background: {} 
};

let grid = {  
  style: { lineStyle: { width: 4, color: 0xffffff, alpha: 0.2 } }, 
  devisions: 10, 
  lines: { h: [], v: [] },
  labels: [],
  sectors: []
};

let fonts = { title: { font: '20px Lucida Console', color: 'white', fontWeight: 'bold' }, 
  p: { font: '18px Lucida Console', color: 'white', fontWeight: 'bold' }, 
  pgreen: { font: '18px Lucida Console', color: 'green', fontWeight: 'bold' }, 
  pred: { font: '18px Lucida Console', color: 'red', fontWeight: 'bold' }
};
          
let scores = { 
  pepsi: 0, 
  harddrives: 0, 
  cpus: 0, 
  copper: 0, 
  ram: 0
};

let objects = { 
  lander: { 
    base: { 
      x: 1500, 
      y: 1400 
    }, 
    cover: {}, 
    collector: {} 
  }, 
  resources: [], 
  radar: { 
    dish: {}, 
    base: {} 
  }, 
  rocks: [],
  artifacts: []
};

let text = {
  sectors: ['SECTOR A','SECTOR B','SECTOR C','SECTOR D','SECTOR E','SECTOR F','SECTOR G','SECTOR H','SECTOR I','SECTOR J'],
  radar: { 
    resources: [], 
    power: {} 
  },
  resources: {}, 
  mission: { 
    description: [] 
  } 
};

let currentSpeed = 0, player, rocksCount = 0, rocksLeavingCount = 0;

export default class Game extends Phaser.Scene {
  /**
   *  A sample Game scene, displaying the Phaser logo.
   *
   *  @extends Phaser.Scene
   */
  constructor() {
    super({key: 'Game'});
  }

  /**
   *  Called when a scene is initialized. Method responsible for setting up
   *  the game objects of the scene.
   *
   *  @protected
   *  @param {object} data Initialization parameters.
   */
  create(/* data */) {
    
    // Load Shapes.
    let shapes = this.cache.json.get('shapes');
    
    // Scale the game for full screen.
    window.addEventListener('resize', resize);
    resize();
    
    // Set camera.
    this.cameras.main.zoom = 0.5;
    var minimap = this.cameras.add(580, 430, 200, 150);
    minimap.zoom = 0.05;
    minimap.visible = false;

    // Set level bounds.
    this.matter.world.setBounds(0, 0, level.w, level.h);

    //  Set level background.
    level.background = this.add.tileSprite(0, 0, level.w, level.h, 'earth');
    level.background.setOrigin(0, 0);
    
    // Set grid style.
    grid.style = this.add.graphics( grid.style );
    
    // Plot grid lines.
    for (let i = 0; i < grid.devisions; i++) {
      // Horizontal grid lines
      grid.lines.h[i] = new Phaser.Geom.Line(i * (level.w / grid.devisions), 0, i * (level.w / grid.devisions), level.w);
      // Vertical grid lines
      grid.lines.v[i] = new Phaser.Geom.Line(0, i * (level.h / grid.devisions), level.h, i * (level.h / grid.devisions));
    }
    
    // Plot sector coordinates and labels
    let gn = 0;
    
    for (let i = 0; i < grid.devisions; i++) {
      
      for (let ii = 0; ii < grid.devisions; ii++) {
        
        grid.sectors[gn] = {};
        grid.sectors[gn].x = ii * (level.w / grid.devisions);
        grid.sectors[gn].y = i * (level.w / grid.devisions);
        grid.sectors[gn].label = text.sectors[ii] + (i + 1);
        
        grid.labels[gn] = this.add.text(grid.sectors[gn].x + 20, grid.sectors[gn].y + 20, grid.sectors[gn].label, fonts.p);
        grid.labels[gn].setAlpha(0.4);
        grid.labels[gn].visible = false;
        
        gn ++;
      }
    
    }
    
    // Lander
    objects.lander.base = this.matter.add.sprite( objects.lander.base.x , objects.lander.base.y , 'sheet', 'base.png', {shape: shapes.base});
    objects.lander.base.angle = 90;
    objects.lander.collector = this.matter.add.sprite(objects.lander.base.x, objects.lander.base.y - 58, 'sheet', 'collectorbase.png', {shape: shapes.collectorbase});
    objects.lander.collector.angle = 180;
    objects.lander.cover = this.matter.add.sprite(objects.lander.base.x, objects.lander.base.y + 107, 'sheet', 'top.png', {shape: shapes.top});   
    objects.lander.cover.depth = 1000;
    
    // Radar Station
    objects.radar.base = this.matter.add.sprite(objects.lander.base.x + 1000, objects.lander.base.y + 1100, 'sheet', 'dishbase.png', {shape: shapes.dishbase});
    objects.radar.base.angle = 145; 
    objects.radar.base.depth = 1;
    
    objects.radar.tower = this.matter.add.sprite(objects.radar.base.x - 5, objects.radar.base.y + 2, 'sheet', 'dishtower.png', {shape: shapes.dishtower});
    objects.radar.base.depth = 2;
    
    objects.radar.dish = this.matter.add.sprite(objects.radar.tower.x, objects.radar.tower.y, 'sheet', 'dish.png', {shape: shapes.dish});
    objects.radar.dish.angle = 100; 
    objects.radar.dish.depth = 3;
    
    // Player
    player = this.matter.add.sprite(objects.lander.base.x + 100, objects.lander.base.y + 100, 'sheet', 'rover.png', {shape: shapes.rover});
    //player.angle = 90;
    player.setFrictionAir(0.5);
    player.depth = 2;
    player.mass = 100;
    
    // Cameras follow Player.
    this.cameras.main.startFollow(player);
    minimap.startFollow(player);
    
    let random = RandomNumber(0, 100, [22]);
    objects.artifacts[0] = this.matter.add.sprite( grid.sectors[random].x , grid.sectors[random].y , 'sheet', 'edm.png', {shape: shapes.edm});
    random = RandomNumber(0, 100, [22]);
    objects.artifacts[1] = this.matter.add.sprite( grid.sectors[random].x , grid.sectors[random].y , 'sheet', 'ufo.png', {shape: shapes.ufo});
    random = RandomNumber(0, 100, [22]);
    objects.artifacts[2] = this.matter.add.sprite( grid.sectors[random].x , grid.sectors[random].y , 'sheet', 'polar.png', {shape: shapes.polar});
    random = RandomNumber(0, 100, [22]);
    objects.artifacts[3] = this.matter.add.sprite( grid.sectors[random].x , grid.sectors[random].y , 'sheet', 'mars2.png', {shape: shapes.mars2});
    random = RandomNumber(0, 100, [22]);
    objects.artifacts[4] = this.matter.add.sprite( grid.sectors[random].x , grid.sectors[random].y , 'sheet', 'beagle2.png', {shape: shapes.beagle2});
    
    // Test resource
    objects.resources[0] = this.matter.add.sprite(1300, 1500, 'sheet', 'cpu.png', {shape: shapes.cpu});
    objects.resources[0].depth = 2;
    
    // Resources
    for (let i = 0; i < 100; i++) {
      
      let x = Phaser.Math.Between(100, level.w);
      let y = Phaser.Math.Between(100, level.h);
      let diceRole = Math.random();

      if (diceRole < 0.2) {
        objects.resources[i] = this.matter.add.sprite(x, y, 'sheet', 'pepsican.png', {shape: shapes.pepsican});
        objects.resources[i].angle = parseInt(diceRole * 360 + 180);
        objects.resources[i].depth = 2;
      }
      else if (diceRole < 0.4 && diceRole >= 0.2 ) {
        objects.resources[i] = this.matter.add.sprite(x, y, 'sheet', 'harddrive.png', {shape: shapes.harddrive});
        objects.resources[i].angle = parseInt(diceRole * 360 + 180);
        objects.resources[i].depth = 2;
      }
      else if (diceRole < 0.6 && diceRole >= 0.4 ) {
        objects.resources[i] = this.matter.add.sprite(x, y, 'sheet', 'cpu.png', {shape: shapes.cpu});
        objects.resources[i].angle = parseInt(diceRole * 360 + 180);
        objects.resources[i].depth = 2;
      }
      else if (diceRole < 0.8 && diceRole >= 0.6 ) {
        objects.resources[i] = this.matter.add.sprite(x, y, 'sheet', 'copper.png', {shape: shapes.copper});
        objects.resources[i].angle = parseInt(diceRole * 360 + 180);
        objects.resources[i].depth = 2;
      }
      else {
        objects.resources[i] = this.matter.add.sprite(x, y, 'sheet', 'ramstick.png', {shape: shapes.ramstick});
        objects.resources[i].angle = parseInt(diceRole * 360 + 180);
        objects.resources[i].depth = 2;
      }
    }
    
    // Set rocks around radar
    for (let i = 0; i < 9; i++) {
      
      let x = Phaser.Math.Between(objects.radar.base.x - 200, objects.radar.base.x + 200);
      let y = Phaser.Math.Between(objects.radar.base.y - 200, objects.radar.base.y + 200);
      let diceRole = Math.random();

      if (diceRole < 0.2) {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock1.png', {shape: shapes.rock1});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
      else if (diceRole < 0.4 && diceRole >= 0.2 ) {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock2.png', {shape: shapes.rock2});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
      else if (diceRole < 0.6 && diceRole >= 0.4 ) {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock3.png', {shape: shapes.rock3});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
      else if (diceRole < 0.8 && diceRole >= 0.6 ) {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock4.png', {shape: shapes.rock4});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
      else {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock5.png', {shape: shapes.rock5});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
    }
    
    // Set rocks
    for (let i = 10; i < 500; i++) {
      
      let x = Phaser.Math.Between(100, level.h);
      let y = Phaser.Math.Between(100, level.w);
      let diceRole = Math.random();

      if (diceRole < 0.2) {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock1.png', {shape: shapes.rock1});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
      else if (diceRole < 0.4 && diceRole >= 0.2 ) {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock2.png', {shape: shapes.rock2});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
      else if (diceRole < 0.6 && diceRole >= 0.4 ) {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock3.png', {shape: shapes.rock3});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
      else if (diceRole < 0.8 && diceRole >= 0.6 ) {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock4.png', {shape: shapes.rock4});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
      else {
        objects.rocks[i] = this.matter.add.sprite(x, y, 'sheet', 'rock5.png', {shape: shapes.rock5});
        objects.rocks[i].angle = parseInt(diceRole * 360 + 180);
        objects.rocks[i].depth = 2;
      }
    }
    //console.log(objects);
    //console.log(player);
    
    // Set Compass
    objects.compass = this.add.sprite(player.x - 450, player.y - 300, 'sheet', 'arrow.png', {shape: shapes.arrow});
    objects.compass.setDisplaySize(45, 94);
    objects.compass.depth = 1001;
    
    // Sidebar resources
    text.resources.title = this.add.text(0, 0, 'RESOURCES', fonts.title);
    text.resources.title.depth = 1001;
    text.resources.harddrives = this.add.text(0, 0, 'Disk Drives: 0', fonts.p);
    text.resources.harddrives.depth = 1001;
    text.resources.cpus = this.add.text(0, 0, 'CPUs: 0', fonts.p);
    text.resources.cpus.depth = 1001;
    text.resources.ram = this.add.text(0, 0, 'RAM: 0', fonts.p);
    text.resources.ram.depth = 1001;
    text.resources.copper = this.add.text(0, 0, 'Copper: 0', fonts.p);
    text.resources.copper.depth = 1001;
    text.resources.pepsi = this.add.text(0, 0, 'Aluminium: 0', fonts.p);
    text.resources.pepsi.depth = 1001;
    
    
    // Sidebar Objectives
    text.mission.title = this.add.text(0, 0, 'OBJECTIVES', fonts.title);
    text.mission.title.depth = 1001;
    text.mission.description[0] = this.add.text(0, 0, '- Repair Radar \nTower A1-01', fonts.p);
    text.mission.description[0].depth = 1001;
    
    // Collector text
    text.collector = this.add.text(objects.lander.base.x - 140, objects.lander.base.y + 20, 'Resource Collector', fonts.p);
    text.collector.depth = 1;
    
    // Lander text
    text.lander = this.add.text(objects.lander.base.x - 120, objects.lander.base.y + 470, 'Lander Entrance', fonts.p);
    text.lander.depth = 1;
    
    // Radar text
    text.radar.name = this.add.text(objects.radar.base.x + 50, objects.radar.base.y + 100, 'Radar Tower A1-01', fonts.p);
    text.radar.name.depth = 1001;
    text.radar.power.offline = this.add.text(text.radar.name.x, text.radar.name.y + 30, 'OFFLINE', fonts.pred);
    text.radar.power.offline.depth = 1001;
    text.radar.power.online = this.add.text(text.radar.name.x, text.radar.name.y + 30, 'ONLINE', fonts.pgreen);
    text.radar.power.online.depth = 1001;
    text.radar.power.online.visible = false;
    text.radar.repairs = this.add.text(text.radar.name.x, text.radar.name.y + 60, 'Repairs required:', fonts.p);
    text.radar.repairs.depth = 1001;
    text.radar.resources[0] = this.add.text(text.radar.name.x, text.radar.name.y + 90, '- Collect 2x Disk Drives, 1x CPU, 2x Copper', fonts.p);
    text.radar.resources[0].depth = 1001;
    text.radar.resources[1] = this.add.text(text.radar.name.x, text.radar.name.y + 120, '- Clear debris from solor collectors', fonts.p);
    text.radar.resources[1].depth = 1001;
    text.radar.resources[2] = this.add.text(text.radar.name.x, text.radar.name.y + 150, '- Activate repair', fonts.p);
    text.radar.resources[2].depth = 1001;
    text.radar.repairStatus = this.add.text(text.radar.name.x, text.radar.name.y + 210, 'REPAIR UNAVAILABLE', fonts.pred);
    text.radar.repairStatus.depth = 1001;
    
    text.radar.repairStatus2 = this.add.text(text.radar.name.x, text.radar.name.y + 210, 'REPAIR AVAILABLE', fonts.pgreen);
    text.radar.repairStatus2.depth = 1001;
    text.radar.repairStatus2.visible = false;
    text.radar.repairButton = this.add.text(text.radar.name.x, text.radar.name.y + 240, 'CLICK HERE TO ACTIVATE', fonts.p);
    text.radar.repairButton.depth = 1001;
    text.radar.repairButton.visible = false;
    text.radar.repairButton.setInteractive();
    text.radar.repairButton.on('pointerup', () => repairRadar());
    
    minimap.ignore([
      level.background,
      text.radar.name, 
      text.radar.power.offline, 
      text.radar.power.online, 
      text.radar.repairs, 
      text.radar.resources[0], 
      text.radar.resources[1], 
      text.radar.resources[2], 
      text.radar.repairStatus,
      text.radar.repairStatus2,
      text.radar.repairButton,
      text.resources.title,
      text.resources.harddrives,
      text.resources.cpus,
      text.resources.ram,
      text.resources.copper,
      text.resources.pepsi
    ]);
    
    let rocksInContact = [];
    let rocksInContactUnique = [];
    let rocksLeavingContact = [];
    let rocksLeavingContactUnique = [];
    
    // Collision Events
    
    this.matter.world.on('collisionstart', function (event) {
      for (var i = 0; i < event.pairs.length; i++) {
        
        var bodyA = getRootBody(event.pairs[i].bodyA);
        var bodyB = getRootBody(event.pairs[i].bodyB);
        
        //console.log(bodyB,bodyA);
        
        // Count rocks on dish base        
        if ( bodyA.label == 'dishbase' && ( bodyB.label == 'rock1' || bodyB.label == 'rock2' || bodyB.label == 'rock3' || bodyB.label == 'rock4' || bodyB.label == 'rock5') ) {
          rocksInContact.push(bodyB);
          rocksInContactUnique = rocksInContact.filter( onlyUnique );
          rocksCount = rocksInContactUnique.length;
        }
        
        // Collect resources
        if ( bodyB.label == 'cpu' && bodyA.label == 'collectorbase' ) {
          scores.cpus += 1;
          bodyB.gameObject.depth = 1;
          bodyB.destroy();
          text.resources.cpus.setText('CPUs: ' + scores.cpus);
        }
        else if ( bodyB.label == 'harddrive' && bodyA.label == 'collectorbase' ) {
          bodyB.gameObject.depth = 1;
          scores.harddrives += 1;
          bodyB.destroy();
          text.resources.harddrives.setText('Disk Drives: ' + scores.harddrives);
        }
        else if ( bodyB.label == 'copper' && bodyA.label == 'collectorbase' ) {
          bodyB.gameObject.depth = 1;
          scores.copper += 1;
          bodyB.destroy();
          text.resources.copper.setText('Copper: ' + scores.copper);
        }
        else if ( bodyB.label == 'ramstick' && bodyA.label == 'collectorbase' ) {
          bodyB.gameObject.depth = 1;
          scores.ram += 1;
          bodyB.destroy();
          text.resources.ram.setText('RAM: ' + scores.ram);
        }
        else if ( bodyB.label == 'pepsican' && bodyA.label == 'collectorbase' ) {
          bodyB.gameObject.depth = 1;
          scores.pepsi += 1;
          bodyB.destroy();
          text.resources.pepsi.setText('Aluminium: ' + scores.pepsi);
        }
        
        // hide lander roof when rover enteres
        if ( bodyA.label == 'top' && bodyB.label == 'rover' ) {
          objects.lander.cover.visible = false;
        }
          
      }
    }, this);
    
    this.matter.world.on('collisionend', function (event) {
      for (var i = 0; i < event.pairs.length; i++) {
        
        var bodyA = getRootBody(event.pairs[i].bodyA);
        var bodyB = getRootBody(event.pairs[i].bodyB);
        
        // Count rocks leaving dish base
        if ( bodyA.label == 'dishbase' && ( bodyB.label == 'rock1' || bodyB.label == 'rock2' || bodyB.label == 'rock3' || bodyB.label == 'rock4' || bodyB.label == 'rock5') ) {
          rocksLeavingContact.push(bodyB);
          rocksLeavingContactUnique = rocksLeavingContact.filter( onlyUnique );
          rocksLeavingCount = rocksLeavingContactUnique.length;
        }
        
        // show lander roof when rover leaves 
        if ( bodyA.label == 'top' && bodyB.label == 'rover' ) {
          objects.lander.cover.visible = true;
        }
        
      }
    }, this);

  }

  /**
   *  Called when a scene is updated. Updates to game logic, physics and game
   *  objects are handled here.
   *
   *  @protected
   *  @param {number} t Current internal clock time.
   *  @param {number} dt Time elapsed since last update.
   */
  update(/* t, dt */) {
    
    // Radar spins when active.
    if ( objects.radar.active ) {
      objects.radar.dish.angle += 2;
    }


    // When enough resources are collected to repair Radar add green tick to objective text.
    if ( scores.cpus >= 1 && scores.harddrives >= 2 && scores.copper >=2 ) {
      text.radar.resources[0].setText('- Collect 2x Disk Drives, 1x CPU, 2x Copper ✔️');
    }
    else {
      text.radar.resources[0].setText('- Collect 2x Disk Drives, 1x CPU, 2x Copper');
    }
    
    // When all debree has been cleared from Radar solar collectors add green tick to objective text.
    if ( rocksCount === rocksLeavingCount ) {
      text.radar.resources[1].setText('- Clear debris from solor collectors ✔️');
    }
    else {
      text.radar.resources[1].setText('- Clear debris from solor collectors');
    }
    
    // if both above objectives are met show Radar repair button.
    if ( scores.cpus >= 1 && scores.harddrives >= 2 && scores.copper >=2 && rocksCount === rocksLeavingCount ) {
      text.radar.repairStatus.destroy();
      text.radar.repairStatus2.visible = true;
      text.radar.repairButton.visible = true;
    }

    // Keyboard controls.
    let cursors = this.input.keyboard.createCursorKeys();
    
    if (cursors.left.isDown) {
      player.angle -= 1.5;
    }
    else if (cursors.right.isDown) {
      player.angle += 1.5;
    }

    if (cursors.up.isDown) {
      //  The speed we'll travel at.
      currentSpeed = 3;
    }
    
    if (cursors.down.isDown) {
      currentSpeed = currentSpeed - 0.1;
    }

    if (currentSpeed > 0) {
        
      let x = Math.cos(player.rotation + 1.5) * currentSpeed;
      let y = Math.sin(player.rotation + 1.5) * currentSpeed;
      
      player.setVelocity(x,y);
      
      //console.log(player.rotation);
       
    }
    
    // Update compass position
    objects.compass.setPosition(player.x - 1130, player.y - 560);
    
    // Update text item positions
    text.resources.title.setPosition(player.x + 1000, player.y - 620);
    text.resources.harddrives.setPosition(player.x + 1000, player.y - 580);
    text.resources.cpus.setPosition(player.x + 1000, player.y - 560);
    text.resources.ram.setPosition(player.x + 1000, player.y - 540);
    text.resources.copper.setPosition(player.x + 1000, player.y - 520);
    text.resources.pepsi.setPosition(player.x + 1000, player.y - 500);
    
    text.mission.title.setPosition(player.x + 1000, player.y - 450);
    text.mission.description[0].setPosition(player.x + 1000, player.y - 410);
    
    
    // Update Compass Angle
    // http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/
    // https://photonstorm.github.io/phaser3-docs/Phaser.Math.Angle.html
    // https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Sprite.html#setAngle__anchor
    let rad = Phaser.Math.Angle.Between(objects.lander.base.x, objects.lander.base.y, player.x, player.y);
    objects.compass.setAngle(Math.degrees(rad) - 260);

  }
}

// Resizes the game canvas to fit the browser window.
function resize() {
  let canvas = document.querySelector('canvas'), width = window.innerWidth, height = window.innerHeight;
  let wratio = width / height, ratio = canvas.width / canvas.height;
 
  if (wratio < ratio) {
    canvas.style.width = width + 'px';
    canvas.style.height = (width / ratio) + 'px';
  } else {
    canvas.style.width = (height * ratio) + 'px';
    canvas.style.height = height + 'px';
  }
}

// Returns the root physics body.
function getRootBody(body) {
  if (body.parent === body) {
    return body;
  }
  while (body.parent !== body) {
    body = body.parent;
  }
  return body;
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

// Gets unique array values.
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

// On repairing radar.
function repairRadar () {
  
  // Remove consumed resources.
  scores.harddrives -= 2; 
  scores.copper -= 2; 
  scores.cpus -= 1;
  text.resources.cpus.setText('CPUs: ' + scores.cpus);
  text.resources.harddrives.setText('Disk Drives: ' + scores.harddrives);
  text.resources.copper.setText('Copper: ' + scores.copper);
  
  // Set radar active.
  objects.radar.active = true;
  
  // Remove offline info text.
  text.radar.repairs.destroy();
  text.radar.resources[0].destroy();
  text.radar.resources[1].destroy();
  text.radar.resources[2].destroy();
  text.radar.repairStatus2.destroy();
  text.radar.repairButton.destroy();
  text.radar.power.offline.destroy();
  
  // Update mission text.
  text.mission.description[0].setText('- Repair Radar \nTower A1-01 ✔️');
  
  // Set online info text.
  text.radar.power.online.visible = true;
  
  //minimap.visible = true;
  
  // Set gridlines visible.
  for (let i = 0; i < grid.devisions; i++) {
    grid.style.strokeLineShape(grid.lines.h[i]);
    grid.style.strokeLineShape(grid.lines.v[i]);
  }
  
  // Set gridlables visible.
  for (let i = 0; i < grid.labels.length; i++) {
    grid.labels[i].visible = true;
  }
  
}

// min - integer
// max - integer
// exclusions - array of integers
//            - must contain unique integers between min & max
function RandomNumber(min, max, exclusions) {
  // As @Fabian pointed out, sorting is necessary 
  // We use concat to avoid mutating the original array
  // See: http://stackoverflow.com/questions/9592740/how-can-you-sort-an-array-without-mutating-the-original-array
  var exclusionsSorted = exclusions.concat().sort(function(a, b) {
    return a - b;
  });

  var logicalMax = max - exclusionsSorted.length;
  var randomNumber = Math.floor(Math.random() * (logicalMax - min + 1)) + min;

  for(var i = 0; i < exclusionsSorted.length; i++) {
    if (randomNumber >= exclusionsSorted[i]) {
      randomNumber++;
    }
  }

  return randomNumber;
}
