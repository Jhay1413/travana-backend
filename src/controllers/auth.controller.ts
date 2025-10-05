import { AuthService } from "../service/auth.service";
import { Request, Response } from "express";
import { authRepo } from "../repository/auth.repo";
const service = AuthService(authRepo);

export const authController = {

    acceptInvitation: async (req: Request, res: Response) => {
        try {
            const { invitationId } = req.params;
            await service.verifyInvitation(invitationId, req.headers);
            res.status(200).json({ message: 'Invitation accepted successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    createInvitation: async (req: Request, res: Response) => {

        try {
            const { email, role, organizationId ,firstName,lastName,contactNumber} = req.body;
            await service.createInvitation(email, role, organizationId, req.headers, firstName, lastName, contactNumber);
            res.status(201).json({ message: 'Invitation created successfully' });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }

    },
}