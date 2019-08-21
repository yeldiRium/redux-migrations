const isPlainObject = obj => {
  if (typeof obj !== "object" || obj === null) return false;

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
};

const zip = function*(listA, listB) {
  let index = 0;
  while (index < listA.length || index < listB.length) {
    yield [listA[index], listB[index], index];
    index++;
  }
};

module.exports = {
  isPlainObject,
  zip
};
