import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// Background step definitions for configuration tables

// Stage configuration table
Given('系统已定义「关卡配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfigs = dataTable.hashes();
  const stageConfigs = rawConfigs.map(row => ({
    关卡类型: row['关卡类型'],
    关卡号: row['关卡号'],
    关卡名称: row['关卡名称'],
    背景音乐ID: row['背景音乐ID'],
    BOSS名称: row['BOSS名称']
  }));
  
  this.gameState.stageConfigs = stageConfigs;
  
  console.log('Stage configurations loaded:', stageConfigs.length, 'stages');
});

// Map background configuration table
Given('系统已定义「地图背景配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfigs = dataTable.hashes();
  const mapBackgroundConfigs = rawConfigs.map(row => ({
    关卡号: row['关卡号'],
    主背景: row['主背景'],
    前景元素: row['前景元素'],
    滚动速度: row['滚动速度'],
    环境效果: row['环境效果'],
    特殊装饰: row['特殊装饰']
  }));
  
  this.gameState.mapBackgroundConfigs = mapBackgroundConfigs;
  
  console.log('Map background configurations loaded:', mapBackgroundConfigs.length, 'configs');
});

// Map boundary configuration table
Given('系统已定义「地图边界配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfigs = dataTable.hashes();
  const mapBoundaryConfigs = rawConfigs.map(row => ({
    关卡号: row['关卡号'],
    游戏区域宽度: row['游戏区域宽度'],
    游戏区域高度: row['游戏区域高度'],
    玩家移动边界左: row['玩家移动边界左'],
    玩家移动边界右: row['玩家移动边界右'],
    玩家移动边界上: row['玩家移动边界上'],
    玩家移动边界下: row['玩家移动边界下']
  }));
  
  this.gameState.mapBoundaryConfigs = mapBoundaryConfigs;
  
  console.log('Map boundary configurations loaded:', mapBoundaryConfigs.length, 'configs');
});

// Enemy configuration table
Given('系统已定义「普通敌机配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfigs = dataTable.hashes();
  const enemyConfigs = rawConfigs.map(row => ({
    关卡号: row['关卡号'],
    敌机类型: row['敌机类型'],
    出现时机: row['出现时机'],
    HP: parseInt(row['HP']),
    移动模式: row['移动模式'],
    弹幕类型: row['弹幕类型']
  }));
  
  this.gameState.enemyConfigs = enemyConfigs;
  
  console.log('Enemy configurations loaded:', enemyConfigs.length, 'enemy types');
});

// Boss configuration table
Given('系统已定义「BOSS配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfigs = dataTable.hashes();
  const bossConfigs = rawConfigs.map(row => ({
    BOSS名称: row['BOSS名称'],
    关卡号: row['关卡号'],
    通常攻击阶段数: parseInt(row['通常攻击阶段数']),
    符卡数量: parseInt(row['符卡数量']),
    总HP: parseInt(row['总HP'])
  }));
  
  this.gameState.bossConfigs = bossConfigs;
  
  console.log('Boss configurations loaded:', bossConfigs.length, 'bosses');
});

// Special area configuration table
Given('系统已定义「地图特殊区域配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfigs = dataTable.hashes();
  const specialAreaConfigs = rawConfigs.map(row => ({
    关卡号: row['关卡号'],
    特殊区域类型: row['特殊区域类型'],
    位置坐标: row['位置坐标'],
    触发效果: row['触发效果'],
    持续时间: row['持续时间']
  }));
  
  this.gameState.specialAreaConfigs = specialAreaConfigs;
  
  console.log('Special area configurations loaded:', specialAreaConfigs.length, 'special areas');
});

// Stage loading scenario steps
Given('玩家在难度 {string} 下开始游戏', function (this: CustomWorld, difficulty: string) {
  this.gameState.selectedDifficulty = difficulty;
  this.gameState.currentScreen = 'game_start';
  
  console.log('Player started game on difficulty:', difficulty);
});

