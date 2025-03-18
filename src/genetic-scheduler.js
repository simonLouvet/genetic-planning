/**
 * Genetic algorithm implementation for training schedule optimization
 */

const Genetic = require('genetic-js');
const { ScheduledTraining, DAYS, TIME_SLOTS_PER_DAY } = require('./models');
const utils = require('./utils');


class GeneticScheduler {
  constructor(trainers, rooms, trainings) {
    this.trainers = trainers;
    this.rooms = rooms;
    this.trainings = trainings;
    this.genetic = Genetic.create();
    this.disqualifyTrainingsWithNoValidCombinations();
    this.setupGeneticAlgorithm();

  }

  disqualifyTrainingsWithNoValidCombinations(verbose = false) {
    // Create a new array to store valid trainings
    const validTrainings = [];

    this.trainings.forEach(training => {
      // Generate all possible combinations for this training
      const possibleCombinations = [];

      // For each possible trainer
      training.possibleTrainers.forEach(trainerId => {
        const trainer = this.trainers.find(t => t.id === trainerId);

        // For each possible room
        training.possibleRooms.forEach(roomId => {
          const room = this.rooms.find(r => r.id === roomId);

          // Find common available days
          const commonAvailableDays = trainer.availableDays.filter(day =>
            room.availableDays.includes(day) && day < DAYS
          );

          if (commonAvailableDays.length === 0) {
            // Skip this trainer-room combination if no common days
            return;
          }

          // For each common available day
          commonAvailableDays.forEach(day => {
            // For each possible time slot
            const maxStartSlot = TIME_SLOTS_PER_DAY - training.duration;
            if (maxStartSlot < 0) return; // Skip if training duration exceeds day length

            for (let timeSlot = 0; timeSlot <= maxStartSlot; timeSlot++) {
              possibleCombinations.push({
                trainerId,
                roomId,
                day,
                timeSlot
              });
            }
          });
        });
      });

      const isEnoughCombinations = possibleCombinations.length >= training.requiredOccurrences && possibleCombinations.length > 0;

      if (isEnoughCombinations) {
        if (verbose) {
          console.log(`Training '${training.title}' has ${possibleCombinations.length} valid combinations ok for ${training.requiredOccurrences} occurrences`);
        }
        // Add this training to the valid trainings list
        validTrainings.push(training);
      } else {
        if (verbose) {
          // If no valid combinations found, log error but don't add to valid trainings
          if (possibleCombinations.length === 0) {
            // Get trainer and room availability details
            const trainerAvailability = training.possibleTrainers.map(id => {
              const trainer = this.trainers.find(t => t.id === id);
              return `${trainer.name}: days ${trainer.availableDays.join(', ')}`;
            }).join('\n          ');

            const roomAvailability = training.possibleRooms.map(id => {
              const room = this.rooms.find(r => r.id === id);
              return `${room.name}: days ${room.availableDays.join(', ')}`;
            }).join('\n          ');

            const errorMessage = `No valid combinations found for training '${training.title}'
            possibleTrainers: ${training.possibleTrainers.map(id => this.trainers.find(t => t.id === id).name).join(', ')}
            possibleRooms: ${training.possibleRooms.map(id => this.rooms.find(r => r.id === id).name).join(', ')}
            
            Trainer availability:
            ${trainerAvailability}
            
            Room availability:
            ${roomAvailability}
            
            Training duration: ${training.duration} slots
            `;
            console.error(errorMessage);
          } else if (possibleCombinations.length < training.requiredOccurrences) {
            const errorMessage = `Not enough valid combinations found for training '${training.title}'
            possibleCombinations: ${possibleCombinations.length}
            requiredOccurrences: ${training.requiredOccurrences}`;
            console.error(errorMessage);
          }
        }
        console.warn(`Training '${training.title}' will be excluded from scheduling due to insufficient valid combinations.`);

      }
    });

    // Replace the original trainings array with only the valid trainings
    if (verbose) {
      console.log(`disqualified ${this.trainings.length - validTrainings.length} trainings out of ${this.trainings.length}`);
    }
    this.trainings = validTrainings;

  }


