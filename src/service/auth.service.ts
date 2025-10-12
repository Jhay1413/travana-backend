import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { IncomingHttpHeaders } from "http";
import { db } from "../db/db";
import { organization, member, user } from "../schema/auth-schema";
import { and, eq } from "drizzle-orm";
import { AuthRepo } from "../repository/auth.repo";

//For optimization we can use the user repo to check if the user already exists
export const AuthService = (repo: AuthRepo) => {


    return {
        verifyInvitation: async (invitationId: string, headers: IncomingHttpHeaders) => {
            await auth.api.acceptInvitation({
                body: {
                    invitationId: invitationId,
                },
                headers: await fromNodeHeaders(headers),
            });
            return
        },
        createInvitation: async (email: string, role: string, organizationId: string, headers: IncomingHttpHeaders, firstName: string, lastName: string, contactNumber: string) => {

            const user = await repo.fetchUserByEmail(email)

            if (user) {

                await auth.api.createInvitation({
                    body: {
                        email: email,
                        role: role as 'owner' | 'admin' | 'member',
                        organizationId: organizationId,

                    },
                    headers: await fromNodeHeaders(headers),
                });
                return
            }
            else {
                await auth.api.signUpEmail({
                    body: {
                        email: email,
                        password: contactNumber,
                        firstName: firstName,
                        lastName: lastName,
                        name: `${firstName} ${lastName}`,
                        role: role as 'owner' | 'admin' | 'member',
                        phoneNumber: contactNumber,
                        percentageCommission:25,
                    },
                    headers: await fromNodeHeaders(headers),
                });

                await auth.api.createInvitation({
                    body: {
                        email: email,
                        role: role as 'owner' | 'admin' | 'member',
                        organizationId: organizationId,
                    },
                    headers: await fromNodeHeaders(headers),
                });
                return
            }


        },

        fetchOrganizationByUserId: async (userId: string) => {


            return await repo.fetchOrganizationByUserId(userId)

        },
        fetchOwnerOrganizationByOrgId: async (orgId: string) => {
            return await repo.fetchOwnerOrganizationByOrgId(orgId)
        }
        

    }
}