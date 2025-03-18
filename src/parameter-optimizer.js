/**
 * Advanced parameter optimizer for genetic planning algorithm
 * Uses a two-phase approach to efficiently find optimal parameters
 */

const GeneticScheduler = require('./genetic-scheduler');
const sampleData = require('../data/sample-data');
const utils = require('./utils');

// Initial coarse-grained parameter search space
const PHASE_1_CONFIG = {
  iterations: [500],
  populationSize: [125],
  crossover: [0.5],
  mutation: [0.6, 0.7, 0.8, 0.9]
};

// Function to generate parameter combinations for phase 1
function generatePhase1Combinations() {
  const combinations = [];
  
  for (const iterations of PHASE_1_CONFIG.iterations) {
    for (const size of PHASE_1_CONFIG.populationSize) {
      for (const crossover of PHASE_1_CONFIG.crossover) {
        for (const mutation of PHASE_1_CONFIG.mutation) {
          combinations.push({
            iterations,
            size,
            crossover,
            mutation,
            skip: 1000, // Avoid logging during tests
          });
        }
      }
    }
  }
  
  return combinations;
}

// Run a single test with specific parameters
async function runTest(params) {
  const { trainers, rooms, trainings } = sampleData;
  const scheduler = new GeneticScheduler(trainers, rooms, trainings);
  
  const startTime = Date.now();
  const resultScheduler = await scheduler.findOptimalSchedule(params);
  const schedule = resultScheduler.result;
  const generations = resultScheduler.generations;
  const endTime = Date.now();
  
  const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds
  const conflicts = utils.detectConflicts(schedule, trainings, false);
  
  return {
    params,
    generations,
    conflicts: conflicts.length,
    time: elapsedTime,
    conflictsFree: conflicts.length === 0
  };
}

// Run tests with a set of parameter combinations
async function runTests(combinations, phase) {
  const results = [];
  let completedTests = 0;
  const totalTests = combinations.length;
  
  console.log(`\nPhase ${phase}: Testing ${totalTests} parameter combinations`);
  
  for (const params of combinations) {
    try {
      console.log(`Testing parameters: iterations=${params.iterations}, size=${params.size}, crossover=${params.crossover}, mutation=${params.mutation}`);
      const result = await runTest(params);
      results.push(result);
      
      completedTests++;
      console.log(`Test ${completedTests}/${totalTests} completed. Conflicts: ${result.conflicts}, Time: ${result.time.toFixed(2)}s`);
      
      // If we found a conflict-free solution, log it immediately
      if (result.conflictsFree) {
        console.log(`\nFound conflict-free solution with parameters: generations=${result.generations}, size=${params.size}, crossover=${params.crossover}, mutation=${params.mutation}, time=${result.time.toFixed(2)}s\n`);
      }
    } catch (error) {
      console.error(`Error testing parameters: iterations=${params.iterations}, size=${params.size}, crossover=${params.crossover}, mutation=${params.mutation}`);
      console.error(error);
    }
  }
  
  // Sort results by conflicts (ascending) and then by time (ascending)
  results.sort((a, b) => {
    if (a.conflicts !== b.conflicts) {
      return a.conflicts - b.conflicts;
    }
    return a.time - b.time;
  });
  
  return results;
}

