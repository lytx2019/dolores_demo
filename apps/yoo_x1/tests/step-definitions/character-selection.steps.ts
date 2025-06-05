import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';

// Game state simulation for testing
interface GameState {
  selectedCharacter?: string;
  selectedShipType?: string;
  currentScreen?: string;
  characterShipMappings?: any[];
}

let gameState: GameState = {};

// Background step - character and ship type mapping table
Given('系统已定义「角色机体映射表」:', function (dataTable: DataTable) {
  const mappings = dataTable.hashes();
  gameState.characterShipMappings = mappings;
  console.log('Character-Ship mappings loaded:', mappings.length, 'entries');
});

// Character and ship selection
When('玩家选择 {string} 并选择 {string}', async function (character: string, shipType: string) {
  // Simulate character selection
  const mapping = gameState.characterShipMappings?.find(
    m => m['角色'] === character && m['机体类型'] === shipType
  );
  
  if (!mapping) {
    throw new Error(`Invalid character-ship combination: ${character} - ${shipType}`);
  }
  
  gameState.selectedCharacter = character;
  gameState.selectedShipType = shipType;
  gameState.currentScreen = 'difficulty_selection';
  
  console.log(`Player selected: ${character} with ${shipType}`);
});

// Verify transition to difficulty selection
Then('游戏应切换至难度选择界面', function () {
  expect(gameState.currentScreen).to.equal('difficulty_selection');
});

// Verify player selection is recorded
Then('已记录玩家选择信息', function () {
  expect(gameState.selectedCharacter).to.not.be.undefined;
  expect(gameState.selectedShipType).to.not.be.undefined;
  
  console.log('Player selection recorded:', {
    character: gameState.selectedCharacter,
    shipType: gameState.selectedShipType
  });
});

// Return to title screen
When('玩家在角色选择界面按下"返回"', function () {
  gameState.currentScreen = 'title';
  gameState.selectedCharacter = undefined;
  gameState.selectedShipType = undefined;
});

Then('系统返回标题界面', function () {
  expect(gameState.currentScreen).to.equal('title');
  expect(gameState.selectedCharacter).to.be.undefined;
  expect(gameState.selectedShipType).to.be.undefined;
}); 