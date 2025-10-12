// tạo random một mã code gồm 6 ký tự số
export const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
};
