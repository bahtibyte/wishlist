import { getAuthorizationHeader } from "./tokens";
import { Platform } from 'react-native';

export const HOST = Platform.Version.toString().includes('18') ?
  'http://192.168.1.151:4000' :
  'http://localhost:4000';

console.log(HOST);

export const updateProfile = async (formData: FormData) => {
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${HOST}/api/profile`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...authHeader
    },
  });
  return response;
}
