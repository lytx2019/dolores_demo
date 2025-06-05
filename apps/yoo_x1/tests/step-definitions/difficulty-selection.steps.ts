import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// Difficulty configuration interface
interface DifficultyConfig {
  难度名称: string;
  解锁条件: string;
  弹速系数: number;
  弹幕密度系数: number;
  符卡时长系数: number;
  是否默认解锁: string;
}

// Background step - difficulty configuration table
Given('系统已定义「难度配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfigs = dataTable.hashes();
  const configs: DifficultyConfig[] = rawConfigs.map(row => ({
    难度名称: row['难度名称'],
    解锁条件: row['解锁条件'],
    弹速系数: parseFloat(row['弹速系数']),
    弹幕密度系数: parseFloat(row['弹幕密度系数']),
    符卡时长系数: parseFloat(row['符卡时长系数']),
    是否默认解锁: row['是否默认解锁']
  }));
  
  this.gameState.difficultyConfigs = configs;
  
  // Initialize unlocked difficulties based on default unlock status
  this.gameState.unlockedDifficulties = configs
    .filter((config: DifficultyConfig) => config.是否默认解锁 === '是')
    .map((config: DifficultyConfig) => config.难度名称);
  
  console.log('Difficulty configurations loaded:', configs.length, 'difficulties');
  console.log('Default unlocked difficulties:', this.gameState.unlockedDifficulties);
});

// Successful entry to difficulty selection
Given('玩家已完成角色与机体选择', function (this: CustomWorld) {
  this.gameState.selectedCharacter = '博丽灵梦';
  this.gameState.selectedShipType = 'A型（针弹特化）';
  this.gameState.currentScreen = 'character_selection_complete';
  
  console.log('Player completed character and ship selection');
});

When('系统加载难度选择界面', function (this: CustomWorld) {
  this.gameState.currentScreen = 'difficulty_selection';
  this.gameState.selectedDifficulty = 'Normal'; // Default selection
  
  console.log('Loading difficulty selection screen');
});

Then('显示「难度配置表」中已解锁难度', function (this: CustomWorld) {
  expect(this.gameState.currentScreen).to.equal('difficulty_selection');
  expect(this.gameState.unlockedDifficulties).to.not.be.empty;
  
  const availableDifficulties = this.gameState.unlockedDifficulties;
  console.log('Available difficulties displayed:', availableDifficulties);
});

Then('光标默认选中 Normal 难度', function (this: CustomWorld) {
  expect(this.gameState.selectedDifficulty).to.equal('Normal');
  
  console.log('Cursor defaults to Normal difficulty');
});

// Difficulty unlock conditions
Given('玩家尚未通关 Hard 难度', function (this: CustomWorld) {
  this.gameState.clearedDifficulties = ['Easy', 'Normal'];
  // Hard is not in cleared difficulties, so Lunatic should not be unlocked
  
  console.log('Player has not cleared Hard difficulty yet');
});

When('玩家尝试选择 Lunatic 难度', function (this: CustomWorld) {
  const lunaticConfig = this.gameState.difficultyConfigs?.find(
    (config: DifficultyConfig) => config.难度名称 === 'Lunatic'
  );
  
  const isUnlocked = this.gameState.unlockedDifficulties?.includes('Lunatic');
  
  if (!isUnlocked) {
    this.gameState.lastError = '难度未解锁';
    this.gameState.selectedDifficulty = this.gameState.selectedDifficulty || 'Normal';
  } else {
    this.gameState.selectedDifficulty = 'Lunatic';
  }
  
  console.log('Player attempted to select Lunatic difficulty, unlocked:', isUnlocked);
});

Then('系统提示 {string}', function (this: CustomWorld, expectedMessage: string) {
  expect(this.gameState.lastError).to.equal(expectedMessage);
  
  console.log('System displayed message:', expectedMessage);
});

Then('保持难度选择界面', function (this: CustomWorld) {
  expect(this.gameState.currentScreen).to.equal('difficulty_selection');
  
  console.log('Remained on difficulty selection screen');
});

// Successful unlock and selection
Given('玩家已无 Continue 通关 Hard 难度', function (this: CustomWorld) {
  this.gameState.clearedDifficulties = ['Easy', 'Normal', 'Hard'];
  this.gameState.hardClearedWithoutContinue = true;
  
  // Unlock Lunatic difficulty
  if (!this.gameState.unlockedDifficulties?.includes('Lunatic')) {
    this.gameState.unlockedDifficulties?.push('Lunatic');
  }
  
  console.log('Player cleared Hard difficulty without Continue, Lunatic unlocked');
});

When('玩家选择 Lunatic 难度', function (this: CustomWorld) {
  const isUnlocked = this.gameState.unlockedDifficulties?.includes('Lunatic');
  
  if (isUnlocked) {
    this.gameState.selectedDifficulty = 'Lunatic';
    this.gameState.currentScreen = 'game_loading';
  }
  
  console.log('Player selected Lunatic difficulty');
});

Then('系统确认难度选择为 Lunatic', function (this: CustomWorld) {
  expect(this.gameState.selectedDifficulty).to.equal('Lunatic');
  
  console.log('System confirmed difficulty selection: Lunatic');
});

Then('进入游戏加载画面', function (this: CustomWorld) {
  expect(this.gameState.currentScreen).to.equal('game_loading');
  
  console.log('Entered game loading screen');
});

// Difficulty parameters application
Given('当前难度为 {string}', function (this: CustomWorld, difficulty: string) {
  this.gameState.selectedDifficulty = difficulty;
  
  console.log('Current difficulty set to:', difficulty);
});

When('游戏逻辑初始化', function (this: CustomWorld) {
  const currentDifficulty = this.gameState.selectedDifficulty;
  const difficultyConfig = this.gameState.difficultyConfigs?.find(
    (config: DifficultyConfig) => config.难度名称 === currentDifficulty
  );
  
  if (difficultyConfig) {
    this.gameState.gameParams = {
      bulletSpeedMultiplier: difficultyConfig.弹速系数,
      bulletDensityMultiplier: difficultyConfig.弹幕密度系数,
      spellCardDurationMultiplier: difficultyConfig.符卡时长系数
    };
  }
  
  console.log('Game logic initialized with difficulty:', currentDifficulty);
  console.log('Applied parameters:', this.gameState.gameParams);
});

Then('弹速全局系数应为 {float}', function (this: CustomWorld, expectedMultiplier: number) {
  expect(this.gameState.gameParams?.bulletSpeedMultiplier).to.equal(expectedMultiplier);
  
  console.log('Bullet speed multiplier verified:', expectedMultiplier);
});

Then('弹幕密度全局系数应为 {float}', function (this: CustomWorld, expectedMultiplier: number) {
  expect(this.gameState.gameParams?.bulletDensityMultiplier).to.equal(expectedMultiplier);
  
  console.log('Bullet density multiplier verified:', expectedMultiplier);
});

Then('符卡时长系数应为 {float}', function (this: CustomWorld, expectedMultiplier: number) {
  expect(this.gameState.gameParams?.spellCardDurationMultiplier).to.equal(expectedMultiplier);
  
  console.log('Spell card duration multiplier verified:', expectedMultiplier);
}); 