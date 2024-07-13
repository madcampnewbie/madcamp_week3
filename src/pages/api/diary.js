import { getToken } from 'next-auth/jwt';
import clientPromise from '../../libs/mongodb';

const secret = process.env.NEXTAUTH_SECRET;

const getDiaries = async (db, userId) => {
  try {
    return await db.collection('diaries').find({ userId }).toArray();
  } catch (error) {
    throw new Error('Failed to fetch diaries');
  }
};

const createDiary = async (db, { title, content, userId }) => {
  const newDiary = {
    title,
    content,
    userId,
    date: new Date(),
  };
  try {
    const result = await db.collection('diaries').insertOne(newDiary);
    return await db.collection('diaries').findOne({ _id: result.insertedId });
  } catch (error) {
    throw new Error('Failed to create diary');
  }
};

export default async (req, res) => {
  const token = await getToken({ req, secret });
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const client = await clientPromise;
  const db = client.db();
  
  const { method } = req;
  const { title, content } = req.body;

  try {
    if (method === 'GET') {
      const diaries = await getDiaries(db, token.id);
      return res.status(200).json(diaries);
    }

    if (method === 'POST') {
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }
      const diary = await createDiary(db, { title, content, userId: token.id });
      return res.status(201).json(diary);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(`${method} request failed:`, error);
    res.status(500).json({ message: error.message, error: error.message });
  }
};