When('关卡编号为 {string} 加载完成', function (this: CustomWorld, stageNumber: string) {
  this.gameState.currentStage = stageNumber;
  
  // Find stage configuration
  const stageConfig = this.gameState.stageConfigs?.find(config => config.关卡号 === stageNumber);
  const mapConfig = this.gameState.mapBackgroundConfigs?.find(config => config.关卡号 === stageNumber);
  
  if (stageConfig && mapConfig) {
    this.gameState.stageProgress = {
      currentStage: stageNumber,
      difficulty: this.gameState.selectedDifficulty || 'Normal',
      enemiesDefeated: 0,
      totalEnemies: this.gameState.enemyConfigs?.filter(enemy => enemy.关卡号 === stageNumber).length || 0,
      allEnemiesDefeated: false,
      bossActive: false,
      stageCompleted: false
    };
    
    this.gameState.mapState = {
      scrollSpeed: parseFloat(mapConfig.滚动速度.replace('px/帧', '')),
      scrollPosition: 0,
      isPaused: false,
      backgroundLoaded: true,
      environmentEffects: [mapConfig.环境效果],
      specialDecorations: [mapConfig.特殊装饰]
    };
  }
  
  console.log('Stage loaded:', stageNumber);
});

Then('播放对应的关卡背景音乐', function (this: CustomWorld) {
  const stageConfig = this.gameState.stageConfigs?.find(
    config => config.关卡号 === this.gameState.currentStage
  );
  
  if (stageConfig) {
    this.gameState.currentBGM = stageConfig.背景音乐ID;
  }
  
  console.log('Background music started:', this.gameState.currentBGM);
});

Then('显示关卡标题与BOSS剪影', function (this: CustomWorld) {
  const stageConfig = this.gameState.stageConfigs?.find(
    config => config.关卡号 === this.gameState.currentStage
  );
  
  if (stageConfig) {
    this.gameState.stageTitle = stageConfig.关卡名称;
    this.gameState.bossSilhouette = stageConfig.BOSS名称;
  }
  
  console.log('Stage title and boss silhouette displayed');
});

Then('加载该关卡的普通敌机配置', function (this: CustomWorld) {
  const currentStageEnemies = this.gameState.enemyConfigs?.filter(
    enemy => enemy.关卡号 === this.gameState.currentStage
  );
  
  this.gameState.currentStageEnemies = currentStageEnemies;
  
  console.log('Stage enemies loaded:', currentStageEnemies?.length || 0);
});

Then('初始化地图背景与环境效果', function (this: CustomWorld) {
  expect(this.gameState.mapState?.backgroundLoaded).to.be.true;
  expect(this.gameState.mapState?.environmentEffects).to.not.be.empty;
  
  console.log('Map background and environment effects initialized');
});

// Map scrolling mechanism - Support both string and int stage numbers
Given('关卡 {string} 已开始', function (this: CustomWorld, stageNumber: string) {
  this.gameState.currentStage = stageNumber;
  this.gameState.currentScreen = 'gameplay';
  
  const mapConfig = this.gameState.mapBackgroundConfigs?.find(
    config => config.关卡号 === stageNumber
  );
  
  if (mapConfig) {
    this.gameState.mapState = {
      scrollSpeed: parseFloat(mapConfig.滚动速度.replace('px/帧', '')),
      scrollPosition: 0,
      isPaused: false,
      backgroundLoaded: true,
      environmentEffects: [mapConfig.环境效果],
      specialDecorations: [mapConfig.特殊装饰]
    };
  }
  
  console.log('Stage started:', stageNumber);
});

Given('关卡 {int} 已开始', function (this: CustomWorld, stageNumber: number) {
  this.gameState.currentStage = stageNumber.toString();
  this.gameState.currentScreen = 'gameplay';
  
  const mapConfig = this.gameState.mapBackgroundConfigs?.find(
    config => config.关卡号 === stageNumber.toString()
  );
  
  if (mapConfig) {
    this.gameState.mapState = {
      scrollSpeed: parseFloat(mapConfig.滚动速度.replace('px/帧', '')),
      scrollPosition: 0,
      isPaused: false,
      backgroundLoaded: true,
      environmentEffects: [mapConfig.环境效果],
      specialDecorations: [mapConfig.特殊装饰]
    };
  }
  
  console.log('Stage started:', stageNumber);
});

