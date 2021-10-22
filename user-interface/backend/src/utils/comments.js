const generateComment = (data) => {
  return {
    ...data,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateComment,
};
