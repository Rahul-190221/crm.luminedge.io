const cron = require('node-cron') as {
  schedule: (expression: string, callback: () => void) => void;
};

import Lead from '../models/Lead';
import { createAndEmitNotification, createAndEmitToAdmins } from './notification.service';

export function initScheduler(): void {
  cron.schedule('0 10 * * *', async () => {
    console.log('[Scheduler] Running follow-up due date check...');
    try {
      await checkFollowUpsDueToday();
    } catch (err) {
      console.error('[Scheduler] Error in follow-up job:', err);
    }
  });

  console.log('[Scheduler] Daily follow-up cron registered (09:00 server time).');
}

async function checkFollowUpsDueToday(): Promise<void> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Check the LAST followUp element's nextFollowUpDate via aggregation
  // (plain find with dot-notation matches ANY element, not just the last one)
  const leads = await Lead.aggregate([
    {
      $match: {
        'followUps.0': { $exists: true },
        assignedTo: { $exists: true, $ne: null },
        'followUps.nextFollowUpDate': { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $addFields: { lastFollowUp: { $last: '$followUps' } },
    },
    {
      $match: {
        'lastFollowUp.nextFollowUpDate': { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assignedTo',
        foreignField: '_id',
        as: 'assignedUser',
      },
    },
    { $unwind: '$assignedUser' },
  ]);

  console.log(`[Scheduler] Found ${leads.length} lead(s) with follow-up due today.`);

  for (const lead of leads) {
    const bdmId: string = lead.assignedTo.toString();
    const bdmName: string = lead.assignedUser?.name ?? 'Your BDM';
    const leadName: string = lead.fullName ?? 'a lead';

    try {
      await createAndEmitNotification(
        bdmId,
        'Follow-up Due Today',
        `You have a follow-up due today for ${leadName}`,
        'warning'
      );
    } catch (err) {
      console.error(`[Scheduler] BDM notification failed for lead ${lead._id}:`, err);
    }

    try {
      await createAndEmitToAdmins(
        'Follow-up Due Today',
        `${bdmName} has a follow-up due today for lead: ${leadName}`,
        'info'
      );
    } catch (err) {
      console.error(`[Scheduler] Admin notification failed for lead ${lead._id}:`, err);
    }
  }
}
