import { Request, Response } from 'express';
import Lead from '../models/Lead';
import User from '../models/User';
import { createAndEmitNotification, createAndEmitToAdmins, createAndEmitToRoles } from '../services/notification.service';

const PHONE_LOOKUP_MESSAGE = 'This number already exists. Already used, try with another number.';

const normalizePhoneDigits = (value: unknown): string => String(value ?? '').replace(/\D/g, '');
const escapeRegex = (value: string): string => value.split('').map((ch) => /[a-zA-Z0-9 ]/.test(ch) ? ch : '\\' + ch).join('');

const getPhoneCandidates = async (query: string, limit = 8, excludeId?: string) => {
  const normalizedQuery = normalizePhoneDigits(query);
  if (!normalizedQuery) return { suggestions: [], exactMatch: false };

  const safeQuery = escapeRegex(normalizedQuery);
  const filter: Record<string, any> = {
    phone: { $regex: safeQuery, $options: 'i' }
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const leads = await Lead.find(filter)
    .select('fullName phone whom createdAt')
    .sort({ createdAt: -1 })
    .limit(Math.max(limit, 1) * 4)
    .lean();

  const seen = new Set<string>();
  const suggestions: Array<{ _id: string; fullName: string; phone: string; whom?: string }> = [];
  let exactMatch = false;

  for (const lead of leads) {
    const normalizedPhone = normalizePhoneDigits((lead as any).phone);
    if (!normalizedPhone || seen.has(normalizedPhone)) continue;

    seen.add(normalizedPhone);

    if (normalizedPhone === normalizedQuery) {
      exactMatch = true;
    }

    suggestions.push({
      _id: String((lead as any)._id),
      fullName: (lead as any).fullName,
      phone: (lead as any).phone,
      whom: (lead as any).whom,
    });

    if (suggestions.length >= limit) break;
  }

  return { suggestions, exactMatch };
};

const assertPhoneIsUnique = async (phone: string, excludeId?: string) => {
  const { exactMatch } = await getPhoneCandidates(phone, 1, excludeId);
  return exactMatch;
};
// Get all leads
export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stage, source, assignedTo, search, unassigned } = req.query;

    const filter: any = {};

    if (unassigned === 'true') {
      filter.$or = [{ assignedTo: { $exists: false } }, { assignedTo: null }];
    }

    if (stage && stage !== 'All') {
      filter.lifecycleStage = stage;
    }

    if (source && source !== 'All') {
      filter.source = source;
    }

    if (assignedTo && unassigned !== 'true') {
      filter.assignedTo = assignedTo;
    }

    if (search) {
      const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 200);
      filter.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

// Phone lookup for suggestions and duplicate checking
export const lookupLeadPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = String(req.query.query ?? req.query.phone ?? '').trim();
    const limit = Number.parseInt(String(req.query.limit ?? '8'), 10);

    if (!query) {
      res.json({ suggestions: [], exactMatch: false });
      return;
    }

    const { suggestions, exactMatch } = await getPhoneCandidates(query, Number.isNaN(limit) ? 8 : Math.min(Math.max(limit, 1), 20));
    res.json({ suggestions, exactMatch });
  } catch (error) {
    console.error('Error looking up phone suggestions:', error);
    res.status(500).json({ error: 'Failed to lookup phone suggestions' });
  }
};
// Get single lead
export const getLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
};

// Create lead
export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, whom, source, serviceInterest, assignedTo, notes, followUps, lifecycleStage } = req.body;

    // Process follow-ups to convert date strings to Date objects
    const processedFollowUps = followUps?.map((fu: any) => ({
      date: fu.date ? new Date(fu.date) : undefined,
      note: fu.note,
      nextFollowUpDate: fu.nextFollowUpDate ? new Date(fu.nextFollowUpDate) : undefined
    })).filter((fu: any) => fu.date || fu.note || fu.nextFollowUpDate) || [];

    if (await assertPhoneIsUnique(phone)) {
      res.status(409).json({ error: PHONE_LOOKUP_MESSAGE });
      return;
    }

    const lead = new Lead({
      fullName,
      ...(email && email.trim() ? { email: email.trim() } : {}),
      phone,
      whom,
      source: source || 'Website',
      serviceInterest,
      assignedTo: assignedTo || undefined,
      notes,
      followUps: processedFollowUps,
      lifecycleStage: lifecycleStage || 'Intake'
    });

    await lead.save();

    // Populate assignedTo before sending response
    await lead.populate('assignedTo', 'name email');

    // Notify admins in background (don't block response)
    const reqUser = (req as any).user;
    try {
      const creator = await User.findById(reqUser?.userId).select('name role');
      const creatorName = creator?.name || 'A BDM';
      await createAndEmitToAdmins(
        'New Lead Added',
        `${creatorName} added a new lead: ${fullName}`,
        'info'
      );
      // If assigned to someone other than creator, notify them too
      if (assignedTo && assignedTo !== reqUser?.userId) {
        await createAndEmitNotification(
          assignedTo,
          'Lead Assigned to You',
          `New lead assigned: ${fullName}`,
          'info'
        );
      }
    } catch (notifErr) {
      console.error('Notification error on createLead:', notifErr);
    }

    res.status(201).json(lead);
  } catch (error: any) {
    console.error('Error creating lead:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create lead' });
    }
  }
};