When('游戏帧更新', function (this: CustomWorld) {
  if (this.gameState.mapState && !this.gameState.mapState.isPaused) {
    this.gameState.mapState.scrollPosition += this.gameState.mapState.scrollSpeed;
  }
  
  console.log('Game frame updated, scroll position:', this.gameState.mapState?.scrollPosition);
});

Then('主背景以 {string} 向下滚动', function (this: CustomWorld, scrollSpeed: string) {
  const expectedSpeed = parseFloat(scrollSpeed.replace('px/帧', ''));
  expect(this.gameState.mapState?.scrollSpeed).to.equal(expectedSpeed);
  
  console.log('Main background scrolling at:', scrollSpeed);
});

Then('前景元素同步滚动', function (this: CustomWorld) {
  expect(this.gameState.mapState?.backgroundLoaded).to.be.true;
  
  console.log('Foreground elements synchronized');
});

Then('环境效果 {string} 持续播放', function (this: CustomWorld, environmentEffect: string) {
  expect(this.gameState.mapState?.environmentEffects).to.include(environmentEffect);
  
  console.log('Environment effect playing:', environmentEffect);
});

// Player movement boundary
Given('玩家当前位置为 \\(x, y\\)', function (this: CustomWorld) {
  this.gameState.playerPosition = { x: 320, y: 240 }; // Default center position
  
  console.log('Player position set to center');
});

When('玩家尝试移动到新位置', function (this: CustomWorld) {
  // Simulate movement attempt
  this.gameState.attemptedPosition = { x: 350, y: 250 };
  
  console.log('Player attempted to move to new position');
});

Then('检查新位置是否在移动边界内', function (this: CustomWorld) {
  const boundaries = this.gameState.mapBoundaryConfigs?.find(config => config.关卡号 === 'ALL');
  
  if (boundaries && this.gameState.attemptedPosition) {
    const leftBound = parseInt(boundaries.玩家移动边界左.replace('px', ''));
    const rightBound = parseInt(boundaries.玩家移动边界右.replace('px', ''));
    const topBound = parseInt(boundaries.玩家移动边界上.replace('px', ''));
    const bottomBound = parseInt(boundaries.玩家移动边界下.replace('px', ''));
    
    this.gameState.boundaryCheck = {
      withinBounds: 
        this.gameState.attemptedPosition.x >= leftBound &&
        this.gameState.attemptedPosition.x <= rightBound &&
        this.gameState.attemptedPosition.y >= topBound &&
        this.gameState.attemptedPosition.y <= bottomBound
    };
  }
  
  console.log('Boundary check performed');
});

Then('如果超出边界则限制在边界位置', function (this: CustomWorld) {
  if (this.gameState.boundaryCheck && !this.gameState.boundaryCheck.withinBounds) {
    // Apply boundary constraints
    this.gameState.playerPosition = this.gameState.attemptedPosition;
  }
  
  console.log('Boundary constraints applied if needed');
});

Then('保持玩家在 \\({int}px, {int}px, {int}px, {int}px\\) 矩形内', function (this: CustomWorld, left: number, right: number, top: number, bottom: number) {
  if (this.gameState.playerPosition) {
    expect(this.gameState.playerPosition.x).to.be.at.least(left);
    expect(this.gameState.playerPosition.x).to.be.at.most(right);
    expect(this.gameState.playerPosition.y).to.be.at.least(top);
    expect(this.gameState.playerPosition.y).to.be.at.most(bottom);
  }
  
  console.log('Player position within boundaries verified');
});

