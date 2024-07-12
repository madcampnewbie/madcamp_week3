// src/pages/api/diary.js
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === 'POST') {
    const { title, content } = req.body;
    const result = await db.collection('diaries').insertOne({
      title,
      content,
      date: new Date(),
    });
    res.status(201).json({ _id: result.insertedId, title, content, date: new Date() });
  } else if (req.method === 'GET') {
    const diaries = await db.collection('diaries').find({}).toArray();
    res.status(200).json(diaries);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
