/**
 * Main entry point for the genetic planning application
 */

const GeneticScheduler = require('./genetic-scheduler');
const ScheduleFormatter = require('./schedule-formatter');
const sampleData = require('../data/sample-data');
const utils = require('./utils');

async function main() {
  console.log('Genetic Planning Algorithm');
  console.log('=========================\n');
  
  // Extract sample data
  const { trainers, rooms, trainings } = sampleData;
  
  console.log(`Trainers: ${trainers.length}`);
  console.log(`Rooms: ${rooms.length}`);
  console.log(`Training courses: ${trainings.length}`);
  
  // Calculate total required occurrences
  const totalRequiredOccurrences = trainings.reduce((sum, t) => sum + t.requiredOccurrences, 0);
  console.log(`Total required training occurrences: ${totalRequiredOccurrences}\n`);
  
  // Create the genetic scheduler
  const scheduler = new GeneticScheduler(trainers, rooms, trainings);
  
  console.log('Starting genetic algorithm...\n');
  
  // Run the genetic algorithm
  const optimalScheduleResult = await scheduler.findOptimalSchedule({
    iterations: 500,    // Number of iterations (generations)
    size: 150,           // Population size
    crossover: 0.5,     // Crossover probability
    mutation: 0.7,       // Mutation probability
    skip: 10, // How many generations to skip before logging
    verbose: true
  });

  const optimalSchedule = optimalScheduleResult.result;
  const generations = optimalScheduleResult.generations;
  
  // Format and display the schedule
  const formatter = new ScheduleFormatter(trainers, rooms, trainings);
  const formattedSchedule = formatter.formatSchedule(optimalSchedule);
  
  console.log('\n' + formattedSchedule);

 // Check for conflicts in the schedule
 const conflicts = utils.detectConflicts(optimalSchedule, trainings, true);
 console.log(`Total conflicts: ${conflicts.length}`);
 
 if (conflicts.length > 0) {
   console.warn('\nWARNING: Conflicts detected in the schedule:');
   
   // Create a table for conflicts
   console.table(conflicts.map(conflict => {
    //  console.log(conflict);

     const trainerIds = conflict.sessions.reduce((acc, t) => acc.concat(t.trainerId), []);
     const trainerNames = trainerIds.map(id => trainers.find(t => t.id === id).name);

     const roomIds = conflict.sessions.reduce((acc, t) => acc.concat(t.roomId), []);
     const roomNames = roomIds.map(id => rooms.find(r => r.id === id).name);

     const trainingIds = conflict.sessions.reduce((acc, t) => acc.concat(t.trainingId), []);  
     const trainingTitles = trainingIds.map(id => {
       const training = trainings.find(t => t.id === id);
       return `${training.title} (${training.duration}h)`;
     });

     const timeSlots = conflict.sessions.reduce((acc, t) => acc.concat(t.day+' '+t.timeSlot), []);

     return {
       type: conflict.type,
       trainerNames,
       roomNames,
       trainingTitles,
       timeSlots,
     }
   }));
 } else {
   console.log('\nNo conflicts detected in the schedule.');
 }

}

// Run the main function
main().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
}); 