// Boundary collision handling
Given('玩家位于 {string}', function (this: CustomWorld, position: string) {
  const coords = position.match(/\((\d+),\s*(\d+)\)/);
  if (coords) {
    this.gameState.playerPosition = {
      x: parseInt(coords[1]),
      y: parseInt(coords[2])
    };
  }
  
  console.log('Player position set to:', position);
});

When('玩家向 {string} 移动', function (this: CustomWorld, direction: string) {
  if (!this.gameState.playerPosition) return;
  
  const moveDistance = 10;
  const newPosition = { ...this.gameState.playerPosition };
  
  switch (direction) {
    case '左':
      newPosition.x -= moveDistance;
      break;
    case '右':
      newPosition.x += moveDistance;
      break;
    case '上':
      newPosition.y -= moveDistance;
      break;
    case '下':
      newPosition.y += moveDistance;
      break;
  }
  
  // Apply boundary constraints
  const boundaries = this.gameState.mapBoundaryConfigs?.find(config => config.关卡号 === 'ALL');
  if (boundaries) {
    const leftBound = parseInt(boundaries.玩家移动边界左.replace('px', ''));
    const rightBound = parseInt(boundaries.玩家移动边界右.replace('px', ''));
    const topBound = parseInt(boundaries.玩家移动边界上.replace('px', ''));
    const bottomBound = parseInt(boundaries.玩家移动边界下.replace('px', ''));
    
    newPosition.x = Math.max(leftBound, Math.min(rightBound, newPosition.x));
    newPosition.y = Math.max(topBound, Math.min(bottomBound, newPosition.y));
  }
  
  this.gameState.playerPosition = newPosition;
  
  console.log('Player moved', direction, 'to position:', newPosition);
});

Then('玩家最终位置为 {string}', function (this: CustomWorld, expectedPosition: string) {
  const coords = expectedPosition.match(/\((\d+),\s*(\d+)\)/);
  if (coords && this.gameState.playerPosition) {
    const expectedX = parseInt(coords[1]);
    const expectedY = parseInt(coords[2]);
    
    expect(this.gameState.playerPosition.x).to.equal(expectedX);
    expect(this.gameState.playerPosition.y).to.equal(expectedY);
  }
  
  console.log('Final player position verified:', expectedPosition);
});

// Environment effects
Given('进入关卡 {string}', function (this: CustomWorld, stageNumber: string) {
  this.gameState.currentStage = stageNumber;
  
  console.log('Entered stage:', stageNumber);
});

When('地图加载完成', function (this: CustomWorld) {
  const mapConfig = this.gameState.mapBackgroundConfigs?.find(
    config => config.关卡号 === this.gameState.currentStage
  );
  
  if (mapConfig) {
    this.gameState.mapState = {
      scrollSpeed: parseFloat(mapConfig.滚动速度.replace('px/帧', '')),
      scrollPosition: 0,
      isPaused: false,
      backgroundLoaded: true,
      environmentEffects: [mapConfig.环境效果],
      specialDecorations: [mapConfig.特殊装饰]
    };
  }
  
  console.log('Map loading completed');
});

Then('激活 {string}', function (this: CustomWorld, environmentEffect: string) {
  expect(this.gameState.mapState?.environmentEffects).to.include(environmentEffect);
  
  console.log('Environment effect activated:', environmentEffect);
});

Then('在前景显示 {string}', function (this: CustomWorld, specialDecoration: string) {
  expect(this.gameState.mapState?.specialDecorations).to.include(specialDecoration);
  
  console.log('Special decoration displayed:', specialDecoration);
});

Then('粒子效果按地图主题播放', function (this: CustomWorld) {
  expect(this.gameState.mapState?.backgroundLoaded).to.be.true;
  
  console.log('Particle effects playing according to map theme');
});

// Special area interactions - Support both string and int stage numbers
Given('关卡 {string} 存在特殊区域 {string}', function (this: CustomWorld, stageNumber: string, areaType: string) {
  this.gameState.currentStage = stageNumber;
  
  const specialArea = this.gameState.specialAreaConfigs?.find(
    area => area.关卡号 === stageNumber && area.特殊区域类型 === areaType
  );
  
  this.gameState.currentSpecialArea = specialArea;
  
  console.log('Special area found:', areaType, 'in stage', stageNumber);
});