  /**
   * Setup the genetic algorithm with all required functions
   */
  setupGeneticAlgorithm() {
    // Define the genetic algorithm configuration
    this.genetic.optimize = Genetic.Optimize.Maximize;
    this.genetic.select1 = Genetic.Select1.Tournament2;
    this.genetic.select2 = Genetic.Select2.Tournament2;

    // Store data in userData to make it accessible in the genetic algorithm functions
    this.genetic.userData = {
      trainers: this.trainers,
      rooms: this.rooms,
      trainings: this.trainings,
      ScheduledTraining: ScheduledTraining,
      DAYS: DAYS,
      TIME_SLOTS_PER_DAY: TIME_SLOTS_PER_DAY,
      utils: utils
    };

    // Seed function - creates an initial random schedule
    this.genetic.seed = function () {
      const { trainers, rooms, trainings, TIME_SLOTS_PER_DAY, DAYS } = this.userData;
      const schedule = [];

      // For each training, schedule its required occurrences
      trainings.forEach(training => {
        // Generate all possible combinations for this training
        const possibleCombinations = [];

        // For each possible trainer
        training.possibleTrainers.forEach(trainerId => {
          const trainer = trainers.find(t => t.id === trainerId);

          // For each possible room
          training.possibleRooms.forEach(roomId => {
            const room = rooms.find(r => r.id === roomId);

            // Find common available days
            const commonAvailableDays = trainer.availableDays.filter(day =>
              room.availableDays.includes(day) && day < DAYS
            );

            if (commonAvailableDays.length === 0) {
              // Skip this trainer-room combination if no common days
              return;
            }

            // For each common available day
            commonAvailableDays.forEach(day => {
              // For each possible time slot
              const maxStartSlot = TIME_SLOTS_PER_DAY - training.duration;
              if (maxStartSlot < 0) return; // Skip if training duration exceeds day length

              for (let timeSlot = 0; timeSlot <= maxStartSlot; timeSlot++) {
                possibleCombinations.push({
                  trainerId,
                  roomId,
                  day,
                  timeSlot
                });
              }
            });
          });
        });

        // Schedule each required occurrence
        // We can safely assume there are enough combinations since we've filtered out invalid trainings
        let scheduledCount = 0;
        while (scheduledCount < training.requiredOccurrences) {
          // Randomly select a combination
          const combinationIndex = Math.floor(Math.random() * possibleCombinations.length);
          const combination = possibleCombinations[combinationIndex];

          // Create a unique session ID for this scheduled training
          const sessionId = `${training.id}-${scheduledCount}`;

          // Add the scheduled training to the schedule
          const scheduledTraining = new this.userData.ScheduledTraining(
            training.id,
            combination.trainerId,
            combination.roomId,
            combination.day,
            combination.timeSlot,
            sessionId
          );

          schedule.push(scheduledTraining);
          scheduledCount++;
        }
      });
      return schedule;
    };

    // Fitness function - evaluates how good a schedule is
    this.genetic.fitness = function (schedule) {
      // console.log('-- fitness');
      // Remove or comment out this console.log to avoid excessive logging
      // console.log('schedule 1', schedule);

      // Add a check to ensure schedule is an array
      if (!Array.isArray(schedule)) {
        console.error('Schedule is not an array:', schedule);
        return 0; // Return minimum fitness for invalid schedules
      }

      const { trainers, rooms, trainings, utils } = this.userData;
      let fitness = 0;

      // Detect conflicts using the utils function
      const conflicts = utils.detectConflicts(schedule, trainings);

      // console.log('conflicts', conflicts.length);

      // Base fitness: number of scheduled trainings
      fitness += schedule.length * 10;

      // console.log('fitness', fitness);

      // Penalty for conflicts
      fitness -= conflicts.length * 1000;

      // console.log('fitness', fitness);

      // Bonus for satisfying required occurrences
      let occurrencesSatisfaction = 0;
      trainings.forEach(training => {
        // Remove or comment out this console.log
        // console.log('schedule 2', schedule);

        // Make sure we're accessing properties correctly
        const scheduledCount = schedule.filter(s => s && s.trainingId === training.id).length;
        const satisfactionRatio = scheduledCount / training.requiredOccurrences;
        occurrencesSatisfaction += satisfactionRatio;
      });
      fitness += occurrencesSatisfaction * 20;

      // Bonus for trainer and room utilization
      const uniqueTrainers = new Set(schedule.map(s => s.trainerId));
      const uniqueRooms = new Set(schedule.map(s => s.roomId));

      // Calculate utilization percentages
      const trainerUtilization = uniqueTrainers.size / trainers.length;
      const roomUtilization = uniqueRooms.size / rooms.length;
      const utilizationScore = (trainerUtilization + roomUtilization) / 2;

      fitness += utilizationScore * 5;
      return fitness;

      // return Math.max(0, fitness); // Ensure fitness is not negative
    };

    // Crossover function - intelligently combines two parent schedules based on session IDs
    this.genetic.crossover = function (mother, father) {
      // console.log('-- crossover');

      // Group sessions by their sessionId
      const motherSessions = {};
      const fatherSessions = {};

      // Index mother sessions by sessionId
      mother.forEach(session => {
        motherSessions[session.sessionId] = session;
      });

      // Index father sessions by sessionId
      father.forEach(session => {
        fatherSessions[session.sessionId] = session;
      });

      // Collect all unique session IDs from both parents
      // Set is used to avoid duplicates
      const allSessionIds = new Set([
        ...Object.keys(motherSessions),
        ...Object.keys(fatherSessions)
      ]);

      // Create two children with different combinations
      const child1 = [];
      const child2 = [];

      // For each session ID, decide how to distribute between children
      allSessionIds.forEach(sessionId => {
        const motherSession = motherSessions[sessionId];
        const fatherSession = fatherSessions[sessionId];

        // Case 1: Session exists in both parents and is identical
        if (motherSession && fatherSession &&
          motherSession.trainerId === fatherSession.trainerId &&
          motherSession.roomId === fatherSession.roomId &&
          motherSession.day === fatherSession.day &&
          motherSession.timeSlot === fatherSession.timeSlot) {
          // Keep identical sessions in both children
          child1.push({ ...motherSession });
          child2.push({ ...motherSession });
        }
        // Case 2: Session exists in both parents but differs
        else if (motherSession && fatherSession) {
          // For child1: 50% chance to get from mother or father
          if (Math.random() < 0.5) {
            child1.push({ ...motherSession });
            child2.push({ ...fatherSession });
          } else {
            child1.push({ ...fatherSession });
            child2.push({ ...motherSession });
          }
        }
      });
      // console.log('children', [child1, child2]);

      return [child1, child2];
    };

    // Mutation function - randomly modifies a schedule
    this.genetic.mutate = function (schedule) {
      // console.log('-- mutate');
      // console.log('schedule', schedule);
      const { trainings, TIME_SLOTS_PER_DAY, DAYS } = this.userData;
      // Clone the schedule to avoid modifying the original
      const mutatedSchedule = [...schedule];

      // Randomly decide mutation type
      const mutationType = Math.random();

      if (mutationType < 0.33) {
        // Mutation type 1: Change a random training's time slot
        if (mutatedSchedule.length > 0) {
          const index = Math.floor(Math.random() * mutatedSchedule.length);
          const training = mutatedSchedule[index];
          const trainingObj = trainings.find(t => t.id === training.trainingId);

          // Generate a new random time slot
          const maxStartSlot = TIME_SLOTS_PER_DAY - trainingObj.duration;
          if (maxStartSlot >= 0) {
            training.timeSlot = Math.floor(Math.random() * (maxStartSlot + 1));
          }
        }
      } else if (mutationType < 0.66) {
        // Mutation type 2: Change a random training's room
        if (mutatedSchedule.length > 0) {
          const index = Math.floor(Math.random() * mutatedSchedule.length);
          const training = mutatedSchedule[index];
          const trainingObj = trainings.find(t => t.id === training.trainingId);

          // Select a new random room from possible rooms
          if (trainingObj.possibleRooms.length > 0) {
            const roomIndex = Math.floor(Math.random() * trainingObj.possibleRooms.length);
            training.roomId = trainingObj.possibleRooms[roomIndex];
          }
        }
      } else if (mutationType < 0.9) {
        // Mutation type 3: Change a random training's trainer
        if (mutatedSchedule.length > 0) {
          const index = Math.floor(Math.random() * mutatedSchedule.length);
          const training = mutatedSchedule[index];
          const trainingObj = trainings.find(t => t.id === training.trainingId);

          // Select a new random trainer from possible trainers
          if (trainingObj.possibleTrainers.length > 0) {
            const trainerIndex = Math.floor(Math.random() * trainingObj.possibleTrainers.length);
            training.trainerId = trainingObj.possibleTrainers[trainerIndex];
          }
        }
      } else {
        // Mutation type 4: Change a random training's day
        if (mutatedSchedule.length > 0) {
          const index = Math.floor(Math.random() * mutatedSchedule.length);
          const training = mutatedSchedule[index];
          const trainingObj = trainings.find(t => t.id === training.trainingId);

          // Ensure the new day is valid (less than DAYS)
          const newDay = Math.floor(Math.random() * DAYS);
          training.day = newDay;
        }
      }

      return mutatedSchedule;
    };

    // Add a generation function to check for a specific condition
    this.genetic.generation = function(population, generation, stats) {
      // Get the best solution in the current population
      const bestSolution = population[0].entity;
      
      // Check if there are no conflicts in the best solution
      const conflicts = this.userData.utils.detectConflicts(bestSolution, this.userData.trainings);
      
      // Return false to stop the algorithm if either condition is met
      return conflicts.length >0;
    };

    // Disable web workers to avoid serialization issues
    this.genetic.configuration.webWorkers = false;
  }

