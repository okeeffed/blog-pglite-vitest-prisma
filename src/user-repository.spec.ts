import { beforeEach, describe, expect, it } from "vitest";
import { UserRepository } from "./user-repository";
import { faker } from "@faker-js/faker";
import { fail } from "node:assert";

describe("UserRepository", () => {
  let userRepo: UserRepository;

  beforeEach(() => {
    userRepo = new UserRepository(global.testPrisma);
  });

  describe("getUser", () => {
    it("should return user by ID", async () => {
      const user = await global.testPrisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
        },
      });

      const result = await userRepo.getUser(user.id);
      if (!result) {
        fail("Result was null");
      }

      expect(result).not.toBeNull();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });

    it("should return null for non-existent user", async () => {
      const result = await userRepo.getUser(99999);
      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create user with all fields", async () => {
      const userData = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: "ADMIN" as const,
      };

      const result = await userRepo.createUser(userData);

      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result.role).toBe(userData.role);
      expect(result.id).toBeDefined();
    });

    it("should create user with default role when not specified", async () => {
      const userData = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
      };

      const result = await userRepo.createUser(userData);

      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result.role).toBe("USER");
    });

    it("should create user without name (optional field)", async () => {
      const userData = {
        email: faker.internet.email(),
      };

      const result = await userRepo.createUser(userData);

      expect(result.email).toBe(userData.email);
      expect(result.name).toBeNull();
      expect(result.role).toBe("USER");
    });

    it("should throw error for duplicate email", async () => {
      const email = faker.internet.email();

      await userRepo.createUser({
        email,
        name: faker.person.fullName(),
      });

      await expect(
        userRepo.createUser({
          email, // Same email
          name: faker.person.fullName(),
        }),
      ).rejects.toThrow();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const user = await global.testPrisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: "USER",
        },
      });

      const updateData = {
        name: faker.person.fullName(),
        role: "ADMIN" as const,
      };

      const result = await userRepo.updateUser(user.id, updateData);
      if (!result) {
        fail("Update result was null");
      }

      expect(result.id).toBe(user.id);
      expect(result.name).toBe(updateData.name);
      expect(result.role).toBe(updateData.role);
      expect(result.email).toBe(user.email); // Should remain unchanged
    });

    it("should update only specified fields", async () => {
      const user = await global.testPrisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: "USER",
        },
      });

      const newName = faker.person.fullName();
      const result = await userRepo.updateUser(user.id, { name: newName });
      if (!result) {
        fail("Update result was null");
      }

      expect(result.name).toBe(newName);
      expect(result.email).toBe(user.email); // Unchanged
      expect(result.role).toBe(user.role); // Unchanged
    });

    it("should return null for non-existent user", async () => {
      await expect(
        userRepo.updateUser(99999, {
          name: faker.person.fullName(),
        }),
      ).rejects.toThrow();
    });

    it("should throw error when updating to duplicate email", async () => {
      const existingUser = await global.testPrisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
        },
      });

      const userToUpdate = await global.testPrisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
        },
      });

      await expect(
        userRepo.updateUser(userToUpdate.id, {
          email: existingUser.email, // Duplicate email
        }),
      ).rejects.toThrow();
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const user = await global.testPrisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
        },
      });

      const result = await userRepo.deleteUser(user.id);
      expect(result).toBe(true);

      // Verify user was actually deleted
      const deletedUser = await global.testPrisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });

    it("should return false for non-existent user", async () => {
      const result = await userRepo.deleteUser(99999);
      expect(result).toBe(false);
    });
  });
});
