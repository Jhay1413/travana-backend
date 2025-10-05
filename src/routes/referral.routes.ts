import { Router } from 'express';
import { referralController } from '../controllers/referral.controller';

const router = Router();

// POST /api/referrals - Create a new referral request
router.post('/', referralController.createReferralRequest);

// GET /api/referrals - Fetch all referral requests
router.get('/', referralController.fetchReferralRequests);

// GET /api/referrals/:id - Fetch referral request by ID
router.get('/:id', referralController.fetchReferralRequestById);

// PUT /api/referrals/:id/status - Change referral request status
router.put('/:id/status', referralController.changeReferralRequestStatus);

// GET /api/referrals/user/:id - Fetch referrals by user ID
router.get('/user/:id', referralController.fetchReferralByUserId);

// GET /api/referrals/user/:id/stats - Fetch referrer stats by user ID
router.get('/user/:id/stats', referralController.fetchReferrerStatsByUserId);

// GET /api/referrals/user/:id/commission - Fetch referral commission by user ID
router.get('/user/:id/commission', referralController.fetchReferralCommissionByUserId);

export default router;
