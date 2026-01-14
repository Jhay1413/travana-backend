
import { onlySocialsController } from '../controllers/only-socials.controller';
import { Router } from 'express';


const router = Router();


router.get('/', onlySocialsController.listOfPosts);



export default router;