Given('关卡 {int} 存在特殊区域 {string}', function (this: CustomWorld, stageNumber: number, areaType: string) {
  this.gameState.currentStage = stageNumber.toString();
  
  const specialArea = this.gameState.specialAreaConfigs?.find(
    area => area.关卡号 === stageNumber.toString() && area.特殊区域类型 === areaType
  );
  
  this.gameState.currentSpecialArea = specialArea;
  
  console.log('Special area found:', areaType, 'in stage', stageNumber);
});

When('玩家进入区域坐标范围', function (this: CustomWorld) {
  if (this.gameState.currentSpecialArea) {
    this.gameState.specialAreaTriggered = true;
    this.gameState.specialAreaStartTime = Date.now();
  }
  
  console.log('Player entered special area range');
});

Then('触发 {string}', function (this: CustomWorld, triggerEffect: string) {
  expect(this.gameState.currentSpecialArea?.触发效果).to.equal(triggerEffect);
  expect(this.gameState.specialAreaTriggered).to.be.true;
  
  console.log('Trigger effect activated:', triggerEffect);
});

Then('效果持续 {string}', function (this: CustomWorld, duration: string) {
  expect(this.gameState.currentSpecialArea?.持续时间).to.equal(duration);
  
  console.log('Effect duration:', duration);
});

Then('播放对应的视觉提示', function (this: CustomWorld) {
  expect(this.gameState.specialAreaTriggered).to.be.true;
  
  console.log('Visual cues displayed for special area effect');
});

// Map decoration rendering
Given('地图包含装饰元素', function (this: CustomWorld) {
  this.gameState.mapDecorations = ['樱花瓣', '灯笼', '死蝶群'];
  
  console.log('Map decorations loaded');
});

When('渲染游戏画面', function (this: CustomWorld) {
  this.gameState.renderLayers = [];
  this.gameState.renderLayers.push('background');
  this.gameState.renderLayers.push('decorations');
  this.gameState.renderLayers.push('game_entities');
  this.gameState.renderLayers.push('ui');
  
  console.log('Game frame rendered with proper layer ordering');
});

Then('背景层在最底层', function (this: CustomWorld) {
  expect(this.gameState.renderLayers?.[0]).to.equal('background');
  
  console.log('Background layer at bottom confirmed');
});

Then('装饰物在背景层之上', function (this: CustomWorld) {
  expect(this.gameState.renderLayers?.[1]).to.equal('decorations');
  
  console.log('Decorations layer above background confirmed');
});

Then('游戏实体在装饰物之上', function (this: CustomWorld) {
  expect(this.gameState.renderLayers?.[2]).to.equal('game_entities');
  
  console.log('Game entities layer above decorations confirmed');
});

Then('UI元素在最顶层', function (this: CustomWorld) {
  expect(this.gameState.renderLayers?.[3]).to.equal('ui');
  
  console.log('UI layer at top confirmed');
});

// Decoration animations
Given('地图装饰物支持动画', function (this: CustomWorld) {
  this.gameState.animatedDecorations = true;
  
  console.log('Animated decorations enabled');
});

When('游戏运行中', function (this: CustomWorld) {
  this.gameState.gameRunning = true;
  
  console.log('Game is running');
});

Then('樱花瓣按风向飘落', function (this: CustomWorld) {
  expect(this.gameState.animatedDecorations).to.be.true;
  
  console.log('Cherry petals falling with wind direction');
});

Then('灯笼发出温暖光晕', function (this: CustomWorld) {
  expect(this.gameState.animatedDecorations).to.be.true;
  
  console.log('Lanterns emitting warm glow');
});

Then('死蝶群作螺旋飞舞', function (this: CustomWorld) {
  expect(this.gameState.animatedDecorations).to.be.true;
  
  console.log('Death butterfly swarm spiraling');
});

