import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// Dialogue mapping interface
interface DialogueMapping {
  关卡: string;
  自机: string;
  对手: string;
  对话脚本ID: string;
}

// Background step - dialogue mapping table
Given('系统已定义「对话映射表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawMappings = dataTable.hashes();
  const mappings: DialogueMapping[] = rawMappings.map(row => ({
    关卡: row['关卡'],
    自机: row['自机'],
    对手: row['对手'],
    对话脚本ID: row['对话脚本ID']
  }));
  
  this.gameState.dialogueMappings = mappings;
  
  console.log('Dialogue mappings loaded:', mappings.length, 'mappings');
});

// Stage dialogue presentation
Given('进入 Stage {int} 前', function (this: CustomWorld, stageNumber: number) {
  this.gameState.currentStage = `Stage ${stageNumber}`;
  this.gameState.gamePhase = 'stage_intro';
  
  console.log('Entering stage:', this.gameState.currentStage);
});

When('系统加载对话脚本', function (this: CustomWorld) {
  const currentStage = this.gameState.currentStage;
  const selectedCharacter = this.gameState.selectedCharacter || '博丽灵梦';
  
  // Find dialogue mapping for current stage and character
  const dialogueMapping = this.gameState.dialogueMappings?.find(
    (mapping: DialogueMapping) => 
      mapping.关卡 === currentStage && mapping.自机 === selectedCharacter
  );
  
  if (dialogueMapping) {
    this.gameState.currentDialogue = {
      scriptId: dialogueMapping.对话脚本ID,
      player: dialogueMapping.自机,
      opponent: dialogueMapping.对手,
      stage: dialogueMapping.关卡
    };
    this.gameState.currentScreen = 'dialogue';
  } else {
    // Use default mapping for the stage
    const defaultMapping = this.gameState.dialogueMappings?.find(
      (mapping: DialogueMapping) => mapping.关卡 === currentStage
    );
    
    if (defaultMapping) {
      this.gameState.currentDialogue = {
        scriptId: defaultMapping.对话脚本ID,
        player: defaultMapping.自机,
        opponent: defaultMapping.对手,
        stage: defaultMapping.关卡
      };
      this.gameState.currentScreen = 'dialogue';
    }
  }
  
  console.log('Dialogue script loaded:', this.gameState.currentDialogue?.scriptId);
});

Then('显示 {string} 与 {string} 的立绘', function (this: CustomWorld, playerCharacter: string, opponent: string) {
  expect(this.gameState.currentScreen).to.equal('dialogue');
  expect(this.gameState.currentDialogue?.player).to.equal(playerCharacter);
  expect(this.gameState.currentDialogue?.opponent).to.equal(opponent);
  
  // Simulate character portrait display
  this.gameState.displayedPortraits = [playerCharacter, opponent];
  
  console.log('Character portraits displayed:', playerCharacter, 'vs', opponent);
});

Then('播放对应文本框动画', function (this: CustomWorld) {
  expect(this.gameState.currentScreen).to.equal('dialogue');
  
  // Simulate text box animation
  this.gameState.textBoxAnimationPlaying = true;
  this.gameState.dialogueAnimationState = 'text_appearing';
  
  console.log('Text box animation started');
});

// Extra stage unlock conditions
Given('玩家以任意角色在 Normal 难度通关', function (this: CustomWorld) {
  this.gameState.completedStages = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5', 'Stage 6'];
  this.gameState.clearedDifficulties = ['Easy', 'Normal'];
  this.gameState.lastClearDifficulty = 'Normal';
  this.gameState.lastClearCharacter = this.gameState.selectedCharacter || '博丽灵梦';
  
  console.log('Player cleared game on Normal difficulty with character:', this.gameState.lastClearCharacter);
});

Given('无 Continue', function (this: CustomWorld) {
  this.gameState.usedContinue = false;
  this.gameState.normalClearedWithoutContinue = true;
  
  console.log('Player cleared without using Continue');
});

When('查看标题菜单', function (this: CustomWorld) {
  this.gameState.currentScreen = 'title_menu';
  
  // Check Extra unlock condition
  const extraUnlocked = this.gameState.normalClearedWithoutContinue && 
                        this.gameState.clearedDifficulties?.includes('Normal');
  
  if (extraUnlocked && !this.gameState.unlockedStages?.includes('Extra')) {
    this.gameState.unlockedStages = this.gameState.unlockedStages || [];
    this.gameState.unlockedStages.push('Extra');
  }
  
  console.log('Viewing title menu, Extra unlocked:', extraUnlocked);
});

Then('Extra 关卡选项应可选中', function (this: CustomWorld) {
  expect(this.gameState.currentScreen).to.equal('title_menu');
  expect(this.gameState.unlockedStages).to.include('Extra');
  
  console.log('Extra stage option is now selectable');
}); 