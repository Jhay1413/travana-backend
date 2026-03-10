import { auth } from '../src/lib/auth';

const users = [
  {
    name: 'James Love',
    email: 'james@tweetlocator.co.uk',
    firstName: 'James',
    lastName: 'Love',
    phoneNumber: '',
    role: 'admin',
  },
  {
    name: 'Casey Ashman',
    email: 'casey@tinastraveldeals.co.uk',
    firstName: 'Casey',
    lastName: 'Ashman',
    phoneNumber: '07553 013391',
    role: 'user',
  },
  {
    name: 'Jhon Christian Ubaldo',
    email: 'jhon041413@gmail.com',
    firstName: 'Jhon Christian',
    lastName: 'Ubaldo',
    phoneNumber: '0935 6162 084',
    role: 'admin',
  },
  {
    name: 'Tia Morgan',
    email: 'tia@tinastraveldeals.co.uk',
    firstName: 'Tia',
    lastName: 'Morgan',
    phoneNumber: '07368416475',
    role: 'user',
  },
  {
    name: 'Tina Love',
    email: 'tina@tinastraveldeals.co.uk',
    firstName: 'Tina',
    lastName: 'Love',
    phoneNumber: '07809 130111',
    role: 'admin',
  },
  {
    name: 'Mason Halliman',
    email: 'mason@tinastraveldeals.co.uk',
    firstName: 'Mason',
    lastName: 'Halliman',
    phoneNumber: '07931341625',
    role: 'admin',
  },
];

async function seedUsers() {
  console.log('🌱 Seeding users...');

  for (const u of users) {
    try {
      const response = await auth.api.signUpEmail({
        body: {
          name: u.name,
          email: u.email,
          password: '@Travana2026',
          firstName: u.firstName,
          lastName: u.lastName,
          phoneNumber: u.phoneNumber,
          role: u.role,
        },
      });

      if (response) {
        console.log(`✅ Created user: ${u.email} (id: ${response.user.id})`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to create user ${u.email}:`, error?.message ?? error);
    }
  }

  console.log('✅ Done seeding users.');
}

seedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