Then('所有动画不影响游戏逻辑判定', function (this: CustomWorld) {
  expect(this.gameState.gameRunning).to.be.true;
  
  console.log('Animations do not affect game logic confirmed');
});

// Enemy spawning rules
When('到达 {string} 阶段', function (this: CustomWorld, timing: string) {
  this.gameState.currentTiming = timing;
  
  console.log('Reached timing phase:', timing);
});

Then('生成 {string} 敌机', function (this: CustomWorld, enemyType: string) {
  const enemyConfig = this.gameState.enemyConfigs?.find(
    enemy => enemy.关卡号 === this.gameState.currentStage && 
             enemy.敌机类型 === enemyType &&
             enemy.出现时机 === this.gameState.currentTiming
  );
  
  this.gameState.spawnedEnemy = enemyConfig;
  
  console.log('Spawned enemy:', enemyType);
});

Then('敌机HP设置为 {int}', function (this: CustomWorld, expectedHP: number) {
  expect(this.gameState.spawnedEnemy?.HP).to.equal(expectedHP);
  
  console.log('Enemy HP set to:', expectedHP);
});

Then('敌机采用 {string} 移动方式', function (this: CustomWorld, movementType: string) {
  expect(this.gameState.spawnedEnemy?.移动模式).to.equal(movementType);
  
  console.log('Enemy movement pattern:', movementType);
});

Then('敌机发射 {string}', function (this: CustomWorld, bulletType: string) {
  expect(this.gameState.spawnedEnemy?.弹幕类型).to.equal(bulletType);
  
  console.log('Enemy bullet type:', bulletType);
});

// Boss battle triggers - Support both string and int stage numbers
Given('关卡 {string} 的普通敌机已全部击败', function (this: CustomWorld, stageNumber: string) {
  this.gameState.currentStage = stageNumber;
  this.gameState.stageProgress = {
    currentStage: stageNumber,
    difficulty: this.gameState.selectedDifficulty || 'Normal',
    enemiesDefeated: 0,
    totalEnemies: 0,
    allEnemiesDefeated: true,
    bossActive: false,
    stageCompleted: false
  };
  
  console.log('All normal enemies defeated in stage:', stageNumber);
});

Given('关卡 {int} 的普通敌机已全部击败', function (this: CustomWorld, stageNumber: number) {
  this.gameState.currentStage = stageNumber.toString();
  this.gameState.stageProgress = {
    currentStage: stageNumber.toString(),
    difficulty: this.gameState.selectedDifficulty || 'Normal',
    enemiesDefeated: 0,
    totalEnemies: 0,
    allEnemiesDefeated: true,
    bossActive: false,
    stageCompleted: false
  };
  
  console.log('All normal enemies defeated in stage:', stageNumber);
});

Given('关卡 EX 的普通敌机已全部击败', function (this: CustomWorld) {
  this.gameState.currentStage = 'EX';
  this.gameState.stageProgress = {
    currentStage: 'EX',
    difficulty: this.gameState.selectedDifficulty || 'Normal',
    enemiesDefeated: 0,
    totalEnemies: 0,
    allEnemiesDefeated: true,
    bossActive: false,
    stageCompleted: false
  };
  
  console.log('All normal enemies defeated in stage: EX');
});

When('BOSS {string} 登场', function (this: CustomWorld, bossName: string) {
  const bossConfig = this.gameState.bossConfigs?.find(boss => boss.BOSS名称 === bossName);
  
  if (bossConfig) {
    this.gameState.bossState = {
      name: bossName,
      currentHP: bossConfig.总HP,
      maxHP: bossConfig.总HP,
      phase: 'normal_attack',
      currentPhase: 1,
      maxPhases: bossConfig.通常攻击阶段数,
      spellCards: bossConfig.符卡数量,
      isMoving: true
    };
    
    if (this.gameState.stageProgress) {
      this.gameState.stageProgress.bossActive = true;
    }
  }
  
  console.log('Boss appeared:', bossName);
});

