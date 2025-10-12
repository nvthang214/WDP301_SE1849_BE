import { MESSAGE } from "../constants/message.js";
import { toResultError } from "../results/Result.js";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(
    toResultError({
      statusCode: 500,
      msg: MESSAGE.SYSTEM_ERROR,
    })
  );
};
