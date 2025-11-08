import { AiController } from "../controllers/ai.controller";
import { Router } from "express";




const router = Router();


router.post("/generate-post", AiController.generatePost);


export default router;