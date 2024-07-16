import { ObjectId } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import clientPromise from '../../libs/mongodb';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const client = await clientPromise;
  const db = client.db();
  const userCollection = db.collection('users');

  if (req.method === 'POST') {
    const { genres } = req.body;
    if (!Array.isArray(genres)) {
      return res.status(400).json({ message: 'Genres should be an array' });
    }
    try {
      const result = await userCollection.updateOne(
        { _id: new ObjectId(token.user.id) },
        { $set: { genres } },
        { upsert: true }
      );
      if (result.modifiedCount === 0 && result.upsertedCount === 0) {
        return res.status(404).json({ message: 'No document matched or modified' });
      }
      return res.status(200).json({ message: 'Genres saved successfully' });
    } catch (error) {
      console.error('Failed to save genres', error);
      return res.status(500).json({ message: 'Failed to save genres', error: error.toString() });
    }
  } else if (req.method === 'GET') {
    try {
      const user = await userCollection.findOne({ _id: new ObjectId(token.user.id) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ genres: user.genres || [] });
    } catch (error) {
      console.error('Failed to fetch genres', error);
      return res.status(500).json({ message: 'Failed to fetch genres', error: error.toString() });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
