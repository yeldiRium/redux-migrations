const { createStore, combineReducers } = require("redux");

const { migrations } = require("../");

describe("createStore", () => {
  const exampleReducer = (state = {}, action) => state;

  it("adds _migration field to the store", () => {
    const preloadedState = { blub: "blub" };

    const reduxStore = createStore(exampleReducer, preloadedState);
    const customStore = createStore(
      exampleReducer,
      preloadedState,
      migrations([])
    );

    expect(customStore.getState()).toMatchObject(reduxStore.getState());
    expect(customStore.getState()).toEqual({
      _migrations: [],
      blub: "blub"
    });
  });

  it("accepts no migration parameter as if an empty list was given", () => {
    const store = createStore(exampleReducer, migrations());
    expect(store.getState()).toEqual({
      _migrations: []
    });
  });

  describe("broken parameters/setup", () => {
    it("throws an error if the reducer initializes to something other than an object", () => {
      const reducer = (state = [], action) => [];
      expect(() => createStore(reducer, migrations([]))).toThrow(
        "Expected reducer to return a plain object. Migrations only work with plain object stores."
      );
    });

    it("throws an error if migrations are malformed", () => {
      expect(() => createStore(exampleReducer, migrations([{}]))).toThrow(
        "Migration 0 is missing property id."
      );
      expect(() =>
        createStore(exampleReducer, migrations([{ id: 5 }]))
      ).toThrow("Expected id of migration 0 to be of type string.");
      expect(() =>
        createStore(exampleReducer, migrations([{ id: "123" }]))
      ).toThrow("Migration 0 is missing migration function.");
      expect(() =>
        createStore(exampleReducer, migrations([{ id: "123", migrate: {} }]))
      ).toThrow("Expected migrate function of migration 0 to be a function.");
    });

    it("throws an error if the preloaded state is not a plain object", () => {
      const preloadedState = "uiae";
      expect(() =>
        createStore(exampleReducer, preloadedState, migrations([]))
      ).toThrow(
        "Expected state to be a plain object. Migrations only work with plain object stores."
      );
    });
  });

  describe("definition mismatch", () => {
    it(`throws an error if the given migrations don't match the previously executed migrations`, () => {
      const preloadedState = {
        _migrations: ["321"]
      };
      const migrationDefinitions = [
        {
          id: "123",
          migrate: state => ({
            blub: "blub"
          })
        }
      ];

      expect(() =>
        createStore(
          exampleReducer,
          preloadedState,
          migrations(migrationDefinitions)
        )
      ).toThrow(
        "Migration definition mismatch: Expected migration 321 at index 0. Found 123 instead."
      );
    });

    it("throws an error if there are less migration definitions than previously executed migrations", () => {
      const preloadedState = {
        _migrations: ["321"]
      };
      const migrationDefinitions = [];

      expect(() =>
        createStore(
          exampleReducer,
          preloadedState,
          migrations(migrationDefinitions)
        )
      ).toThrow(
        "Migration definition mismatch: Expected migration 321 at index 0. Found nothing instead."
      );
    });

    it(`throws an error if the order of the given migrations doesn't match the previously executed migrations`, () => {
      const preloadedState = {
        _migrations: ["123", "321"]
      };
      const migrationDefinitions = [
        {
          id: "321",
          migrate: state => ({
            blub: "blub"
          })
        },
        {
          id: "123",
          migrate: state => ({
            blub: "blub"
          })
        }
      ];

      expect(() =>
        createStore(
          exampleReducer,
          preloadedState,
          migrations(migrationDefinitions)
        )
      ).toThrow(
        "Migration definition mismatch: Expected migration 123 at index 0. Found 321 instead."
      );
    });
  });

  describe("migrations", () => {
    it("transforms the preloadedState according to the given migrate function and attaches the migration's id to the store", () => {
      const preloadedState = { uiae: "thisIsGonnaBeReplaced" };
      const migrationDefinitions = [
        {
          id: "123",
          migrate: state => ({
            blub: "blub"
          })
        }
      ];

      const store = createStore(
        exampleReducer,
        preloadedState,
        migrations(migrationDefinitions)
      );

      expect(store.getState()).toEqual({
        _migrations: ["123"],
        blub: "blub"
      });
    });

    it("applies multiple migrations correctly", () => {
      const preloadedState = {
        blub: "blub"
      };
      const migrationDefinitons = [
        {
          id: "123",
          migrate: state => ({
            ...state,
            blab: "blab"
          })
        },
        {
          id: "124",
          migrate: state => ({
            ...state,
            blub: [1, 2, 3]
          })
        }
      ];

      const store = createStore(
        exampleReducer,
        preloadedState,
        migrations(migrationDefinitons)
      );
      const resultingState = store.getState();

      expect(resultingState).toEqual({
        _migrations: ["123", "124"],
        blab: "blab",
        blub: [1, 2, 3]
      });

      const migrationDefinitionsRoundTwo = [
        ...migrationDefinitons,
        {
          id: "125",
          migrate: state => ({
            blib: 12345
          })
        }
      ];

      const storeTwo = createStore(
        exampleReducer,
        resultingState,
        migrations(migrationDefinitionsRoundTwo)
      );

      const resultingStateTwo = storeTwo.getState();

      expect(resultingStateTwo).toEqual({
        _migrations: ["123", "124", "125"],
        blib: 12345
      });
    });

    it("do not see the list of previous migrations", () => {
      const preloadedState = {
        _migrations: ["1"],
        someState: "someState"
      };

      const migrationDefinitions = [
        {
          id: "1",
          migrate: state => state
        },
        {
          id: "2",
          migrate: jest.fn(state => state)
        }
      ];

      createStore(
        exampleReducer,
        preloadedState,
        migrations(migrationDefinitions)
      );

      expect(
        migrationDefinitions[1].migrate.mock.calls[0][0]
      ).not.toHaveProperty("_migrations");
    });
  });
});
