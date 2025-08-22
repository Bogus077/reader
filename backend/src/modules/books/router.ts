import express from 'express';
import requireAuth from '../../middleware/requireAuth';
import Book from './model';

const router = express.Router();

/**
 * Получение списка всех доступных книг
 * GET /books/available
 */
router.get('/available', requireAuth, async (req, res) => {
  try {
    const books = await Book.findAll({
      attributes: ['id', 'title', 'author', 'category', 'difficulty', 'description', 'cover_url', 'source_url']
    });
    
    return res.json({
      ok: true,
      books
    });
  } catch (error) {
    console.error('Error fetching available books:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

export default router;
