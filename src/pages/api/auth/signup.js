import { createUser } from '../../../libs/user';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, name } = req.body;
    try {
      const result = await createUser(email, password, name);
      res.status(201).json({ message: 'User created successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create user', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