// Update lead
export const updateLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { followUps, fullName, email, phone, whom, source, serviceInterest, assignedTo, notes, lifecycleStage } = req.body;

    const updateData: Record<string, any> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) {
      if (await assertPhoneIsUnique(phone, req.params.id)) {
        res.status(409).json({ error: PHONE_LOOKUP_MESSAGE });
        return;
      }
      updateData.phone = phone;
    }
    if (whom !== undefined) updateData.whom = whom;
    if (source !== undefined) updateData.source = source;
    if (serviceInterest !== undefined) updateData.serviceInterest = serviceInterest;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (notes !== undefined) updateData.notes = notes;
    if (lifecycleStage !== undefined) updateData.lifecycleStage = lifecycleStage;

    if (followUps) {
      updateData.followUps = followUps.map((fu: any) => ({
        date: fu.date ? new Date(fu.date) : undefined,
        note: fu.note,
        nextFollowUpDate: fu.nextFollowUpDate ? new Date(fu.nextFollowUpDate) : undefined
      })).filter((fu: any) => fu.date || fu.note || fu.nextFollowUpDate);
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json(lead);
  } catch (error: any) {
    console.error('Error updating lead:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update lead' });
    }
  }
};

// Delete lead
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};

// Add follow-up to lead
export const addFollowUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, note, nextFollowUpDate } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          followUps: {
            date: date ? new Date(date) : undefined,
            note,
            nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
            createdAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json(lead);
  } catch (error) {
    console.error('Error adding follow-up:', error);
    res.status(500).json({ error: 'Failed to add follow-up' });
  }
};

// Update lead stage
export const updateLeadStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lifecycleStage } = req.body;
    const reqUser = (req as any).user;

    if (!['Intake', 'Processing', 'Hot', 'Converted', 'Dead'].includes(lifecycleStage)) {
      res.status(400).json({ error: 'Invalid lifecycle stage' });
      return;
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { lifecycleStage },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    // Notify Admins and Other BDMs about the change
    try {
      const user = await User.findById(reqUser?.userId).select('name role');
      const actorName = user?.name || 'A BDM';

      // 1. Notify Admins
      await createAndEmitToAdmins(
        'Lead Stage Updated',
        `${actorName} updated lead "${lead.fullName}" to ${lifecycleStage}`,
        lifecycleStage === 'Converted' ? 'success' : 'info'
      );

      // 2. Notify other BDMs
      await createAndEmitToRoles(
        ['bdm'],
        'Lead Stage Updated',
        `${actorName} updated lead "${lead.fullName}" to ${lifecycleStage}`,
        'info',
        reqUser?.userId
      );
    } catch (notifErr) {
      console.error('Notification error on updateLeadStage:', notifErr);
    }

    res.json(lead);
  } catch (error) {
    console.error('Error updating lead stage:', error);
    res.status(500).json({ error: 'Failed to update lead stage' });
  }
};

// Get all BDMs (users with bdm role)
export const getBDMs = async (req: Request, res: Response): Promise<void> => {
  try {
    const bdms = await User.find({
      role: { $in: ['bdm', 'senior-bdm', 'junior-bdm', 'admin'] },
      isActive: true
    }).select('_id name email role');

    res.json(bdms);
  } catch (error) {
    console.error('Error fetching BDMs:', error);
    res.status(500).json({ error: 'Failed to fetch BDMs' });
  }
};

