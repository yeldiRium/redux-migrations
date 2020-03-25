const { isPlainObject, zip } = require("./util");

const migrationsInState = (state) => {
  if (state === undefined) {
    return [];
  }
  if (!isPlainObject(state)) {
    throw new Error(
      "Expected state to be a plain object. Migrations only work with plain object stores."
    );
  }
  if (state._migrations === undefined) {
    return [];
  }
  return state._migrations;
};

const compareMigrationDefinitionsWithPreviousMigrations = (
  previousMigrations,
  migrationDefinitions
) => {
  if (previousMigrations === undefined) {
    throw new Error("PreviousMigrations is missing.");
  }

  if (migrationDefinitions === undefined) {
    throw new Error("MigrationDefinitions is missing.");
  }

  const remainingMigrations = [];

  for (const pair of zip(previousMigrations, migrationDefinitions)) {
    const [previousMigration, migrationDefinition, index] = pair;
    if (previousMigration === undefined) {
      remainingMigrations.push(migrationDefinition);
      continue;
    }

    if (migrationDefinition === undefined) {
      throw new Error(
        `Migration definition mismatch: Expected migration ${previousMigration} at index ${index}. Found nothing instead.`
      );
    }
    if (migrationDefinition.id !== previousMigration) {
      throw new Error(
        `Migration definition mismatch: Expected migration ${previousMigration} at index ${index}. Found ${migrationDefinition.id} instead.`
      );
    }
  }

  return remainingMigrations;
};

/**
 * Adds migrations to and makes them safe from another reducer.
 * The wrapped reducer cannot overwrite the _migrations field and the field will
 * always be present and preserved at the store's root.
 *
 * @param {Function} reducer
 */
const addMigrationsToReducer = (reducer) => {
  if (typeof reducer !== "function") {
    throw new Error("Expected reducer to be a function.");
  }
  return (state, action) => {
    let _migrations = migrationsInState(state);
    const newState = reducer(state, action);
    if (!isPlainObject(newState)) {
      throw new Error(
        "Expected reducer to return a plain object. Migrations only work with plain object stores."
      );
    }
    return {
      ...newState,
      _migrations,
    };
  };
};

module.exports = {
  addMigrationsToReducer,
  compareMigrationDefinitionsWithPreviousMigrations,
  migrationsInState,
};
