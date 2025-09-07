import { User } from "@shared/schema";

// Simple auth functions for handling login/logout
export const auth = {
  getUser: (): User | null => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    return null;
  },

  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },

  logout: (): void => {
    localStorage.removeItem("user");
  }
};