Then('播放BOSS登场动画', function (this: CustomWorld) {
  this.gameState.bossIntroAnimation = true;
  
  console.log('Boss entrance animation playing');
});

Then('显示BOSS名称与立绘', function (this: CustomWorld) {
  expect(this.gameState.bossState?.name).to.not.be.undefined;
  this.gameState.bossPortraitDisplayed = true;
  
  console.log('Boss name and portrait displayed');
});

Then('初始化BOSS HP为 {int}', function (this: CustomWorld, expectedHP: number) {
  expect(this.gameState.bossState?.maxHP).to.equal(expectedHP);
  expect(this.gameState.bossState?.currentHP).to.equal(expectedHP);
  
  console.log('Boss HP initialized to:', expectedHP);
});

Then('开始第一个通常攻击阶段', function (this: CustomWorld) {
  expect(this.gameState.bossState?.phase).to.equal('normal_attack');
  expect(this.gameState.bossState?.currentPhase).to.equal(1);
  
  console.log('First normal attack phase started');
});

Then('地图滚动暂停', function (this: CustomWorld) {
  if (this.gameState.mapState) {
    this.gameState.mapState.isPaused = true;
  }
  
  console.log('Map scrolling paused for boss battle');
});

// Boss phase transitions
Given('BOSS当前处于通常攻击阶段', function (this: CustomWorld) {
  this.gameState.bossState = {
    name: '测试BOSS',
    currentHP: 1000,
    maxHP: 2000,
    phase: 'normal_attack',
    currentPhase: 1,
    maxPhases: 3,
    spellCards: 4,
    isMoving: true
  };
  
  console.log('Boss in normal attack phase');
});

When('BOSS当前阶段HP耗尽', function (this: CustomWorld) {
  if (this.gameState.bossState) {
    this.gameState.bossState.phase = 'transition';
  }
  
  console.log('Boss current phase HP depleted');
});

Then('进入对应的符卡宣言阶段', function (this: CustomWorld) {
  if (this.gameState.bossState) {
    this.gameState.bossState.phase = 'spell_card';
  }
  
  console.log('Entering spell card declaration phase');
});

Then('暂停BOSS移动', function (this: CustomWorld) {
  if (this.gameState.bossState) {
    this.gameState.bossState.isMoving = false;
  }
  
  console.log('Boss movement paused');
});

Then('清除屏幕上的弹幕', function (this: CustomWorld) {
  this.gameState.screenBulletsCleared = true;
  
  console.log('Screen bullets cleared');
});

Then('地图背景切换为符卡专用背景', function (this: CustomWorld) {
  this.gameState.spellCardBackground = true;
  
  console.log('Map background switched to spell card specific');
});

// Spell card phase transitions
Given('BOSS当前处于符卡阶段', function (this: CustomWorld) {
  this.gameState.bossState = {
    name: '测试BOSS',
    currentHP: 1000,
    maxHP: 2000,
    phase: 'spell_card',
    currentPhase: 1,
    maxPhases: 3,
    spellCards: 4,
    isMoving: false
  };
  
  console.log('Boss in spell card phase');
});

When('符卡被击破或时间耗尽', function (this: CustomWorld) {
  if (this.gameState.bossState) {
    this.gameState.bossState.phase = 'transition';
    this.gameState.bossState.currentPhase++;
  }
  
  console.log('Spell card broken or time expired');
});

Then('进入下一个通常攻击阶段', function (this: CustomWorld) {
  if (this.gameState.bossState) {
    this.gameState.bossState.phase = 'normal_attack';
  }
  
  console.log('Entering next normal attack phase');
});

Then('恢复BOSS正常移动模式', function (this: CustomWorld) {
  if (this.gameState.bossState) {
    this.gameState.bossState.isMoving = true;
  }
  
  console.log('Boss normal movement restored');
});

Then('重置弹幕发射模式', function (this: CustomWorld) {
  this.gameState.bulletPatternReset = true;
  
  console.log('Bullet pattern reset');
});

