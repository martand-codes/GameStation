import { PrismaClient, Role, GameStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seed...');

  await prisma.game.deleteMany();
  await prisma.user.deleteMany({
    where: { email: 'dev@gamestation.com' },
  });

  // Dummy Developer
  const hashedPassword = await bcrypt.hash('password123', 10);
  const developer = await prisma.user.create({
    data: {
      email: 'dev@gamestation.com',
      username: 'GameStationStudios',
      password: hashedPassword,
      role: Role.DEVELOPER,
      isActive: true,
    },
  });

  console.log(`Created Developer User: ${developer.username}`);

  // Dummy Games 
  const gamesData = [
    {
      title: 'Neon Drift',
      genre: 'Racing',
      description: 'Experience high-speed cyber-racing in a neon-drenched metropolis. Customize your hover-car and compete against players worldwide in this adrenaline-pumping arcade racer.',
      tags: ['Cyberpunk', 'Multiplayer', 'Arcade', 'Fast-paced'],
      price: 29.99,
      isFree: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1547636735-f018e614bb5f?q=80&w=600&auto=format&fit=crop', // Abstract neon lights
      bannerImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1920&auto=format&fit=crop',
    },
    {
      title: 'Galactic Vanguard',
      genre: 'Shooter',
      description: 'Command your squad in this tactical sci-fi shooter. Defend humanity from the invading alien armada across multiple distinct planets. Features an epic single-player campaign and co-op multiplayer.',
      tags: ['Sci-Fi', 'FPS', 'Co-op', 'Tactical'],
      isFree: false,
      editions: [
        { editionName: 'Standard Edition', price: 59.99, features: ['Base Game'] },
        { editionName: 'Deluxe Edition', price: 79.99, features: ['Base Game', 'Digital Soundtrack', 'Exclusive Armor'] },
        { editionName: 'Ultimate Edition', price: 99.99, features: ['Base Game', 'Digital Soundtrack', 'Exclusive Armor', 'Season Pass'] },
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=600&auto=format&fit=crop', // Space/Sci-fi
      bannerImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop',
      screenshots: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1920&auto=format&fit=crop'
      ],
      trailerUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      telemetry: {
        mainStoryHours: 10.5,
        mainExtrasHours: 15.0,
        completionistHours: 22.0
      }
    },
    {
      title: 'Fantasy Quest: Origins',
      genre: 'RPG',
      description: 'Embark on a grand adventure in a sprawling open world filled with magic, monsters, and ancient mysteries. Forge your own path, choose your class, and become the hero of the realm.',
      tags: ['Open World', 'Fantasy', 'Story Rich', 'Singleplayer'],
      price: 49.99,
      isFree: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop', // Fantasy landscape
      bannerImageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1920&auto=format&fit=crop',
    },
    {
      title: 'Shadows of the Past',
      genre: 'Horror',
      description: 'A terrifying psychological horror experience. Explore an abandoned asylum where your worst fears come to life. Solve puzzles, hide from entities, and uncover the dark truth.',
      tags: ['Psychological', 'Survival Horror', 'Atmospheric'],
      price: 19.99,
      isFree: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=600&auto=format&fit=crop', // Creepy/Dark
      bannerImageUrl: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=1920&auto=format&fit=crop',
    },
    {
      title: 'Pixel Farm',
      genre: 'Simulation',
      description: 'Relax and build the farm of your dreams in this charming pixel-art simulation game. Grow crops, raise animals, mine for resources, and befriend the local townsfolk.',
      tags: ['Cozy', 'Farming Sim', 'Pixel Art', 'Casual'],
      price: 0,
      isFree: true,
      coverImageUrl: 'https://images.unsplash.com/photo-1595085731671-551eb6368d95?q=80&w=600&auto=format&fit=crop', // Nature/Farm related abstract
      bannerImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop',
    }
  ];

  // Seeding
  for (const gameData of gamesData) {
    const game = await prisma.game.create({
      data: {
        title: gameData.title,
        genre: gameData.genre,
        description: gameData.description,
        tags: gameData.tags,
        status: GameStatus.PUBLISHED,
        developerId: developer.id,
        pricing: {
          create: (gameData as any).editions ? (gameData as any).editions.map((e: any) => ({
            editionName: e.editionName,
            price: e.price,
            features: e.features,
            isFree: gameData.isFree,
            currency: 'INR',
          })) : [
            {
              editionName: 'Standard Edition',
              price: gameData.price || 0,
              features: ['Base Game'],
              isFree: gameData.isFree,
              currency: 'INR',
            }
          ],
        },
        media: {
          create: {
            coverImageUrl: gameData.coverImageUrl,
            bannerImageUrl: gameData.bannerImageUrl,
            screenshots: (gameData as any).screenshots || [],
            trailerUrl: (gameData as any).trailerUrl || null,
          },
        },
        telemetry: (gameData as any).telemetry ? {
          create: {
            mainStoryHours: (gameData as any).telemetry.mainStoryHours,
            mainExtrasHours: (gameData as any).telemetry.mainExtrasHours,
            completionistHours: (gameData as any).telemetry.completionistHours,
          }
        } : undefined,
        versions: {
          create: {
            version: '1.0.0',
            changelog: 'Initial release launch.',
          },
        },
      },
    });
    console.log(`Created Game: ${game.title}`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(' Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
