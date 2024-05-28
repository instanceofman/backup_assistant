module.exports = (input) => ({
  requires(field) {
    if (!input.hasOwnProperty(field)) throw new Error(`Missing ${field}`);

    return this;
  },

  get() {
    return input;
  },
});
