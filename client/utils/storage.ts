import * as FileSystem from 'expo-file-system';

const IMAGE_FOLDER = `${FileSystem.documentDirectory}images/`;
const METADATA_FOLDER = `${FileSystem.documentDirectory}metadata/`;

export const setupDirectories = async () => {
  const [dirInfo, metadataInfo] = await Promise.all([
    FileSystem.getInfoAsync(IMAGE_FOLDER),
    FileSystem.getInfoAsync(METADATA_FOLDER)
  ]);
  
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_FOLDER, { intermediates: true });
  }
  if (!metadataInfo.exists) {
    await FileSystem.makeDirectoryAsync(METADATA_FOLDER, { intermediates: true });
  }
};

const getMetadataPath = (userId: string) => {
  return `${METADATA_FOLDER}user_${userId}_metadata.json`;
};

export const getLocalImageUri = (imageUrl: string) => {
  const image = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
  return `${IMAGE_FOLDER}${image}.jpg`;
};

const saveMetadata = async (userId: string, imageUrl: string) => {
  const metadata = { imageUrl, timestamp: new Date().toISOString() };
  await FileSystem.writeAsStringAsync(
    getMetadataPath(userId),
    JSON.stringify(metadata)
  );
};

const getStoredMetadata = async (userId: string) => {
  try {
    const metadataPath = getMetadataPath(userId);
    const metadataInfo = await FileSystem.getInfoAsync(metadataPath);
    
    if (!metadataInfo.exists) {
      return null;
    }
    
    const metadataContent = await FileSystem.readAsStringAsync(metadataPath);
    return JSON.parse(metadataContent);
  } catch (error) {
    console.error('Error reading metadata:', error);
    return null;
  }
};

export const saveImageLocally = async (imageUrl: string, userId: string): Promise<string> => {
  try {
    const localUri = getLocalImageUri(imageUrl);
    await setupDirectories();
    
    // Download the file
    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);
    
    if (downloadResult.status !== 200) {
      throw new Error('Failed to download image');
    }
    
    // Save metadata with the image URL
    await saveMetadata(userId, imageUrl);
    
    return localUri;
  } catch (error) {
    console.error('Error saving image locally:', error);
    throw error;
  }
};

export const getLocalImage = async (userId: string, currentImageUrl: string): Promise<string | null> => {
  try {
    const localUri = getLocalImageUri(currentImageUrl);
    const [fileInfo, metadata] = await Promise.all([
      FileSystem.getInfoAsync(localUri),
      getStoredMetadata(userId)
    ]);

    // If the image exists and the stored URL matches the current URL
    if (fileInfo.exists && metadata && metadata.imageUrl === currentImageUrl) {
      return localUri;
    }
    
    // If URLs don't match or metadata is missing, we need to re-download
    return null;
  } catch (error) {
    console.error('Error checking local image:', error);
    return null;
  }
}; 