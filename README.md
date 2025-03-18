# Genetic Planning

A genetic algorithm implementation for optimizing training schedules during a 5-day event, taking into account trainer availability, room availability, and training requirements.

## Overview

This application uses a genetic algorithm to generate an optimal training schedule that:

- Respects trainer availability (trainers may only be available on certain days)
- Respects room availability (rooms may only be available on certain days)
- Maximizes the number of required training occurrences
- Avoids scheduling conflicts (same trainer or room at the same time)
- Optimizes resource utilization

## Installation

```bash
# Clone the repository
git clone https://github.com/simonLouvet/genetic-planning.git
cd genetic-planning

# Install dependencies
npm install
```

## Usage

```bash
# Run the application with sample data
node src/index.js

# Run parameter optimization to find optimal genetic algorithm settings
npm run optimize-params

# Run tests
npm test
```

## Customizing the Data

To use your own data, modify the files in the `data` directory:

- `sample-data.js`: Contains sample trainers, rooms, and training courses

You can create your own data file following this structure:

```javascript
const { Trainer, Room, Training } = require('../src/models');

// Define trainers with availability
const trainers = [
  new Trainer(1, "Alice", [0, 1, 2, 3, 4]), // Available all days
  // Add more trainers...
];

// Define rooms with availability
const rooms = [
  new Room(1, "Room A", 20, [0, 1, 2, 3, 4]), // Available all days
  // Add more rooms...
];

// Define trainings with requirements
const trainings = [
  new Training(1, "Course Title", requiredOccurrences, [trainerIds], [roomIds], duration),
  // Add more trainings...
];

module.exports = { trainers, rooms, trainings };
```

## Algorithm Configuration

GeneticScheduler contains a genetic algorithm that can be configured with the following parameters:

- `iterations`: Number of iterations to ru, GeneticScheduler will stop when solution without conflicts is found or when the number of iterations is reached
- `size`: Population size
- `crossover`: Crossover probability
- `mutation`: Mutation probability

## Scheduler parameters

those parameters are used to configure the scheduler in addition to the genetic algorithm parameters

- `skip`: Number of generations to skip before logging
- `verbose`: Whether to print verbose output

These parameters can be adjusted in `src/index.js`.

## Implementation Details

### Genetic Algorithm Components

- **Initialization**: Generates random initial schedules
- **Fitness Function**: Evaluates schedules based on:
  - Number of scheduled trainings
  - Absence of conflicts
  - Satisfaction of required occurrences
  - Trainer and room utilization
- **Selection**: Tournament selection to choose parents
- **Crossover**: Combines two parent schedules to create a child schedule
- **Mutation**: Randomly modifies a schedule by:
  - Changing a training's time slot
  - Changing a training's room
  - Changing a training's trainer

### Data Models

- **Trainer**: Represents a trainer with availability on specific days
- **Room**: Represents a room with availability on specific days
- **Training**: Represents a training course with required occurrences, possible trainers, and possible rooms
- **ScheduledTraining**: Represents a scheduled training session with a specific trainer, room, day, and time slot

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. create a new branch
2. commit your changes
3. push to the branch
4. open a Pull Request

## License

MIT