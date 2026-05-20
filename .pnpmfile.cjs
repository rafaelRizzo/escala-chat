module.exports = {
  hooks: {
    readPackage(pkg) {
      // Allow build scripts for these packages
      if (['msw', 'sharp', 'unrs-resolver'].includes(pkg.name)) {
        if (!pkg.scripts) pkg.scripts = {};
      }
      return pkg;
    },
  },
};
