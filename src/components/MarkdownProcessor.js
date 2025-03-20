export const processMarkdown = (content, baseDir) => {
  // 处理图片路径
  const imgPattern = /!\[.*?\]\((.*?)\)/g;
  return content.replace(imgPattern, (match, relativePath) => {
    const baseURL = new URL(baseDir, window.location.href);
    const absolutePath = new URL(relativePath, baseURL).href;
    return match.replace(relativePath, absolutePath);
  });
};

// 文件上传处理
export const handleFileUpload = (file) => {
  return {
    content: URL.createObjectURL(file),
    baseDir: new URL(file.name, window.location.href).href
  };
};