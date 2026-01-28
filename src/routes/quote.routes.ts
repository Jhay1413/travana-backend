import { Router } from 'express';
import { quoteController } from '../controllers/quote.controller';
import { uploadDealImages, uploadMultiple } from '../middleware/upload';

const router = Router();

// Quote conversion and creation
router.post('/convert/:transaction_id', quoteController.convertQuote);
router.post('/', quoteController.insertQuote);
router.post('/duplicate', quoteController.duplicateQuote);
router.post('/schedule-post/:id', uploadMultiple, quoteController.scheduleTravelDeal);
// Quote fetching
router.get('/', quoteController.fetchQuotes);
router.get('/today-social-deals', quoteController.fetchTodaySocialDeals);
router.get('/travel-deals', quoteController.fetchTravelDeals);
router.get('/summary/client/:id', quoteController.fetchQuoteSummaryByClient);
router.get('/summary/agent/:agent_id', quoteController.fetchQuoteSummaryByAgent);
router.get('/:id', quoteController.fetchQuoteById);
router.get('/for-update/:id', quoteController.fetchPackageToUpdate);
router.get('/title', quoteController.fetchQuoteTitle);
router.get('/free/infinite', quoteController.fetchFreeQuotesInfinite);
router.get('/travel-deal/:id', quoteController.fetchTravelDealByQuoteId);
router.put('/update-free-quote/:id', quoteController.updateFreeQuote);
// Quote updates


router.put('/:id/status', quoteController.convertQuoteStatus);
router.put('/:id/primary', quoteController.setPrimary);
router.put('/:id/expiry', quoteController.updateQuoteExpiry);
router.put('/:id/future-deal', quoteController.setFutureDealDate);
router.put('/:id/unset-future-deal', quoteController.unsetFutureDealDate);
router.put('/:id/generate-post', quoteController.generatePostContent);
router.put('/:id/free-quote', quoteController.updateFreeQuote);
router.put('/:id', quoteController.updateQuote);

// Quote deletion
router.delete('/:id', quoteController.deleteQuote);
router.delete('/travel-deal/:id', quoteController.deleteTravelDeal);
router.delete('/free-quote/:id', quoteController.deleteFreeQuote);

export default router;
