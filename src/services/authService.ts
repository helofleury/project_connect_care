export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const authService = {
  async signIn(
    email: string,
    _password: string
  ): Promise<AuthUser> {
    // Authentication API or Firebase integration will be added here.

    return {
      id: "1",
      name: "João",
      email,
    };
  },

  async signUp(
    name: string,
    email: string,
    _password: string
  ): Promise<AuthUser> {
    // Registration API or Firebase integration will be added here.

    return {
      id: "1",
      name,
      email,
    };
  },

  async signOut(): Promise<void> {
    // Authentication logout logic will be added here.
  },
};