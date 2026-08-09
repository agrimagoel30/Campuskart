// A wrapper function to catch async errors and pass them to the global error handler
// This replaces the need for try/catch blocks in every async controller function
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
