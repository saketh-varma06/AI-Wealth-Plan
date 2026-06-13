const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getExpenses, addExpense, updateExpense, deleteExpense, getExpenseStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `bill-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Only images and PDFs allowed'));
}});

router.get('/', protect, getExpenses);
router.post('/', protect, upload.single('bill'), addExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);
router.get('/stats', protect, getExpenseStats);
module.exports = router;
