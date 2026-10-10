const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Use memory storage for Firebase uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/tiff', 'image/bmp',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents/upload
// Upload a document, save to DB, and trigger async AI processing.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/upload', authenticate, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const {
      bidderId,
      tenderId,
      documentType = 'OTHER',
    } = req.body;

    // Upload to Firebase Storage
    const { getFirebaseAdmin } = require('../config/firebase');
    const admin = getFirebaseAdmin();
    let fileUrl = '';

    if (admin) {
      const bucket = admin.storage().bucket();
      const fileName = `documents/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype }
      });
      await fileUpload.makePublic();
      fileUrl = fileUpload.publicUrl();
    } else {
      // Fallback for development if Firebase is not configured (might break AI service if strictly expecting URL)
      fileUrl = `/uploads/documents/${req.file.originalname}`;
    }

    // Save document record with UPLOADED status
    const document = await prisma.document.create({
      data: {
        bidderId: bidderId || null,
        tenderId: tenderId || null,
        documentType,
        originalName: req.file.originalname,
        fileUrl: fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.id,
        processingStatus: 'UPLOADED',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DOCUMENT_UPLOADED',
        entityType: 'DOCUMENT',
        entityId: document.id,
        bidderId: bidderId || null,
        tenderId: tenderId || null,
        details: {
          documentType,
          fileName: req.file.originalname,
          fileSize: req.file.size,
        },
      },
    });

    // Trigger AI processing asynchronously — don't await
    const aiServiceClient = require('../services/ai/aiServiceClient');
    aiServiceClient.processDocument({
      documentId: document.id,
      bidderId: bidderId || null,
      tenderId: tenderId || null,
      fileUrl: fileUrl, // Sending URL instead of local filePath
      documentType,
      orgName: req.body.orgName || '',
    }).catch(err => {
      console.error('AI processing trigger failed:', err.message);
    });

    res.status(201).json({
      document,
      message: 'Document uploaded. Processing started.',
      processingStatus: 'UPLOADED',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/documents/:id/status
// Internal callback — called by the AI service to update processing status.
// Protected by INTERNAL_SERVICE_KEY header (not Firebase token).
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    // Validate internal service key
    const serviceKey = req.headers['x-internal-service-key'];
    if (!INTERNAL_SERVICE_KEY || INTERNAL_SERVICE_KEY.length < 32 || INTERNAL_SERVICE_KEY.startsWith('CHANGE_ME')) {
      return res.status(503).json({ error: 'Internal service authentication is not configured.' });
    }
    if (serviceKey !== INTERNAL_SERVICE_KEY) {
      return res.status(403).json({ error: 'Invalid internal service key.' });
    }

    const {
      processingStatus,
      extractedText,
      extractedData,
      ocrUsed,
      confidence,
      errorMessage,
    } = req.body;

    const updateData = { processingStatus };
    if (extractedText !== undefined) updateData.extractedText = extractedText;
    if (extractedData !== undefined) updateData.extractedData = extractedData;
    if (ocrUsed !== undefined) updateData.ocrUsed = ocrUsed;
    if (confidence !== undefined) updateData.confidence = confidence;
    if (processingStatus === 'READY_FOR_REVIEW' || processingStatus === 'FAILED') {
      updateData.processedAt = new Date();
    }

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ id: updated.id, processingStatus: updated.processingStatus });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Document not found.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id/status
// Poll endpoint for frontend ProcessingStatusTracker (Spec §26).
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/status', authenticate, async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        processingStatus: true,
        ocrUsed: true,
        confidence: true,
        processedAt: true,
        originalName: true,
        documentType: true,
      },
    });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id
// Full document record with chunks.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { chunks: { orderBy: { chunkIndex: 'asc' } } },
    });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/documents/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize('ADMIN', 'PROCUREMENT_OFFICER'), async (req, res) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ message: 'Document deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
