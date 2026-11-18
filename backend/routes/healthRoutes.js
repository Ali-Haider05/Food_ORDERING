const express = require('express');

const router = express.Router();

router.get('/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'Food Ordering Backend is running',
    database: 'NeDB',
  });
});

module.exports = router;
