// Prisma 7 configuration
// Specifies the database connection URL from environment
export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
