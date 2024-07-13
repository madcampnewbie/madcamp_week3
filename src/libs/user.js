import bcrypt from 'bcryptjs';
import clientPromise from './mongodb';

export async function createUser(email, password, name) {
  const client = await clientPromise;
  const db = client.db();

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = await db.collection('users').insertOne({
    email,
    password: hashedPassword,
    name,
  });

  return result;
}
