const isPlainObject = require("is-plain-object");

const { zip } = require("./util");

const migrationsInState = state => {
  if (state === undefined) {
    return [];
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
const addMigrationsToReducer = reducer => (state, action) => {
  let _migrations = migrationsInState(state);
  const newState = reducer(state, action);
  if (!isPlainObject(newState)) {
    throw new Error(
      "Expected reducer to return a plain object. Migrations only work with plain object stores."
    );
  }
  return {
    ...newState,
    _migrations
  };
};

/**
 *
 * @param {[{id: string, migrate: Function}]} migrationDefinitions A list of
 *  migrations to apply in order to the state when initializing the store.
 * @param {Function} createStore The redux createStore function.
 * @param {Function} reducer See redux documentation.
 * @param {any} [preloadedState] See redux documentation.
 *
 * @returns {Store}
 */
const migrations = migrationDefinitions => createStore => (
  reducer,
  preloadedState
) => {
  const previousMigrations = migrationsInState(preloadedState);

  if (migrationDefinitions === undefined) {
    migrationDefinitions = [];
  }
  migrationDefinitions.forEach((migration, index) => {
    if (!migration.id) {
      throw new Error(`Migration ${index} is missing property id.`);
    }
    if (typeof migration.id !== "string") {
      throw new Error(
        `Expected id of migration ${index} to be of type string.`
      );
    }
    if (!migration.migrate) {
      throw new Error(`Migration ${index} is missing migration function.`);
    }
    if (typeof migration.migrate !== "function") {
      throw new Error(
        `Expected migrate function of migration ${index} to be a function.`
      );
    }
  });

  const remainingMigrations = compareMigrationDefinitionsWithPreviousMigrations(
    previousMigrations,
    migrationDefinitions
  );

  let migratedState = {
    ...preloadedState,
    _migrations: previousMigrations
  };
  remainingMigrations.forEach(migration => {
    migratedState = {
      ...migration.migrate(migratedState),
      _migrations: [...migratedState._migrations, migration.id]
    };
  });

  return createStore(addMigrationsToReducer(reducer), migratedState);
};

module.exports = { migrations };
