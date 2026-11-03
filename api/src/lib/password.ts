import argon2 from "argon2";

export function hashearPassword(password: string) {
  return argon2.hash(password);
}

export function verificarPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}