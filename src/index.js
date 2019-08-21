const {
  addMigrationsToReducer,
  compareMigrationDefinitionsWithPreviousMigrations,
  migrationsInState
} = require("./migrations");

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

  let executedMigrations = [...previousMigrations];

  let migratedState = preloadedState ? { ...preloadedState } : {};
  delete migratedState._migrations;

  remainingMigrations.forEach(migration => {
    migratedState = migration.migrate(migratedState);
    executedMigrations.push(migration.id);
  });

  return createStore(addMigrationsToReducer(reducer), {
    ...migratedState,
    _migrations: executedMigrations
  });
};

module.exports = { migrations };
