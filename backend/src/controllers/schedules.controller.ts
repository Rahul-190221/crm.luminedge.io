import { Request, Response } from 'express';

const LUMINEDGE_API_URL = 'https://luminedge-server.vercel.app/api/v1/admin/get-schedules';

export const getAvailableSchedules = async (req: Request, res: Response) => {
  try {
    const response = await fetch(LUMINEDGE_API_URL, {
      headers: { Authorization: `Bearer ${process.env.LUMINEDGE_SERVICE_TOKEN}` },
    });

    if (!response.ok) {
      // Relay as a gateway error, not response.status verbatim — a failed upstream
      // (Luminedge) call can return 401/403 for reasons that have nothing to do with
      // *this* request's own (already-verified) auth, and forwarding it as-is misleads
      // the frontend into treating an integration failure as a CRM session problem.
      return res.status(502).json({
        success: false,
        message: 'Failed to fetch schedules from Luminedge API'
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching schedules from Luminedge:', error);
    res.status(503).json({
      success: false,
      message: 'Luminedge API is currently unavailable'
    });
  }
};
