import { Router } from 'express';
import { quoteController } from '../controllers/quote.controller';

const router = Router();

// Quote conversion and creation
router.post('/convert/:transaction_id', quoteController.convertQuote);
router.post('/', quoteController.insertQuote);
router.post('/duplicate', quoteController.duplicateQuote);

// Quote fetching
router.get('/', quoteController.fetchQuotes);
router.get('/travel-deals', quoteController.fetchTravelDeals);
router.get('/summary/client/:id', quoteController.fetchQuoteSummaryByClient);
router.get('/summary/agent/:agent_id', quoteController.fetchQuoteSummaryByAgent);
router.get('/:id', quoteController.fetchQuoteById);
router.get('/for-update/:id', quoteController.fetchPackageToUpdate);
router.get('/title', quoteController.fetchQuoteTitle);
router.get('/free/infinite', quoteController.fetchFreeQuotesInfinite);

// Quote updates
router.put('/:id', quoteController.updateQuote);
router.put('/:id/status', quoteController.convertQuoteStatus);
router.put('/:id/primary', quoteController.setPrimary);
router.put('/:id/expiry', quoteController.updateQuoteExpiry);
router.put('/:id/future-deal', quoteController.setFutureDealDate);
router.put('/:id/unset-future-deal', quoteController.unsetFutureDealDate);
router.put('/:id/generate-post', quoteController.generatePostContent);

// Quote deletion
router.delete('/:id', quoteController.deleteQuote);

export default router;
