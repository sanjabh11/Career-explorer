module.exports = function (source) {
  return source.replace(/require\(['"]fs['"]\)/g, 'null');
};