// Main optimization function
async function optimizeParameters() {
  console.log('Advanced Parameter Optimization');
  console.log('==============================\n');
  
  // Phase 1: Coarse-grained search
  console.log('Starting Phase 1: Coarse-grained parameter search');
  const phase1Combinations = generatePhase1Combinations();
  console.log(`Phase 1 parameter combinations: ${phase1Combinations.length}`);
  
  const phase1Results = await runTests(phase1Combinations, 1);
  
  // Display phase 1 results
  console.log('\nPhase 1 Best Results:');
  console.log('=====================');

  let phase1ResultsTable = phase1Results.map(r => {
    return {
      iterations: r.params.iterations,
      size: r.params.size,
      crossover: r.params.crossover,
      mutation: r.params.mutation,
      conflicts: r.conflicts,
      time: r.time.toFixed(2)
    }
  });

  let phase1OnlyConflictFree = phase1ResultsTable.filter(r => r.conflicts === 0);

  phase1OnlyConflictFree.sort((a, b) => {
    return a.time - b.time;
  });
  
  console.table(phase1OnlyConflictFree);

  // Phase 2: Fine-tuning based on conflict-free results from Phase 1
  if (phase1OnlyConflictFree.length > 0) {
    console.log('\nStarting Phase 2: Reliability testing of conflict-free solutions');
    console.log('Each solution will be tested 10 times to verify consistency');
    
    const reliabilityResults = [];
    const tenBestResults = phase1OnlyConflictFree.slice(0, 10);
    
    for (const solution of tenBestResults) {
      console.log(`\nTesting reliability of: iterations=${solution.iterations}, size=${solution.size}, crossover=${solution.crossover}, mutation=${solution.mutation}`);
      
      const params = {
        iterations: solution.iterations,
        size: solution.size,
        crossover: solution.crossover,
        mutation: solution.mutation,
        skip: 1000
      };
      
      let successCount = 0;
      const testResults = [];
      
      for (let i = 0; i < 10; i++) {
        console.log(`  Run ${i + 1}/10...`);
        const result = await runTest(params);
        testResults.push(result);
        
        if (result.conflictsFree) {
          successCount++;
        }
      }
      
      // Calculate average time
      const avgTime = testResults.reduce((sum, result) => sum + result.time, 0) / testResults.length;
      const avgGenerations = testResults.reduce((sum, result) => sum + result.generations, 0) / testResults.length;


      reliabilityResults.push({
        params,
        successRate: (successCount / 10) * 100,
        avgTime,
        successCount,
        avgGenerations
      });
      
      console.log(`  Results: ${successCount}/10 runs were conflict-free (${(successCount / 10) * 100}%)`);
      console.log(`  Average execution time: ${avgTime.toFixed(2)}s`);
    }
    
    // Sort by success rate (descending) and then by average time (ascending)
    reliabilityResults.sort((a, b) => {
      if (b.successRate !== a.successRate) {
        return b.successRate - a.successRate;
      }
      return a.avgTime - b.avgTime;
    });
    
    console.log('\nPhase 2 Reliability Results:');
    console.log('============================');
    reliabilityResults.forEach((result, index) => {
      const { iterations, size, crossover, mutation } = result.params;
      console.log(`${index + 1}. iterations=${iterations}, size=${size}, crossover=${crossover}, mutation=${mutation}, success rate=${result.successRate.toFixed(1)}%, avg time=${result.avgTime.toFixed(2)}s`);
    });
    
    console.table(reliabilityResults.map(r => ({
      size: r.params.size,
      crossover: r.params.crossover,
      mutation: r.params.mutation,
      successRate: `${r.successRate.toFixed(1)}%`,
      avgTime: `${r.avgTime.toFixed(2)}s`,
      avgGenerations: `${r.avgGenerations.toFixed(2)}`
    })));
    
    // Identify the most reliable parameters
    if (reliabilityResults.length > 0 && reliabilityResults[0].successRate > 0) {
      const bestResult = reliabilityResults[0];
      console.log('\nRecommended Parameters:');
      console.log('======================');
      console.log(`iterations: ${bestResult.params.iterations}`);
      console.log(`population size: ${bestResult.params.size}`);
      console.log(`crossover rate: ${bestResult.params.crossover}`);
      console.log(`mutation rate: ${bestResult.params.mutation}`);
      console.log(`reliability: ${bestResult.successRate.toFixed(1)}%`);
      console.log(`average execution time: ${bestResult.avgTime.toFixed(2)}s`);
    } else {
      console.log('\nNone of the solutions proved reliable in repeated testing.');
    }
  } else {
    console.log('\nNo conflict-free solutions found in Phase 1. Consider expanding the parameter search space.');
  }
}

// Function to generate more focused parameter combinations for phase 2
function generatePhase2Combinations(bestResult) {
  const combinations = [];
  
  // Create ranges around the best parameters from Phase 1
  // Iterations: try slightly lower and higher values
  const iterationsRange = [
    Math.max(50, bestResult.iterations - 25),
    bestResult.iterations,
    bestResult.iterations + 25
  ];
  
  // Population size: try slightly lower and higher values
  const sizeRange = [
    Math.max(50, bestResult.size - 25),
    bestResult.size,
    bestResult.size + 25
  ];
  
  // Crossover: try more precise values around the best
  const crossoverRange = [
    Math.max(0.05, bestResult.crossover - 0.05),
    bestResult.crossover,
    Math.min(0.95, bestResult.crossover + 0.05)
  ];
  
  // Mutation: try more precise values around the best
  const mutationRange = [
    Math.max(0.05, bestResult.mutation - 0.05),
    bestResult.mutation,
    Math.min(0.95, bestResult.mutation + 0.05)
  ];
  
  // Generate all combinations
  for (const iterations of iterationsRange) {
    for (const size of sizeRange) {
      for (const crossover of crossoverRange) {
        for (const mutation of mutationRange) {
          combinations.push({
            iterations,
            size,
            crossover,
            mutation,
            skip: 1000 // Avoid logging during tests
          });
        }
      }
    }
  }
  
  return combinations;
}

// Run the optimization if this file is executed directly
if (require.main === module) {
  optimizeParameters().catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
  });
}

// Export the function for use in other modules
module.exports = { optimizeParameters }; 