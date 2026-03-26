import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaBase: PrismaClient | undefined;
};

const prismaBase = globalForPrisma.prismaBase ?? new PrismaClient();
globalForPrisma.prismaBase = prismaBase;

// Helper to add { deletedAt: null } filter to a query's where clause
function addSoftDeleteFilter(args: any) {
  args.where = { ...args.where, deletedAt: null };
  return args;
}

// Build soft-delete query overrides for a model
function softDeleteQueries() {
  return {
    async findMany({ args, query }: any) {
      return query(addSoftDeleteFilter(args));
    },
    async findFirst({ args, query }: any) {
      return query(addSoftDeleteFilter(args));
    },
    async count({ args, query }: any) {
      return query(addSoftDeleteFilter(args));
    },
    // findUnique is NOT filtered — admin/detail pages need to check deletedAt manually
  };
}

// Extended Prisma client that auto-filters soft-deleted records on public queries
export const prisma = prismaBase.$extends({
  query: {
    repairRequest: softDeleteQueries(),
    job: softDeleteQueries(),
    offer: softDeleteQueries(),
    conversation: softDeleteQueries(),
    review: softDeleteQueries(),
  },
});

// Unfiltered client for admin trash queries (finding deleted items)
export const prismaUnfiltered = prismaBase;

export default prisma;
