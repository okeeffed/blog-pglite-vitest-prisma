import type { PrismaClient, User, Role } from "../generated/prisma";

export interface CreateUserData {
  email: string;
  name?: string;
  role?: Role;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: Role;
}

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get user by ID
   */
  async getUser(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserData) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role || "USER",
      },
    });
  }

  /**
   * Update user
   */
  async updateUser(id: number, data: UpdateUserData) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: number) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      // Handle user not found
      return false;
    }
  }
}
