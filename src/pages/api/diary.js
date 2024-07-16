import { getToken } from 'next-auth/jwt';
import clientPromise from '../../libs/mongodb';

const secret = process.env.NEXTAUTH_SECRET;

export default async (req, res) => {
  const token = await getToken({ req, secret });
  console.log("Token:", token);
  const client = await clientPromise;
  const db = client.db();

  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const diaries = await db.collection('diaries').find({ userId: token.user.id }).toArray();
      res.status(200).json(diaries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch diaries', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { title, content, weather } = req.body; // 날씨 데이터를 받도록 변경
    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }
    const newDiary = {
      title,
      content,
      weather, // 날씨 데이터를 포함
      userId: token.user.id,
      date: new Date(),
    };
    try {
      const result = await db.collection('diaries').insertOne(newDiary);
      const insertedDiary = await db.collection('diaries').findOne({ _id: result.insertedId });
      res.status(201).json(insertedDiary);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create diary', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