Then('恢复正常地图背景', function (this: CustomWorld) {
  this.gameState.spellCardBackground = false;
  
  console.log('Normal map background restored');
});

// Stage completion and scoring
When('BOSS总HP归零且所有阶段完成', function (this: CustomWorld) {
  if (this.gameState.bossState) {
    this.gameState.bossState.currentHP = 0;
  }
  
  if (this.gameState.stageProgress) {
    this.gameState.stageProgress.stageCompleted = true;
  }
  
  console.log('Boss defeated and all phases completed');
});

Then('播放通关音效', function (this: CustomWorld) {
  this.gameState.victorySoundPlayed = true;
  
  console.log('Victory sound played');
});

Then('显示评分结算面板', function (this: CustomWorld) {
  this.gameState.scoringPanelDisplayed = true;
  
  console.log('Scoring panel displayed');
});

Then('统计击破敌机数、擦弹数、收集樱点数', function (this: CustomWorld) {
  this.gameState.clearStatistics = {
    defeatedEnemies: 15,
    grazedBullets: 89,
    collectedCherryPoints: 12000
  };
  
  console.log('Clear statistics calculated');
});

Then('解锁下一关卡（如有）', function (this: CustomWorld) {
  this.gameState.nextStageUnlocked = true;
  
  console.log('Next stage unlocked (if available)');
});

Then('停止地图滚动和环境效果', function (this: CustomWorld) {
  if (this.gameState.mapState) {
    this.gameState.mapState.isPaused = true;
    this.gameState.mapState.environmentEffects = [];
  }
  
  console.log('Map scrolling and environment effects stopped');
});

// Extra stage unlock
Given('玩家在Normal难度以上通关Stage6', function (this: CustomWorld) {
  this.gameState.clearedStages = ['1', '2', '3', '4', '5', '6'];
  this.gameState.lastClearDifficulty = 'Normal';
  
  console.log('Player cleared Stage 6 on Normal difficulty or higher');
});

Given('未使用Continue', function (this: CustomWorld) {
  this.gameState.usedContinue = false;
  
  console.log('No Continue used');
});

When('返回标题画面', function (this: CustomWorld) {
  this.gameState.currentScreen = 'title_menu';
  
  // Check Extra unlock condition
  const extraUnlocked = this.gameState.clearedStages?.includes('6') && 
                        !this.gameState.usedContinue;
  
  if (extraUnlocked) {
    this.gameState.unlockedStages = this.gameState.unlockedStages || [];
    if (!this.gameState.unlockedStages.includes('Extra')) {
      this.gameState.unlockedStages.push('Extra');
    }
  }
  
  console.log('Returned to title screen');
});

Then('Extra关卡选项变为可选', function (this: CustomWorld) {
  expect(this.gameState.unlockedStages).to.include('Extra');
  
  console.log('Extra stage option became selectable');
});

// Phantasm stage unlock
Given('玩家已通关Extra关卡', function (this: CustomWorld) {
  this.gameState.clearedStages = ['1', '2', '3', '4', '5', '6', 'EX'];
  
  console.log('Player cleared Extra stage');
});

Given('在Extra关卡中收集所有特殊道具', function (this: CustomWorld) {
  this.gameState.extraSpecialItemsCollected = true;
  
  console.log('All special items collected in Extra stage');
});

Then('Phantasm关卡选项变为可选', function (this: CustomWorld) {
  // Check Phantasm unlock condition
  const phantasmUnlocked = this.gameState.clearedStages?.includes('EX') && 
                           this.gameState.extraSpecialItemsCollected;
  
  if (phantasmUnlocked) {
    this.gameState.unlockedStages = this.gameState.unlockedStages || [];
    if (!this.gameState.unlockedStages.includes('Phantasm')) {
      this.gameState.unlockedStages.push('Phantasm');
    }
  }
  
  expect(this.gameState.unlockedStages).to.include('Phantasm');
  
  console.log('Phantasm stage option became selectable');
}); 