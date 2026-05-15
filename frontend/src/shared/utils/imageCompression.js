const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const compressImage = async (
  file,
  { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = {}
) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be compressed.");
  }

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  let { width, height } = image;

  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const compressedFile = new File([blob], file.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        resolve({
          file: compressedFile,
          preview: canvas.toDataURL("image/jpeg", quality),
          originalSize: file.size,
          compressedSize: blob.size,
        });
      },
      "image/jpeg",
      quality
    );
  });
};

export const compressImages = async (files, options) => {
  const compressed = [];

  for (const file of files) {
    compressed.push(await compressImage(file, options));
  }

  return compressed;
};