  /**
   * Run the genetic algorithm to find an optimal schedule
   */
  async findOptimalSchedule(options = {}) {

    // Verify keys in options

    const neededKeys = ['iterations', 'size', 'crossover', 'mutation'];
    const missingKeys = neededKeys.filter(key => !(key in options));
    if (missingKeys.length > 0) {
      throw new Error(`Missing required options: ${missingKeys.join(', ')}`);
    }

    const verbose = options.verbose || false;
    const skip = options.skip || 10;


    const geneticConfig = {
      iterations: options.iterations || 1000, // Fallback value if using terminate
      size: options.size,
      crossover: options.crossover,
      mutation: options.mutation,
    };

    this.genetic.userData.verbose = verbose;

    // If a custom generation condition is provided, use it
    if (options.generationCondition) {
      this.genetic.generation = function(population, generation, stats) {
        return options.generationCondition(population[0].entity, generation, stats, this.userData);
      };
    }

    return new Promise((resolve, reject) => {
      let finalGeneration = 0;
      
      this.genetic.notification = function (pop, generation, stats, isFinished) {
        finalGeneration = generation;
        
        if ((isFinished || generation % skip === 0) && verbose) {
          console.log(`Generation ${generation}: ${stats.maximum.toFixed(2)} (avg: ${stats.mean.toFixed(2)})`);
        }

        if (isFinished) {
          if(verbose) {
            console.log('Finished');
            const nbConflicts = utils.detectConflicts(pop[0].entity, this.userData.trainings).length;
            console.log(`Number of conflicts: ${nbConflicts}`);
            console.log(`Solution found after ${finalGeneration} generations`);
          }
          resolve({
            result: pop[0].entity,
            generations: finalGeneration
          });
        }
      };

      this.genetic.evolve(geneticConfig);
    });
  }
}

// Export the GeneticScheduler class
module.exports = GeneticScheduler;
