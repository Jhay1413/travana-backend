import { member, user } from "../schema/auth-schema";
import { db } from "../db/db";
import { and, eq } from "drizzle-orm";
import { organization } from "../schema/auth-schema";
import { userQuerySchema } from "../types/modules/user";
import z from "zod";
import { auth } from "@/lib/auth";


export type AuthRepo = {

    fetchOrganizationByUserId: (userId: string) => Promise<{ userId: string; role: string; organizationId: string }>,
    fetchOwnerOrganizationByOrgId: (orgId: string) => Promise<{ userId: string; role: string; organizationId: string }>,
    fetchUserByEmail: (email: string) => Promise<z.infer<typeof userQuerySchema> | null>,
}

export const authRepo: AuthRepo = {
    fetchOrganizationByUserId: async (userId: string) => {
        const response = await db.select({ userId: member.userId, role: member.role, organizationId: organization.id })
            .from(member).where(eq(member.userId, userId)).innerJoin(organization, eq(member.organizationId, organization.id))
            .limit(1)
        return response[0]
    },
    fetchOwnerOrganizationByOrgId: async (orgId: string) => {
        const response = await db.select({ userId: member.userId, role: member.role, organizationId: organization.id })
            .from(member)
            .where(and(eq(member.organizationId, orgId), eq(member.role, 'owner')))
            .innerJoin(organization, eq(member.organizationId, organization.id))
            .limit(1)
        return response[0]
    },
    fetchUserByEmail: async (email: string) => {
        const response = await db.query.user.findFirst({
            where: and(
                eq(user.email, email),

            ),
        });
        if (!response) return null
        return response
    },

}