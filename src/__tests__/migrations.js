const {
  addMigrationsToReducer,
  compareMigrationDefinitionsWithPreviousMigrations,
  migrationsInState
} = require("../migrations");

describe("addMigrationsToReducer", () => {
  it("throws an error if the given reducer is not a function", () => {
    expect(() => addMigrationsToReducer()).toThrow(
      "Expected reducer to be a function."
    );
    expect(() => addMigrationsToReducer(5)).toThrow(
      "Expected reducer to be a function."
    );
    expect(() => addMigrationsToReducer({})).toThrow(
      "Expected reducer to be a function."
    );
    expect(() => addMigrationsToReducer([])).toThrow(
      "Expected reducer to be a function."
    );
    expect(() => addMigrationsToReducer(false)).toThrow(
      "Expected reducer to be a function."
    );
  });

  it("returns a function", () => {
    expect(typeof addMigrationsToReducer(() => {})).toBe("function");
  });

  it("passes state and action to the reducer as-is", () => {
    const reducer = jest.fn((state = {}, action) => state);
    const action = { type: "NOOP" };
    const transformedReducer = addMigrationsToReducer(reducer);

    transformedReducer(undefined, action);

    expect(reducer).toHaveBeenCalledWith(undefined, action);
  });

  it("attaches migrations to the state resulting from the reducer", () => {
    const reducer = (state = {}, action) => state;
    const transformedReducer = addMigrationsToReducer(reducer);

    expect(transformedReducer(undefined, { type: "NOOP" })).toEqual({
      _migrations: []
    });
  });

  it("overwrites any changes the reducer makes to the migrations", () => {
    const reducer = (state, action) => ({
      _migrations: "lololo"
    });
    const transformedReducer = addMigrationsToReducer(reducer);
    const initialState = {
      _migrations: ["sensibleMigrationId"]
    };

    expect(transformedReducer(initialState, { type: "NOOP" })).toEqual(
      initialState
    );
  });
});

describe("compareMigrationDefinitionsWithPreviousMigrations", () => {
  it("throws an error if previousMigrations is undefined", () => {
    expect(() =>
      compareMigrationDefinitionsWithPreviousMigrations(undefined, [])
    ).toThrow("PreviousMigrations is missing.");
  });

  it("throws an error if migrationDefinitions is undefined", () => {
    expect(() => compareMigrationDefinitionsWithPreviousMigrations([])).toThrow(
      "MigrationDefinitions is missing."
    );
  });

  it("returns all migrationDefinitions if the list of previousMigrations is empty", () => {
    const previousMigrations = [];
    const migrationDefinitions = [
      {
        id: "uiae",
        migrate: state => state
      }
    ];

    expect(
      compareMigrationDefinitionsWithPreviousMigrations(
        previousMigrations,
        migrationDefinitions
      )
    ).toEqual(migrationDefinitions);
  });

  it("returns all remaining migrationDefinitions if some match the previousMigrations", () => {
    const previousMigrations = ["1", "2"];
    const migrationDefinitions = [
      {
        id: "1",
        migrate: state => state
      },
      {
        id: "2",
        migrate: state => state
      },
      {
        id: "3",
        migrate: state => state
      },
      {
        id: "3",
        migrate: state => state
      }
    ];

    expect(
      compareMigrationDefinitionsWithPreviousMigrations(
        previousMigrations,
        migrationDefinitions
      )
    ).toEqual(migrationDefinitions.slice(2));
  });

  it(`throws an error if the order of migrationDefinitons doesn't match the previousMigrations`, () => {
    const previousMigrations = ["1", "2"];
    const migrationDefinitions = [
      {
        id: "2",
        migrate: state => state
      },
      {
        id: "1",
        migrate: state => state
      }
    ];

    expect(() =>
      compareMigrationDefinitionsWithPreviousMigrations(
        previousMigrations,
        migrationDefinitions
      )
    ).toThrow(
      "Migration definition mismatch: Expected migration 1 at index 0. Found 2 instead."
    );
  });

  it("throws an error if migrationDefinitions are missing that were previously executed", () => {
    const previousMigrations = ["1", "2"];
    const migrationDefinitions = [
      {
        id: "1",
        migrate: state => state
      }
    ];

    expect(() =>
      compareMigrationDefinitionsWithPreviousMigrations(
        previousMigrations,
        migrationDefinitions
      )
    ).toThrow(
      "Migration definition mismatch: Expected migration 2 at index 1. Found nothing instead."
    );
  });
});

describe("migrationsInState", () => {
  it("returns an empty list if given undefined", () => {
    expect(migrationsInState()).toEqual([]);
  });

  it("returns an empty list if given a store without migrations", () => {
    expect(migrationsInState({})).toEqual([]);
  });

  it("returns the migrations in a state", () => {
    const migrations = ["123", "456"];
    expect(migrationsInState({ _migrations: migrations })).toEqual(migrations);
  });

  it("throws an error if given some kind of bullshit", () => {
    expect(() => migrationsInState(5)).toThrow(
      "Expected state to be a plain object. Migrations only work with plain object stores."
    );
    expect(() => migrationsInState(false)).toThrow(
      "Expected state to be a plain object. Migrations only work with plain object stores."
    );
    expect(() => migrationsInState(null)).toThrow(
      "Expected state to be a plain object. Migrations only work with plain object stores."
    );
    expect(() => migrationsInState(NaN)).toThrow(
      "Expected state to be a plain object. Migrations only work with plain object stores."
    );
  });
});
