import { betterAuth, BetterAuthOptions } from "better-auth";
import { organization } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import { usersTable } from "../schema/user-schema";
import { member } from "../schema/auth-schema";
import { fromNodeHeaders } from "better-auth/node";
import { send_registration_email_service, send_referrer_invitation_email_service } from "../service/email.service";
import { finalizeIssue } from "zod/v4/core/util.cjs";

const authConfig = {
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.ENVIRONMENT === "LOCAL" ? false : true,
      domain: process.env.SERVER_DOMAIN!, // your domain
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const new_url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

      await send_registration_email_service(new_url, user.name, user.email);
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: false,
  },
  trustedOrigins: [
    "https://www.travana.app",
    "http://localhost:4200",
    "http://localhost:5173",
    "https://travana-client.onrender.com",
    "https://travana-client-dev.onrender.com",
    "https://referral-dev.travana.app",
    "https://www.referral-dev.travana.app",
    'https://dev-travana-client.travana.app',
    'https://www.dev-travana-client.travana.app' // Add this line
  ],
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        required: true,
      },
      phoneNumber: {
        type: "string",
        required: true,
      },
      orgName: {
        type: "string",
        required: false,
      },                                                                                                                                                                              
      percentageCommission: {
        type: "number",
        required: false,
      },
    },
  },
  databaseHooks: {},
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.CLIENT_URL}/signup?token=${data.id}&email=${data.email}`;
        send_referrer_invitation_email_service(
          inviteLink,
          data.inviter.user.name,
          data.inviter.user.email,
          data.organization.name,
          data.email,
        );
      },
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig) as ReturnType<
  typeof betterAuth<typeof authConfig>
>;
