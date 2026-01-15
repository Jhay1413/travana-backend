import { format, parseISO } from "date-fns";
import { AppError } from "../middleware/errorHandler";

export const scheduleOnlySocialsPost = async (postSchedule: string, postContent: string) => {
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