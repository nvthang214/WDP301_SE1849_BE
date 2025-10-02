import { MESSAGE } from "../constants/message.js";
import { toResultError } from "../results/Result.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(
    toResultError({
      statusCode: 500,
      msg: MESSAGE.SYSTEM_ERROR,
    })
  );
};
