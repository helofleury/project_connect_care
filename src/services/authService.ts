
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";

const API_URL = "http://192.168.15.5:8000";

export interface RegisterData {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  vin_hash: string;
}

export const authService = {
  async register({
    name,
    last_name,
    email,
    phone,
    password,
    vin_hash,
  }: RegisterData) {
    /*
     * 1. Cria o usuário no Firebase Authentication.
     */
    console.log("1 - tentando criar usuário no Firebase");

    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    console.log(
      "2 - usuário criado no Firebase:",
      credential.user.uid
    );

    const user = credential.user;

    /*
     * Dados que serão enviados para o PostgreSQL
     * através da API.
     */
    const registerPayload = {
      firebase_uid: user.uid,
      name: name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      vin_hash: vin_hash.trim(),
    };

    console.log("3 - enviando cadastro para /auth/register");

    try {
      /*
       * 2. Envia os dados para o backend.
       */
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(registerPayload),
        }
      );

      console.log(
        "4 - status do /auth/register:",
        response.status
      );

      /*
       * Tenta ler a resposta do backend.
       */
      const data = await response.json();

      console.log(
        "5 - resposta do /auth/register:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Não foi possível cadastrar o cliente."
        );
      }

      console.log(
        "6 - cliente cadastrado com sucesso no PostgreSQL"
      );

      return {
        user,
        customer: data.customer,
      };
    } catch (error) {
      /*
       * Se o erro for de rede.
       */
      const isNetworkError =
        error instanceof TypeError ||
        (error instanceof Error &&
          /network/i.test(error.message));

      if (isNetworkError) {
        console.error(
          `[authService.register] Não foi possível alcançar o backend em ${API_URL}. ` +
            "Verifique se o servidor (uvicorn) está rodando e se o celular está na mesma rede Wi-Fi do computador.",
          error
        );
      }

      /*
       * Se o Firebase criou o usuário, mas o cadastro
       * no PostgreSQL falhou, removemos o usuário do Firebase
       * para não deixar uma conta incompleta.
       */
      try {
        await user.delete();

        console.log(
          "7 - usuário removido do Firebase porque o cadastro no PostgreSQL falhou"
        );
      } catch (deleteError) {
        console.error(
          "Não foi possível remover o usuário do Firebase:",
          deleteError
        );
      }

      if (isNetworkError) {
        throw new Error(
          `Não foi possível conectar ao servidor (${API_URL}). ` +
            "Verifique se o backend está rodando e se o celular está na mesma rede Wi-Fi do computador."
        );
      }

      throw error;
    }
  },

  async login(
    email: string,
    password: string
  ) {
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    const user = credential.user;

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            firebase_uid: user.uid,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Cliente não encontrado no ConnectCare."
        );
      }

      return {
        user,
        customer: data.customer,
      };
    } catch (error) {
      await signOut(auth);
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
  },
};
