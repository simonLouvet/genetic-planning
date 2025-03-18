/**
 * Models for the genetic planning algorithm
 */

// Represents a trainer who can conduct training sessions
class Trainer {
  constructor(id, name, availableDays) {
    this.id = id;
    this.name = name;
    this.availableDays = availableDays; // Array of day indices (0-4) when the trainer is available
  }
}

// Represents a room where training can take place
class Room {
  constructor(id, name, capacity, availableDays) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.availableDays = availableDays; // Array of day indices (0-4) when the room is available
  }
}

// Represents a training course that needs to be scheduled
class Training {
  constructor(id, title, requiredOccurrences, possibleTrainers, possibleRooms, duration = 1) {
    this.id = id;
    this.title = title;
    this.requiredOccurrences = requiredOccurrences; // How many times this training should be scheduled
    this.possibleTrainers = possibleTrainers; // Array of trainer IDs who can conduct this training
    this.possibleRooms = possibleRooms; // Array of room IDs where this training can take place
    this.duration = duration; // Duration in time slots (default: 1)
  }
}

// Represents a scheduled training session
class ScheduledTraining {
  constructor(trainingId, trainerId, roomId, day, timeSlot, sessionId) {
    this.trainingId = trainingId;
    this.trainerId = trainerId;
    this.roomId = roomId;
    this.day = day; // 0-4 (Monday to Friday)
    this.timeSlot = timeSlot; // 0-7 (8 time slots per day, e.g., 9-10, 10-11, etc.)
    this.sessionId = sessionId;
  }
}

// Constants for the planning
const DAYS = 5; // 5 days event
const TIME_SLOTS_PER_DAY = 8; // 8 time slots per day

module.exports = {
  Trainer,
  Room,
  Training,
  ScheduledTraining,
  DAYS,
  TIME_SLOTS_PER_DAY
}; 