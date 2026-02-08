import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Delete existing data
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Cameras',
        slug: 'cameras',
        description: 'Digital and film cameras',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lenses',
        slug: 'lenses',
        description: 'Camera lenses and optics',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lighting',
        slug: 'lighting',
        description: 'Flash, LED, and studio lighting',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tripods & Stands',
        slug: 'tripods',
        description: 'Tripods and camera stands',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bags & Cases',
        slug: 'bags',
        description: 'Camera bags and protective cases',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Other photography accessories',
      },
    }),
  ]);

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'seller1@example.com',
      password_hash: hashedPassword,
      first_name: 'John',
      last_name: 'Doe',
      location: 'Johannesburg',
      bio: 'Photography enthusiast and gear collector',
      email_verified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'seller2@example.com',
      password_hash: hashedPassword,
      first_name: 'Jane',
      last_name: 'Smith',
      location: 'Cape Town',
      bio: 'Professional photographer',
      email_verified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      password_hash: hashedPassword,
      first_name: 'Mike',
      last_name: 'Johnson',
      location: 'Durban',
      bio: 'Photography hobbyist',
      email_verified: true,
    },
  });

  // Create test listings
  await prisma.listing.create({
    data: {
      user_id: user1.id,
      title: 'Canon EOS 5D Mark IV - Excellent Condition',
      description: 'Used Canon EOS 5D Mark IV with 2 lenses. Only 15,000 shutter count. Excellent condition.',
      category_id: categories[0].id,
      condition: 'excellent',
      price_zar: 18000,
      location: 'Johannesburg',
      image_urls: [
        'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill/https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Canon_eos_5D_mkIV.jpg/1280px-Canon_eos_5D_mkIV.jpg',
      ],
      specifications: {
        brand: 'Canon',
        model: 'EOS 5D Mark IV',
        resolution: '30.4 MP',
        sensor: 'Full Frame',
      },
    },
  });

  await prisma.listing.create({
    data: {
      user_id: user2.id,
      title: 'Nikon 70-200mm f/2.8 VR Lens',
      description: 'Professional telephoto lens. Minimal wear. Perfect for sports and wildlife photography.',
      category_id: categories[1].id,
      condition: 'good',
      price_zar: 12000,
      location: 'Cape Town',
      image_urls: [
        'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill/https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Nikkor_70-200mm_f_2.8G_VR.jpg/1024px-Nikkor_70-200mm_f_2.8G_VR.jpg',
      ],
      specifications: {
        brand: 'Nikon',
        model: 'AF-S VR Zoom-Nikkor 70–200mm f/2.8G IF-ED',
        focal_length: '70-200mm',
        max_aperture: 'f/2.8',
      },
    },
  });

  await prisma.listing.create({
    data: {
      user_id: user1.id,
      title: 'Manfrotto Tripod with Ball Head',
      description: 'Heavy-duty aluminum tripod. Very stable. Includes ball head.',
      category_id: categories[3].id,
      condition: 'good',
      price_zar: 3500,
      location: 'Johannesburg',
      image_urls: [
        'https://res.cloudinary.com/demo/image/fetch/w_500,h_500,c_fill/https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Manfrotto_tripod.jpg/960px-Manfrotto_tripod.jpg',
      ],
      specifications: {
        brand: 'Manfrotto',
        type: 'Aluminum tripod',
        max_height: '170 cm',
        payload: '8 kg',
      },
    },
  });

  // Create a test message
  await prisma.message.create({
    data: {
      listing_id: (await prisma.listing.findFirst())!.id,
      sender_id: user3.id,
      recipient_id: user1.id,
      message_body: 'Hi, is this still available? Would you accept R17,500?',
    },
  });

  console.log('✓ Database seeded successfully');
  console.log('\nTest credentials:');
  console.log('Seller 1: seller1@example.com / password123');
  console.log('Seller 2: seller2@example.com / password123');
  console.log('Buyer: buyer@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
