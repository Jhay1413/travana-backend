
import { onlySocialsService } from '../service/only-socials.service';
import { Request, Response } from 'express';
const service = onlySocialsService();
export const onlySocialsController = {

    listOfPosts: async (req: Request, res: Response) => {
        try {
            const { page } = req.query;
            const posts = await service.listOfPosts(Number(page) || 1);
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    }

}