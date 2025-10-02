export const toResultOk = ({ data }) => {
  return {
    status: 1,
    statusCode: 200,
    data: data,
    isOk: true,
    isError: false,
  };
};

export const toResultOkWithMessage = ({ msg }) => {
  return {
    status: 1,
    statusCode: 200,
    msg: msg,
    isOk: true,
    isError: false,
  };
};
export const toResultOkWithMessageAndData = ({
  msg,
  data,
  statusCode = 200,
}) => {
  return {
    status: 1,
    statusCode: statusCode,
    msg: msg,
    data: data,
    isOk: true,
    isError: false,
  };
};
export const toResultError = ({ statusCode, msg }) => {
  return {
    status: 0,
    statusCode: statusCode,
    msg: msg,
    isOk: false,
    isError: true,
  };
};
