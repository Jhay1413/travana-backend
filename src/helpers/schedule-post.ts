import { format, parseISO } from "date-fns";
import { AppError } from "../middleware/errorHandler";
import path from "path";

import fs from 'fs';
import axios from "axios";
interface MediaUploadResponse {
  id: string;
  uuid: string;
  name: string;
  mime_type: string;
  type: string;
  url: string;
  thumb_url: string;
  is_video: boolean;
  created_at: string;
}

export const scheduleOnlySocialsPost = async (postSchedule: string, postContent: string, images: string[]) => {
  const scheduleDateTime = parseISO(postSchedule);
  const scheduleDate = format(scheduleDateTime, 'yyyy-MM-dd');
  const scheduleTime = format(scheduleDateTime, 'HH:mm');
  const ACCOUNT_ID = 44362;
  const API_URL = `https://app.onlysocial.io/os/api/${process.env.ONLY_SOCIALS_WORKSPACE}/posts`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ONLY_SOCIALS}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accounts: [ACCOUNT_ID],
        versions: [{
          account_id: ACCOUNT_ID,
          is_original: true,
          content: [{
            body: postContent,
            media: images,
            url: ""
          }],
          options: {
            facebook_page: { type: "post" }
          }
        }],
        tags: [],
        date: scheduleDate,
        time: scheduleTime,
        status: "scheduled",
        until_date: null,
        until_time: "",
        repeat_frequency: null,
        short_link_provider: null,
        short_link_provider_id: null
      })
    });

    const data = await response.json() as { id: string; uuid: string; name: string; hexColor: string };

    if (!response.ok) {
      console.error('OnlySocials API error:', data);
      throw new AppError(
        `OnlySocials API error: ${data} || 'Failed to schedule post'}`,
        true,
        response.status
      );
    }
    const scheduled = await fetch(`${API_URL}/schedule/${data.uuid}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ONLY_SOCIALS}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postNow: false,
      })
    });
    if (!scheduled.ok) {
      const schedData = await scheduled.json();
      console.error('OnlySocials Scheduling error:', schedData);
      throw new AppError(
        `OnlySocials Scheduling error: ${schedData} || 'Failed to confirm scheduled post'}`,
        true,
        scheduled.status
      );
    }
    return data as { id: string; uuid: string; name: string; hexColor: string };

  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(
      `Failed to schedule post on OnlySocials: ${error instanceof Error ? error.message : String(error)}`,
      true,
      500
    );
  }
};



export const reScheduleOnlySocialsPost = async (onlySocialsPostId: string, newPostSchedule: string, postContent: string) => {


  const scheduleDateTime = parseISO(newPostSchedule);
  const scheduleDate = format(scheduleDateTime, 'yyyy-MM-dd');
  const scheduleTime = format(scheduleDateTime, 'HH:mm');
  const ACCOUNT_ID = 44362;
  const API_URL = `https://app.onlysocial.io/os/api/${process.env.ONLY_SOCIALS_WORKSPACE}/posts/${onlySocialsPostId}`;

  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.ONLY_SOCIALS}`,
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify({
        accounts: [ACCOUNT_ID],
        versions: [{
          account_id: ACCOUNT_ID,
          is_original: true,
          content: [{
            body: postContent,
            media: [],
            url: ""
          }],
          options: {
            facebook_page: { type: "post" }
          }
        }],
        tags: [],
        date: scheduleDate,
        time: scheduleTime,
        until_date: null,
        until_time: "",
        repeat_frequency: null,
        short_link_provider: null,
        short_link_provider_id: null
      })
    });

    const data = await response.json() as { id: string; uuid: string; name: string; hexColor: string };

    if (!response.ok) {
      console.error('OnlySocials API error:', data);
      throw new AppError(
        `OnlySocials API error: ${data} || 'Failed to schedule post'}`,
        true,
        response.status
      );
    }

    return data as { id: string; uuid: string; name: string; hexColor: string };

  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(
      `Failed to schedule post on OnlySocials: ${error instanceof Error ? error.message : String(error)}`,
      true,
      500
    );
  }

};
/**
 * Convert file to base64 string
 */
export function fileToBase64(file: Express.Multer.File | string): string {
  // If it's a Multer file with buffer
  if (typeof file === 'object' && file.buffer) {
    return file.buffer.toString('base64');
  }

  // If it's a file path string
  if (typeof file === 'string') {
    const buffer = fs.readFileSync(file);
    return buffer.toString('base64');
  }

  // If it's a Multer file with path
  if (typeof file === 'object' && file.path) {
    const buffer = fs.readFileSync(file.path);
    return buffer.toString('base64');
  }

  throw new Error('Invalid file format');
}

export async function uploadMedia(
  file: Express.Multer.File | string,
  altText?: string
): Promise<MediaUploadResponse> {
  try {
    const fileName = typeof file === 'string'
      ? path.basename(file)
      : file.originalname;

    console.log(`📤 Uploading: ${fileName}`);
    
    // Debug: Check environment variables
    if (!process.env.ONLY_SOCIALS) {
      throw new Error('ONLY_SOCIALS token is not set');
    }
    if (!process.env.ONLY_SOCIALS_WORKSPACE) {
      throw new Error('ONLY_SOCIALS_WORKSPACE is not set');
    }

    // Convert file to base64
    const base64 = fileToBase64(file);
    
    // Debug: Log base64 length
    console.log('Base64 length:', base64.length);

    // Prepare request data
    const data = JSON.stringify({
      file: base64,
      alt_text: altText || fileName
    });

    // Axios config
    const config = {
      method: 'post',
      url: `https://app.onlysocial.io/os/api/${process.env.ONLY_SOCIALS_WORKSPACE.trim()}/media/`,
      headers: {
        'Authorization': `Bearer ${process.env.ONLY_SOCIALS.trim()}`,
        'Content-Type': 'application/json'
      },
      data: data
    };

    // Make the request
    const response = await axios(config);
    
    console.log(`✅ Uploaded: ${fileName} -> UUID: ${response.data.uuid}`);
    
    return response.data as MediaUploadResponse;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Axios error:', error.response?.data || error.message);
      throw new Error(`Upload failed: ${error.response?.data || error.message}`);
    }
    console.error(`❌ Failed to upload:`, error);
    throw error;
  }
}

export async function uploadMultipleMedia(
  files: (Express.Multer.File | string)[]
): Promise<MediaUploadResponse[]> {
  console.log(`📤 Uploading ${files.length} files...`);

  const uploadPromises = files.map(file => uploadMedia(file));
  const results = await Promise.all(uploadPromises);

  console.log(`✅ All ${files.length} files uploaded successfully`);
  return results;
}
