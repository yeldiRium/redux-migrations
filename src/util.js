const zip = function*(listA, listB) {
  let index = 0;
  while (index < listA.length || index < listB.length) {
    yield [listA[index], listB[index], index];
    index++;
  }
};

module.exports = {
  zip
};