// Import leads from CSV
export const importLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leads } = req.body;

    if (!leads || !Array.isArray(leads)) {
      res.status(400).json({ error: 'Invalid leads data. Expected array of leads.' });
      return;
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const leadData of leads) {
      try {
        const email = leadData.email?.toLowerCase().trim();
        if (!email) { failed++; errors.push(`Row skipped: missing email`); continue; }

        const toDate = (v: any): Date | undefined => {
          if (!v) return undefined;
          const d = new Date(v);
          return isNaN(d.getTime()) ? undefined : d;
        };
        const processedFollowUps = Array.isArray(leadData.followUps)
          ? leadData.followUps
              .map((fu: any) => ({
                date: toDate(fu.date),
                note: fu.note || '',
                nextFollowUpDate: toDate(fu.nextFollowUpDate),
              }))
              .filter((fu: any) => fu.date || fu.nextFollowUpDate)
          : [];

        const existing = await Lead.findOne({ email });

        if (existing) {
          // Build $set for scalar fields
          const setFields: any = {
            fullName:        leadData.fullName        || existing.fullName,
            phone:           leadData.phone           || existing.phone,
            source:          leadData.source          || existing.source,
            serviceInterest: leadData.serviceInterest || existing.serviceInterest,
            lifecycleStage:  leadData.lifecycleStage  || existing.lifecycleStage,
          };
          if (leadData.notes !== undefined && leadData.notes !== null) {
            setFields.notes = leadData.notes;
          }

          const updateOp: any = { $set: setFields };

          if (processedFollowUps.length > 0) {
            if (!existing.followUps || existing.followUps.length === 0) {
              // No existing follow-ups — replace entirely
              setFields.followUps = processedFollowUps;
            } else {
              // Append only entries with a new date
              const existingDates = new Set(
                existing.followUps.map((f: any) => f.date?.toISOString?.() ?? '')
              );
              const newOnes = processedFollowUps.filter(
                (f: any) => !existingDates.has(f.date?.toISOString?.() ?? '')
              );
              if (newOnes.length > 0) {
                updateOp.$push = { followUps: { $each: newOnes } };
              }
            }
          }

          await Lead.updateOne({ email }, updateOp);
          imported++;
        } else {
          const lead = new Lead({
            fullName: leadData.fullName,
            email,
            phone: leadData.phone,
            source: leadData.source || 'Other',
            serviceInterest: leadData.serviceInterest,
            notes: leadData.notes,
            lifecycleStage: leadData.lifecycleStage || 'Intake',
            followUps: processedFollowUps
          });
          await lead.save();
          imported++;
        }
      } catch (error: any) {
        failed++;
        errors.push(`Row ${imported + failed}: ${error.message}`);
      }
    }

    res.json({
      imported,
      failed,
      errors: errors.slice(0, 10) // Return first 10 errors
    });
  } catch (error) {
    console.error('Error importing leads:', error);
    res.status(500).json({ error: 'Failed to import leads' });
  }
};

// Get lead statistics
export const getLeadStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: '$lifecycleStage',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLeads = await Lead.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newLeadsToday = await Lead.countDocuments({ createdAt: { $gte: todayStart } });

    res.json({
      total: totalLeads,
      newToday: newLeadsToday,
      byStage: stats.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({ error: 'Failed to fetch lead statistics' });
  }
};

// Assign leads to BDM
export const assignLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leadIds, bdmId } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      res.status(400).json({ error: 'Lead IDs are required' });
      return;
    }

    if (!bdmId) {
      res.status(400).json({ error: 'BDM ID is required' });
      return;
    }

    // Verify BDM exists
    const bdm = await User.findById(bdmId);
    if (!bdm) {
      res.status(404).json({ error: 'BDM not found' });
      return;
    }

    // Update all leads
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      {
        $set: {
          assignedTo: bdmId,
          assignedAt: new Date()
        }
      }
    );

    // Notify the BDM
    try {
      await createAndEmitNotification(
        bdmId,
        'Leads Assigned to You',
        `${result.modifiedCount} lead(s) have been assigned to you`,
        'info'
      );
    } catch (notifErr) {
      console.error('Notification error on assignLeads:', notifErr);
    }

    res.json({
      message: `Successfully assigned ${result.modifiedCount} lead(s) to ${bdm.name}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error assigning leads:', error);
    res.status(500).json({ error: 'Failed to assign leads' });
  }
};
