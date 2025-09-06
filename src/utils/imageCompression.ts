import imageCompression from 'browser-image-compression';

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;

export const compressImage = async (file: File): Promise<File> => {
  try {
    // Check if compression is needed
    if (file.size <= MAX_FILE_SIZE) {
      return file;
    }

    const options = {
      maxSizeMB: MAX_FILE_SIZE / (1024 * 1024), // Convert to MB
      maxWidthOrHeight: Math.max(MAX_WIDTH, MAX_HEIGHT),
      useWebWorker: true,
      fileType: file.type,
    };

    const compressedFile = await imageCompression(file, options);
    
    // If compression didn't reduce size enough, try more aggressive compression
    if (compressedFile.size > MAX_FILE_SIZE) {
      const aggressiveOptions = {
        maxSizeMB: 0.3, // 300KB
        maxWidthOrHeight: 600,
        useWebWorker: true,
        fileType: 'image/jpeg', // Force JPEG for better compression
        initialQuality: 0.6,
      };
      
      return await imageCompression(file, aggressiveOptions);
    }

    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // If compression fails, return original file
    return file;
  }
};