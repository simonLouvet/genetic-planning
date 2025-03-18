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
```

## Customizing the Data

To use your own data, modify the files in the `data` directory:

- `sample-data.js`: Contains sample trainers, rooms, and training courses

## Algorithm Configuration

The genetic algorithm can be configured with the following parameters:

- `generations`: Number of generations to run (default: 100)
- `populationSize`: Population size (default: 50)
- `crossoverRate`: Crossover probability (default: 0.3)
- `mutationRate`: Mutation probability (default: 0.3)
- `elitism`: Whether to keep the best individual (default: true)
- `tournamentSize`: Size of tournament for selection (default: 3)

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

## License

MIT