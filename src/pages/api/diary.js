import { getToken } from 'next-auth/jwt';
import clientPromise from '../../libs/mongodb';
import { ObjectId } from 'mongodb';

const secret = process.env.NEXTAUTH_SECRET;

const getDiaries = async (db, userId) => {
  try {
    return await db.collection('diaries').find({ userId }).toArray();
  } catch (error) {
    throw new Error('Failed to fetch diaries');
  }
};

const createDiary = async (db, { title, content, userId, weather, musicRecommendations }) => {
  const newDiary = {
    title,
    content,
    weather,
    musicRecommendations,
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

const deleteDiary = async (db, diaryId, userId) => {
  try {
    const result = await db.collection('diaries').deleteOne({ _id: new ObjectId(diaryId), userId });
    if (result.deletedCount === 0) {
      throw new Error('Diary not found or not authorized');
    }
    return result;
  } catch (error) {
    throw new Error('Failed to delete diary');
  }
};

export default async (req, res) => {
  const token = await getToken({ req, secret });
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const client = await clientPromise;
  const db = client.db();

  switch (req.method) {
    case 'GET':
      try {
        const diaries = await getDiaries(db, token.user.id);
        res.status(200).json(diaries);
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch diaries', error: error.message });
      }
      break;
    
    case 'POST':
      const { title, content, weather, musicRecommendations } = req.body;
      if (!title || !content) {
        res.status(400).json({ message: 'Title and content are required' });
        return;
      }
      try {
        const newDiary = await createDiary(db, {
          title,
          content,
          weather,
          musicRecommendations,
          userId: token.user.id,
        });
        res.status(201).json(newDiary);
      } catch (error) {
        res.status(500).json({ message: 'Failed to create diary', error: error.message });
      }
      break;
    
    case 'DELETE':
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ message: 'Diary ID is required' });
        return;
      }
      try {
        await deleteDiary(db, id, token.user.id);
        res.status(200).json({ message: 'Diary deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to delete diary', error: error.message });
      }
      break;
    
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
};
