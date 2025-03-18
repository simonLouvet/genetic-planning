# Parameter Optimization for Genetic Planning

This document explains how to use the parameter optimization tools to find the best configuration for the genetic planning algorithm.

## Available Scripts

The following scripts are available in the `package.json` file:

- `npm run optimize-params`: Runs an exhaustive parameter tester that tests all combinations of parameters.
- `npm run optimize-params:advanced`: Runs a more efficient two-phase parameter optimizer.
- `npm run optimize-and-update`: Runs the advanced optimizer and updates the optimal parameters file.
- `npm run update-params`: Interactively update parameters manually.
- `npm run start:optimal`: Runs the genetic algorithm with the current optimal parameters.

## Parameter Ranges

The parameter optimization tools test the following parameter ranges:

- **Iterations**: 100 to 1000 (step: 100)
- **Population Size**: 100 to 1000 (step: 100)
- **Crossover Rate**: 0 to 1 (step: 0.1)
- **Mutation Rate**: 0 to 1 (step: 0.1)

## Basic Parameter Tester

The basic parameter tester (`optimize-params`) tests all combinations of parameters in the specified ranges. This is very thorough but can take a long time to run due to the large number of combinations (10×10×11×11 = 12,100 tests).

```bash
npm run optimize-params
```

## Advanced Parameter Optimizer

The advanced parameter optimizer (`optimize-params:advanced`) uses a two-phase approach:

1. **Phase 1**: Tests a coarse-grained set of parameters (5×5×5×5 = 625 tests)
2. **Phase 2**: Tests fine-grained parameters around the best results from Phase 1

This approach is much more efficient and can find optimal parameters faster.

```bash
npm run optimize-params:advanced
```

## Optimizing and Updating Parameters Automatically

To run the advanced optimizer and automatically update the optimal parameters file:

```bash
npm run optimize-and-update
```

This will:
1. Run the advanced parameter optimizer
2. Update the `run-optimal.js` file with example optimal parameters (in a real scenario, you would select the best parameters from the results)

## Updating Parameters Manually

If you want to manually update the parameters based on your own observations or after running the optimizers:

```bash
npm run update-params
```

This interactive script will prompt you to enter values for each parameter and will update the `run-optimal.js` file accordingly.

## Running with Optimal Parameters

After finding the optimal parameters, you can run the genetic algorithm with these parameters:

```bash
npm run start:optimal
```

## How to Choose the Best Parameters

When evaluating parameter combinations, consider the following:

1. **Primary goal**: Find parameters that result in zero conflicts
2. **Secondary goal**: Minimize execution time

The best parameter combination is the one that:
- Consistently produces schedules with zero conflicts
- Has the shortest execution time

## Example Workflow

Here's a recommended workflow for parameter optimization:

1. Run the advanced optimizer: `npm run optimize-params:advanced`
2. Note the best parameter combinations (those with zero conflicts and shortest times)
3. Use the interactive updater to set these parameters: `npm run update-params`
4. Run the algorithm with the optimal parameters: `npm run start:optimal`
5. If needed, adjust parameters and rerun until satisfied

## Implementation Details

- `src/parameter-tester.js`: Exhaustive parameter tester
- `src/parameter-optimizer.js`: Two-phase parameter optimizer
- `src/update-optimal-params.js`: Script to update optimal parameters
- `src/manual-param-update.js`: Interactive parameter updater
- `src/run-optimal.js`: Script to run with optimal parameters 