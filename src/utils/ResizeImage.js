function resizeImageFile(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const aspect = width / height;
      if (width > maxWidth) {
        width = maxWidth;
        height = Math.round(width / aspect);
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = Math.round(height * aspect);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
        "image/jpeg",
        0.8
      );
    };
    img.onerror = (err) => reject(err);
    const reader = new FileReader();
    reader.onload = (e) => (img.src = e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default resizeImageFile;
