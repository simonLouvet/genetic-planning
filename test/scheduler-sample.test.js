/**
 * Tests for sample data and genetic scheduler integration
 * Verifies that the sample data can be used to generate a conflict-free schedule
 */

const GeneticScheduler = require('../src/genetic-scheduler');
const sampleData = require('../data/sample-data');
const { detectConflicts } = require('../src/utils');

describe('Sample Data Integration Test', () => {
  // Extract sample data
  const { trainers, rooms, trainings } = sampleData;
  
  test('sample data should be properly structured', () => {
    // Verify trainers structure
    expect(Array.isArray(trainers)).toBe(true);
    expect(trainers.length).toBeGreaterThan(0);
    trainers.forEach(trainer => {
      expect(trainer).toHaveProperty('id');
      expect(trainer).toHaveProperty('name');
    });
    
    // Verify rooms structure
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThan(0);
    rooms.forEach(room => {
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('capacity');
    });
    
    // Verify trainings structure
    expect(Array.isArray(trainings)).toBe(true);
    expect(trainings.length).toBeGreaterThan(0);
    trainings.forEach(training => {
      expect(training).toHaveProperty('id');
      expect(training).toHaveProperty('title');
      expect(training).toHaveProperty('duration');
      expect(training).toHaveProperty('requiredOccurrences');
    });
  });

  test('should be able to generate a conflict-free schedule with sample data', async () => {
    // Create the genetic scheduler with sample data
    const scheduler = new GeneticScheduler(trainers, rooms, trainings);
    
    // Run the genetic algorithm with the same parameters as in index.js
    const optimalScheduleResult = await scheduler.findOptimalSchedule({
      iterations: 500,
      size: 100,
      crossover: 0.5,
      mutation: 0.7,
      skip: 100, // Increased to reduce test output
      verbose: false // Set to false to reduce test output
    });

    const optimalSchedule = optimalScheduleResult.result;
    
    // Verify that a schedule was generated
    expect(optimalSchedule).toBeDefined();
    expect(Array.isArray(optimalSchedule)).toBe(true);
    
    // Check for conflicts in the schedule
    const conflicts = detectConflicts(optimalSchedule, trainings);
    
    // Log conflicts for debugging if they exist
    if (conflicts.length > 0) {
      console.log('Conflicts detected:', conflicts);
    }
    
    // Expect no conflicts
    expect(conflicts.length).toBe(0);
    
    // Verify that all required training occurrences are scheduled
    const totalRequiredOccurrences = trainings.reduce((sum, t) => sum + t.requiredOccurrences, 0);
    expect(optimalSchedule.length).toBe(totalRequiredOccurrences);
  }, 30000); // Increase timeout to 30 seconds as genetic algorithm may take time
}); 