export const sendSuccess = (
  res,
  data,
  message = 'Success',
  status = 200
) => {
  const body = { success: true, message, data };
  return res.status(status).json(body);
};

export const sendError = (
  res,
  message,
  status = 400,
  errors = undefined
) => {
  const body = { success: false, message, errors };
  return res.status(status).json(body);
};
