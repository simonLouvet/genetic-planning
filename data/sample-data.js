/**
 * Sample data for testing the genetic planning algorithm
 */

const { Trainer, Room, Training } = require('../src/models');

// Sample trainers
const trainers = [
  new Trainer(1, "Alice", [0, 1, 2, 3, 4]), // Available all days
  new Trainer(2, "Bob", [0, 1, 2]), // Available Monday to Wednesday
  new Trainer(3, "Charlie", [2, 3, 4]), // Available Wednesday to Friday
  new Trainer(4, "Diana", [1, 3, 4]), // Available Tuesday, Thursday, Friday
  new Trainer(5, "Evan", [0, 2, 4]), // Available Monday, Wednesday, Friday
];

// Sample rooms
const rooms = [
  new Room(1, "Room A", 20, [0, 1, 2, 3, 4]), // Available all days
  new Room(2, "Room B", 15, [0, 1, 2, 3]), // Available Monday to Thursday
  new Room(3, "Room C", 30, [1, 2, 3, 4]), // Available Tuesday to Friday
  new Room(4, "Room D", 25, [0, 2, 4]), // Available Monday, Wednesday, Friday
];

// Sample trainings
const trainings = [
  new Training(1, "Introduction to JavaScript", 10, [1, 2], [1, 2, 3], 2), // 3 occurrences, 2 time slots each
  new Training(2, "Advanced CSS", 8, [1, 3], [1, 3], 1), // 2 occurrences, 1 time slot each
  new Training(3, "Python Basics", 8, [2, 4], [2, 4], 2), // 2 occurrences, 2 time slots each
  new Training(4, "Data Science", 7, [3, 5], [3], 3), // 1 occurrence, 3 time slots
  new Training(5, "Web Security", 8, [1, 5], [1, 2, 4], 1), // 2 occurrences, 1 time slot each
  new Training(6, "UX Design", 6, [4], [1, 2, 3, 4], 2), // 1 occurrence, 2 time slots
  new Training(7, "DevOps", 10, [2, 3], [2, 3], 2), // 2 occurrences, 2 time slots each
];

module.exports = {
  trainers,
  rooms,
  trainings
}; 