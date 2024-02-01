export const createUserValidationSchema = {
  username: {
    isLength: {
      options: { min: 5, max: 32 },
      errorMessage: "username have length between 3-32"
    },
    notEmpty: {
      errorMessage: "username can't be empty"
    },
    isString: {
      errorMessage: "username must be string"
    }
  },
  displayName: {
    notEmpty: true
  },
  password: {
    notEmpty: true
  },
};