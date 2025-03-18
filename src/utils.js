/**
 * Utility functions for the genetic scheduler
 */

const { rooms } = require("../data/sample-data");

/**
 * Detect conflicts in a schedule (same trainer or room at the same time)
 */
function detectConflicts(schedule, trainings = [], verbose = false) {
  const conflicts = [];
  // Check each pair of scheduled trainings for conflicts
  for (let i = 0; i < schedule.length; i++) {
    const schedule1 = schedule[i];
    const training1 = trainings.find(t => t.id === schedule1.trainingId);
    // Get training duration directly from the scheduled training
    const duration1 = training1.duration;



    for (let j = i + 1; j < schedule.length; j++) {
      const schedule2 = schedule[j];
      const training2 = trainings.find(t => t.id === schedule2.trainingId);
      // Get training duration directly from the scheduled training
      const duration2 = training2.duration;

      // Check if they occur on the same day
      if (schedule1.day === schedule2.day) {


        // Check if time slots overlap
        const training1End = schedule1.timeSlot + duration1;
        const training2End = schedule2.timeSlot + duration2;

        const timeOverlap = (
          (schedule1.timeSlot <= schedule2.timeSlot && schedule2.timeSlot < training1End) ||
          (schedule2.timeSlot <= schedule1.timeSlot && schedule1.timeSlot < training2End)
        );

        if (timeOverlap) {
          // Check if same trainer or same room
          if (schedule1.trainerId === schedule2.trainerId) {
            conflicts.push({ type: 'trainer', sessions: [schedule1, schedule2] });
          }

          if (schedule1.roomId === schedule2.roomId) {
            conflicts.push({ type: 'room', sessions: [schedule1, schedule2] });
          }
        }
      }
    }
  }

  return conflicts;
}

module.exports = {
  detectConflicts
}; 