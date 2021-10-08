# Redux Migrations

**This package is no longer maintained.**

---

A utility for creating redux stores and migrating existing data to the new
store's structure.

```sh
npm install @yeldirium/redux-migrations
# or
yarn install @yeldirium/redux-migrations
```

## Status

| Category         | Status                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Version          | [![npm](https://img.shields.io/npm/v/@yeldirium/redux-migrations)](https://www.npmjs.com/package/@yeldirium/redux-migrations) |
| Dependencies     | ![David](https://img.shields.io/david/yeldirium/redux-migrations)                                                             |
| Dev dependencies | ![David](https://img.shields.io/david/dev/yeldirium/redux-migrations)                                                         |
| Build            | ![GitHub Actions](https://github.com/yeldiRium/redux-migrations/workflows/Release/badge.svg?branch=master)                    |
| License          | ![GitHub](https://img.shields.io/github/license/yeldiRium/redux-migrations)                                                   |

## Why?

If you use redux to maintain your application's state and persist that state in
some way across application starts - be it with a database or a json file - you
will at some point run into the problem that your store structure changes.
Maybe a new store branch is added or some reducer layers are restructured -
migrations are necessary when the persisted state is not usable by a new version
of the application anymore.

## How?

This project draws inspiration from a migration solutions like [doctrine migrations](https://symfony.com/doc/master/bundles/DoctrineMigrationsBundle/index.html) in the way it tracks executed migrations. It adds a store branch for
migrations to your applications store (which you cannot modify) in which it
keeps track of the ids of executed migrations, so that only new ones are
executed.

Migrations will never run multiple times and redux-migrations will tell you if
your migration definitions don't match the persisted state.

Use it like so:

```javascript
const { createStore } = require("redux");
const { migrations } = require("redux-migrations");

const reducer = require("...your reducer");
const fetchStateFromSomewhere = require("...wherever you persist your state");

const migrationDefinitons = [
  {
    id: "12345",
    migrate: state => ({
      ...state,
      newBranch: []
    })
  },
  {
    id: "4895",
    migrate: ({ newBranch, ...restState }) => ({
      ...restState,
      nested: {
        newBranch,
        anotherNewBranch
      }
    })
  }
];

const preloadedState = await fetchStateFromSomewhere();

const store = createStore(
  reducer,
  preloadedState,
  migrations(migrationDefinitions)
);
```

After all that, the migrations are executed on the preloaded state (if they
haven't been before) and the state in the newly created store should have the
form you want.

## API

### migrations(...migrationDefinition): Enhancer

Takes a list of migrations definitions of the form

```javascript
const migrationDefinition = {
  // Some string identifier. choose it however you like. timestamps or uuids are recommended
  id: "1234",
  migrate: state => {
    return modifyState(state);
  }
};
```

and returns a [redux enhancer](https://redux.js.org/recipes/configuring-your-store#extending-redux-functionality).
