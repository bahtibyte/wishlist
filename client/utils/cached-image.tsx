import React, { useEffect, useState } from 'react';
import { Text, Avatar } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

const CACHE_FOLDER = `${FileSystem.documentDirectory}cache/`;
const IMAGES_FOLDER = `${CACHE_FOLDER}images/`;

interface Metadata {
  source: string;
  localUri: string;
  timestamp: string;
  usage: number;
}

interface MetadataMap {
  [key: string]: Metadata;
}

const setup = async () => {
  const [cache, images] = await Promise.all([
    FileSystem.getInfoAsync(CACHE_FOLDER),
    FileSystem.getInfoAsync(IMAGES_FOLDER)
  ]);
  if (!cache.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });
  }
  if (!images.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_FOLDER, { intermediates: true });
  }
}

const saveMetadata = async (metadataMap: MetadataMap) => {
  const metadataPath = `${CACHE_FOLDER}metadata.json`;
  await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(metadataMap));
}

const getMetadata = async (): Promise<MetadataMap> => {
  try {
    const metadataPath = `${CACHE_FOLDER}metadata.json`;
    const metadataInfo = await FileSystem.getInfoAsync(metadataPath);
    if (!metadataInfo.exists) {
      return {};
    }
    const metadataContent = await FileSystem.readAsStringAsync(metadataPath);
    return JSON.parse(metadataContent);
  } catch (error) {
    console.error('Error reading metadata:', error);
    return {};
  }
}

const cacheImage = async (source: string): Promise<Metadata> => {
  await setup();

  const image = source.substring(source.lastIndexOf('/') + 1);
  const metadataMap = await getMetadata();
  const metadata = metadataMap[image];

  // If the image is already cached and matches source, return the metadata
  if (metadata && metadata.source === source) {
    metadata.timestamp = new Date().toISOString();
    metadata.usage++;

    await saveMetadata(metadataMap);
    return metadata;
  }

  const localUri = `${IMAGES_FOLDER}${image}.jpg`;

  try {
    console.log("[cache]: Image is not cached, downloading image", source);
    const downloadResult = await FileSystem.downloadAsync(source, localUri);
    if (downloadResult.status !== 200) {
      throw new Error('Failed to download image');
    }

    const metadata: Metadata = {
      source,
      localUri,
      timestamp: new Date().toISOString(),
      usage: 0
    };
    metadataMap[image] = metadata;
    await saveMetadata(metadataMap);

    // Return the newly cached metadata.
    return metadata;
  } catch (error) {
    console.error('Error downloading image:', error);
  }

  // Return non cached metadata so image can still be loaded.
  return {
    source: source,
    localUri: source,
    timestamp: '',
    usage: 0,
  };
}

interface CachedImageProps {
  source: string;
  size: number;
}

/**
 * CachedImage is a component that caches and displays an image from a given source.
 * It uses the cacheImage function to download and cache the image locally.
 * The cached image is then displayed using the Avatar component from react-native-paper.
 * 
 * @param props - The props object containing the source and size of the image.
 * @returns The CachedImage component.
 */
const CachedImage = (props: CachedImageProps) => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const source: string = props.source;

  useEffect(() => {
    const loadMetadata = async () => {
      const metadata = await cacheImage(source);
      setMetadata(metadata);
      setIsLoading(false);
    };

    loadMetadata();
  }, [source]);

  if (isLoading || !metadata) {
    return <></>;
  }

  return <Avatar.Image size={props.size} source={{ uri: metadata.localUri }} />
};

export default CachedImage;
