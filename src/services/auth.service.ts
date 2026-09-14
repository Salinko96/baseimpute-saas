import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function syncUserWithDatabase(supabaseUser: any) {

  // Ensure the organization exists (create a default one for new users if needed)
  let organization = await prisma.organization.findFirst({
    where: { name: 'Default Organization' },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: { name: 'Default Organization' },
    });
  }

  // Create or update the User in our application database
  await prisma.user.upsert({
    where: { email: supabaseUser.email },
    update: {
      name: supabaseUser.user_metadata?.full_name || 'Unknown User',
    },
    create: {
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || 'New User',
      password: 'managed-by-supabase', // Not stored in plain text in reality
      organizationId: organization.id,
      role: 'DECLARANT',
    },
  });
}
