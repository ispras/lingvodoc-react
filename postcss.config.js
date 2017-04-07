const reactToolboxVariables = {
};

module.exports = {
  plugins: [
    require('postcss-cssnext')({
      features: {
        customProperties: {
          variables: reactToolboxVariables,
        },
      },
    }),
    require('postcss-modules-values'),
  ],
};
