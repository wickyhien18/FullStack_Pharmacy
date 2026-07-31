// Store instance of Socket.IO
let ioInstance = null;

// A function that stores the Socket.IO instance into a global variable within the module.
export const setIO = (io) => {
  ioInstance = io;
};

// A function that retrieves the Socket.IO instance for use in other services or controllers
export const getIO = () => {
  if (!ioInstance) throw new Error("Socket.io chưa được khởi tạo");
  return ioInstance;
};
