/**
 * Tests for utility functions in utils.js
 */

const { detectConflicts } = require('../src/utils');

describe('detectConflicts', () => {
  // Mock training data
  const trainings = [
    { id: 1, duration: 2 },
    { id: 2, duration: 3 },
    { id: 3, duration: 1 }
  ];

  test('should return empty array when no conflicts exist', () => {
    const schedule = [
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 },
      { trainingId: 2, day: 2, timeSlot: 9, trainerId: 1, roomId: 1 },
      { trainingId: 3, day: 1, timeSlot: 13, trainerId: 1, roomId: 1 }
    ];
    
    const conflicts = detectConflicts(schedule, trainings);
    expect(conflicts).toEqual([]);
  });

  test('should detect trainer conflicts', () => {
    const schedule = [
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 },
      { trainingId: 2, day: 1, timeSlot: 10, trainerId: 1, roomId: 2 }
    ];
    
    const conflicts = detectConflicts(schedule, trainings);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('trainer');
    expect(conflicts[0].sessions).toEqual([
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 },
      { trainingId: 2, day: 1, timeSlot: 10, trainerId: 1, roomId: 2 }
    ]);
  });

  test('should detect room conflicts', () => {
    const schedule = [
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 },
      { trainingId: 2, day: 1, timeSlot: 10, trainerId: 2, roomId: 1 }
    ];
    
    const conflicts = detectConflicts(schedule, trainings);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('room');
  });

  test('should detect both trainer and room conflicts', () => {
    const schedule = [
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 },
      { trainingId: 2, day: 1, timeSlot: 10, trainerId: 1, roomId: 1 }
    ];
    
    const conflicts = detectConflicts(schedule, trainings);
    expect(conflicts.length).toBe(2);
    expect(conflicts[0].type).toBe('trainer');
    expect(conflicts[1].type).toBe('room');
  });

  test('should not detect conflicts on different days', () => {
    const schedule = [
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 },
      { trainingId: 2, day: 2, timeSlot: 9, trainerId: 1, roomId: 1 }
    ];
    
    const conflicts = detectConflicts(schedule, trainings);
    expect(conflicts).toEqual([]);
  });

  test('should not detect conflicts when time slots do not overlap', () => {
    const schedule = [
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 }, // 9-11 (duration 2)
      { trainingId: 3, day: 1, timeSlot: 11, trainerId: 1, roomId: 1 } // 11-12 (duration 1)
    ];
    
    const conflicts = detectConflicts(schedule, trainings);
    expect(conflicts).toEqual([]);
  });

  test('should detect conflicts when time slots overlap partially', () => {
    const schedule = [
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 }, // 9-11 (duration 2)
      { trainingId: 2, day: 1, timeSlot: 10, trainerId: 2, roomId: 1 } // 10-13 (duration 3)
    ];
    
    const conflicts = detectConflicts(schedule, trainings);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('room');
  });

  test('should handle empty schedule', () => {
    const conflicts = detectConflicts([], trainings);
    expect(conflicts).toEqual([]);
  });

  test('should handle schedule with only one training', () => {
    const schedule = [
      { trainingId: 1, day: 1, timeSlot: 9, trainerId: 1, roomId: 1 }
    ];
    
    const conflicts = detectConflicts(schedule, trainings);
    expect(conflicts).toEqual([]);
  });
}); 