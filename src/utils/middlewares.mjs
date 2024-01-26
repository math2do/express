// example of middleware
export const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
};

// resolveIndexByUserId middleware attaches 'userIndex' and 'parseId' into req properties
export const resolveIndexByUserId = (req, res, next) => {
  const { id } = req.params;
  const parseId = parseInt(id);
  if (isNaN(parseId)) {
    return res.status(400).send({ msg: "bad request. invalid id" });
  }

  const userIndex = mockUsers.findIndex((user) => user.id === parseId);
  if (userIndex === -1) {
    return res.sendStatus(404);
  }
  // add derived userIndex to req properties
  req.userIndex = userIndex;
  next();
};
